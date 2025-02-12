package movlit.be.chat_room.application.service;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.Future;
import java.util.concurrent.ThreadPoolExecutor;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;
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
    private final ThreadPoolExecutor threadPoolExecutor; // Consider using ExecutorService instead

    private static final String GROUP_CHATROOM_QUEUE_KEY_PREFIX = "groupChatroomQueue:";

    public Optional<Map<String, String>> requestChatroomCreation(String contentId) {
        Callable<Optional<Map<String, String>>> task = () -> {
            String queueKey = GROUP_CHATROOM_QUEUE_KEY_PREFIX + contentId;

            Object memberIdObject = redisTemplate.opsForList()
                    .rightPop(queueKey, 10, TimeUnit.SECONDS); // Added timeout

            if (memberIdObject instanceof String memberId) {
                Map<String, String> resultMap = new HashMap<>();
                resultMap.put(contentId, memberId);
                return Optional.of(resultMap);
            }

            return Optional.empty();
        };

        try {
            Future<Optional<Map<String, String>>> future = threadPoolExecutor.submit(task);
            return future.get(30, TimeUnit.SECONDS);

        } catch (InterruptedException | ExecutionException | TimeoutException e) {
            if (e instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }

            throw new GroupChatroomCreationWhenWorkingException();
        }
    }

}