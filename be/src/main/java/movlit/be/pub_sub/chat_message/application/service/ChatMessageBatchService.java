package movlit.be.pub_sub.chat_message.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.pub_sub.chat_message.domain.ChatMessage;
import movlit.be.pub_sub.chat_message.infra.persistence.mongo.ChatMessageMongoRepository;
import movlit.be.pub_sub.chat_message.presentation.dto.response.ChatMessageDto;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class ChatMessageBatchService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ChatMessageMongoRepository chatMessageMongoRepository;

    @Scheduled(fixedRate = 5000)
    public void flushChatMessagesToMongo() {
        // Redis List 사이즈 확인
        Long size = redisTemplate.opsForList().size("chatMessages");
        if (size != null && size > 100) {
            // 100개 이상 쌓이면 MongoDB로 flush
            log.info("Flush triggered. Redis List size: {}", size);

            for (int i = 0; i < size; i++) {
                Object popped = redisTemplate.opsForList().leftPop("chatMessages");
                if (popped instanceof ChatMessageDto) {
                    ChatMessage chatMessage = ChatMessage.builder()
                            .roomId(((ChatMessageDto) popped).getRoomId())
                            .senderId(((ChatMessageDto) popped).getSenderId())
                            .message(((ChatMessageDto) popped).getMessage())
                            .build();
                    chatMessageMongoRepository.save(chatMessage);
                }
            }
        }
    }

}
