package movlit.be.rabbitmq;

import lombok.RequiredArgsConstructor;
import movlit.be.pub_sub.chatMessage.entity.ChatMessage;
import movlit.be.pub_sub.chatMessage.presentation.dto.response.ChatMessageDto;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequiredArgsConstructor
public class RabbitmqChatMessageController {
    private final RabbitmqChatMessageService chatMessageService;

    @MessageMapping("/chat/message.send")
    public ResponseEntity<String> sendMessage(@RequestParam ChatMessageDto chatMessageDto) {
        // 클라이언트로부터 들어온 메시지를 RabbitMQ로 발행
        chatMessageService.processAndSendMessage(chatMessageDto);
        return ResponseEntity.ok("Message sent: " + chatMessageDto);
    }
}
