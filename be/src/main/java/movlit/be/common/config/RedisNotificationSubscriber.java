package movlit.be.common.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.pub_sub.notification.application.dto.NotificationDto;
import movlit.be.pub_sub.notification.application.service.SseEmitterService;
import org.springframework.stereotype.Service;

/**
 * 알림 메시지 수신자(Subscriber) 구현
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class RedisNotificationSubscriber {

    private final ObjectMapper objectMapper;
    private final SseEmitterService sseEmitterService; // SSE Emitter 관리 서비스

    /**
     * Redis에서 알림 메시지가 발행(publish)되면
     * 대기하고 있던 Redis Subscriber가 해당 메시지를 받아 처리한다.
     */
    public void onNotification(String publishMessage) {
        try {
            NotificationDto notificationDto = objectMapper.readValue(publishMessage, NotificationDto.class);
            log.info("Received notificationDto: {}", notificationDto);

            // SSE Emitter를 통해 클라이언트에게 알림 전송
            sseEmitterService.sendNotification(notificationDto.getId(), notificationDto);

        } catch (Exception e) {
            log.error("Exception in onNotification {}", e);
        }
    }

}