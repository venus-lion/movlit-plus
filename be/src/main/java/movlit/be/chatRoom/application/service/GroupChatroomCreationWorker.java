package movlit.be.chatRoom.application.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadPoolExecutor;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.common.exception.GroupChatroomCreationWhenWorkingException;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class GroupChatroomCreationWorker {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ThreadPoolExecutor threadPoolExecutor;

    private static final String GROUP_CHATROOM_QUEUE_KEY_PREFIX = "groupChatroomQueue:";

    public Optional<Map<String, String>> requestChatroomCreation(String contentId) {
        // 스레드 풀을 사용하여 비동기 작업 실행
        Future<Optional<Map<String, String>>> future = threadPoolExecutor.submit(() -> {
            String queueKey = GROUP_CHATROOM_QUEUE_KEY_PREFIX + contentId;

            while (true) {
                // Redis Queue에서 memberId를 value로 꺼내옴 (RPOP)
                Object memberIdObject = redisTemplate.opsForList().rightPop(queueKey);

                if (memberIdObject == null) {
                    // 큐가 비어있으면 빈 Optional 반환
                    return Optional.empty();
                }

                if (!(memberIdObject instanceof String memberId)) {
                    log.error("Invalid memberId type for contentId: {}. Expected String, but got: {}", contentId,
                            memberIdObject.getClass().getName());
                    continue;
                }

                // contentId와 memberId를 Map에 담아서 Optional로 감싸서 반환
                Map<String, String> resultMap = new HashMap<>();
                resultMap.put(contentId, memberId);
                return Optional.of(resultMap);
            }
        });

        try {
            // 비동기 작업 결과 가져오기
            return future.get();
        } catch (InterruptedException | ExecutionException e) {
            log.error("Error while getting result from worker thread", e);
            throw new GroupChatroomCreationWhenWorkingException();
        }
    }

}