package movlit.be.pub_sub.chatMessage.presentation;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.pub_sub.RedisMessagePublisher;
import movlit.be.pub_sub.chatMessage.application.service.ChatMessageService;
import movlit.be.pub_sub.chatMessage.presentation.dto.response.ChatMessageDto;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ChatMessageController {

    private final ChatMessageService chatMessageService;
    //    private final RedisTemplate<String, Object> redisTemplate;
//    private final RedisMessagePublisher redisPublisher;
    private final ObjectMapper objectMapper; // Bean 등록해두고 주입 받으면 좋음

    // 클라이언트가 "/app/chat/message" 로 STOMP 메시지를 보내면 이 메서드가 처리
    @MessageMapping("/chat/message--")
    public void message(ChatMessageDto message) throws Exception {
        log.info("Received chat message: {}", message);

        // (1) Redis에 메시지 임시 저장
        // 여기서는 "chatMessages" 라는 key의 List에 push하는 예시
//        redisTemplate.opsForList().rightPush("chatMessages", message);

        // (2) Redis Publish -> 실시간으로 WebSocket 구독자에게 전달
//        redisPublisher.publish(message);

        //    - pub/sub 메시지는 JSON 형태로 직렬화해서 보낼 수 있음
//        String jsonString = objectMapper.writeValueAsString(message);
//        redisPublisher.publish(jsonString);
    }

}
