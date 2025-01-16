package movlit.be.pub_sub;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.pub_sub.chatMessage.presentation.dto.response.ChatMessageDto;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;

/**
 * 메시지 발행자(Publisher) 구현
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RedisMessagePublisher {

//    private final RedisTemplate<String, Object> redisTemplate;
//    private final ChannelTopic topic;
//
//    public void publish(ChatMessageDto chatMessageDto) {
//        log.info("Publishing chat message {}", chatMessageDto);
//        redisTemplate.convertAndSend(topic.getTopic(), chatMessageDto);
//    }

}
