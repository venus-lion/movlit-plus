package movlit.be.pub_sub.notification.application.service;

import java.io.IOException;
import java.time.Duration;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.pub_sub.notification.application.dto.NotificationDto;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import org.springframework.scheduling.concurrent.ThreadPoolTaskScheduler;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Service
@Slf4j
@RequiredArgsConstructor
public class SseEmitterService {

    private final ThreadPoolTaskScheduler taskScheduler;
    private final Map<String, SseEmitter> emitters = new ConcurrentHashMap<>(512);
    private final Map<String, ScheduledFuture<?>> heartbeatTasks = new ConcurrentHashMap<>(512);
    private final Map<String, Boolean> emitterCompletionStatus = new ConcurrentHashMap<>(512);
    private final ThreadPoolTaskExecutor threadPoolTaskExecutor;

    public SseEmitter addEmitter(String id) {
        SseEmitter emitter = createSseEmitter(id);

        try {
            emitter.send(SseEmitter.event()
                    .id(UUID.randomUUID().toString())
                    .name("connect")
                    .data("connected!")
                    .reconnectTime(45_000));

            scheduleHeartbeat(id, emitter);
            emitters.put(id, emitter);
            emitterCompletionStatus.put(id, false);

        } catch (IOException e) {
            log.error("초기 연결 실패: {}", id, e);
            completeEmitter(id, e);
        }
        return emitter;
    }

    private SseEmitter createSseEmitter(String id) {
        SseEmitter emitter = new SseEmitter(TimeUnit.MINUTES.toMillis(30));
        emitter.onCompletion(() -> completeEmitter(id, null));
        emitter.onTimeout(() -> completeEmitter(id, new TimeoutException("Emitter timeout")));
        emitter.onError(e -> completeEmitter(id, e));
        return emitter;
    }

    private void scheduleHeartbeat(String id, SseEmitter emitter) {
        ScheduledFuture<?> heartbeat = taskScheduler.scheduleAtFixedRate(
                () -> checkEmitterStatus(id),
                Duration.ofSeconds(30) // 30초 간격
        );
        heartbeatTasks.put(id, heartbeat);
    }

    private void checkEmitterStatus(String id) {
        // computeIfAbsent 를 사용해서 동시성 제어
        emitterCompletionStatus.computeIfAbsent(id, k -> false); // 없으면 false로 초기화

        if (!emitters.containsKey(id) || Boolean.TRUE.equals(emitterCompletionStatus.get(id))) {
            cancelHeartbeat(id);
            return;
        }

        try {
            emitters.get(id).send(SseEmitter.event()
                    .id(UUID.randomUUID().toString())
                    .name("heartbeat")
                    .comment("Active connections: " + emitters.size())
                    .data("keep-alive"));
        } catch (IOException e) {
            log.warn("하트비트 전송 실패: {}", id);
            completeEmitter(id, e);
        }
    }

    private void completeEmitter(String id, Throwable error) {
        // computeIfAbsent 를 사용해서 동시성 제어
        emitterCompletionStatus.computeIfAbsent(id, k -> false);
        if (Boolean.TRUE.equals(emitterCompletionStatus.get(id))) {
            return;
        }

        emitterCompletionStatus.put(id, true); // 먼저 완료 상태를 true로 변경
        SseEmitter emitter = emitters.remove(id);
        cancelHeartbeat(id);

        if (emitter != null) {
            Future<?> future = threadPoolTaskExecutor.submit(() -> { //submit으로 변경
                if (error != null) {
                    emitter.completeWithError(error);
                } else {
                    emitter.complete();
                }
            });
            try {
                future.get(5, TimeUnit.SECONDS); // 타임아웃 설정 (옵션)
            } catch (InterruptedException | ExecutionException | TimeoutException e) {
                log.error("Emitter complete 작업 실패", e);
            }
        }
    }

    private void cancelHeartbeat(String id) {
        ScheduledFuture<?> task = heartbeatTasks.remove(id);
        if (task != null) {
            task.cancel(true);
        }
    }

    public void sendNotification(String id, NotificationDto notification) {
        Future<?> future = threadPoolTaskExecutor.submit(() -> { //submit으로 변경
            SseEmitter emitter = emitters.get(id);
            if (emitter != null) {
                try {
                    emitter.send(SseEmitter.event()
                            .id(UUID.randomUUID().toString())
                            .name("notification")
                            .data(notification));
                } catch (IOException e) {
                    log.error("알림 전송 실패: {}", id, e);
                    completeEmitter(id, e);
                }
            }
        });

    }
}