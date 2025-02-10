package movlit.be.chatMessage.application.service;

import jakarta.annotation.PostConstruct;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.connection.stream.Consumer;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.connection.stream.ReadOffset;
import org.springframework.data.redis.connection.stream.StreamOffset;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;
import org.springframework.data.redis.stream.Subscription;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class ChatMessageConsumer {

    private final RedisTemplate<String, Object> redisTemplate;
    private final StreamMessageListenerContainer<String, MapRecord<String, String, String>> streamMessageListenerContainer;
    private final ChatMessageStreamListener chatMessageStreamListener;

    private static final String MESSAGE_QUEUE = "chat_message_queue";   // 큐 이름 (채팅방마다 별도의 큐를 사용할 수 있음)
    private static final String CONSUMER_GROUP = "chat_message_group";  // Consumer 그룹 이름
    private static final String CONSUMER_NAME = "chat_message_consumer";  // Consumer 이름

    // 구독(Subscription)을 필드에 보관하여 종료 시점에 취소할 수 있게 함
    private Subscription subscription;

    @PostConstruct
    public void init() {
        log.info("==== ChatMessageConsumer init()");
        createConsumerGroup();

        // Listener Container 시작
        subscription = streamMessageListenerContainer.receive(
                Consumer.from(CONSUMER_GROUP, CONSUMER_NAME),
                StreamOffset.create(MESSAGE_QUEUE, ReadOffset.lastConsumed()),
                chatMessageStreamListener
        );
    }

    // 컨슈머 그룹 생성
    private void createConsumerGroup() {
        try {
            redisTemplate.opsForStream().createGroup(MESSAGE_QUEUE, CONSUMER_GROUP);
            log.info("Consumer group {} created for stream {}", CONSUMER_GROUP, MESSAGE_QUEUE);
        } catch (Exception e) {
            log.warn("Consumer group {} already exists for stream {}", CONSUMER_GROUP, MESSAGE_QUEUE);
        }
    }

    // 애플리케이션 종료 시 호출되어 리스너와 컨테이너를 종료
    @PreDestroy
    public void shutdown() {
        if (subscription != null) {
            subscription.cancel();
            log.info("Subscription cancelled.");
        }
        if (streamMessageListenerContainer != null && streamMessageListenerContainer.isRunning()) {
            streamMessageListenerContainer.stop();
            log.info("StreamMessageListenerContainer stopped.");
        }
    }

}
