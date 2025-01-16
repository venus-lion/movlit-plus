package movlit.be.rabbitmq;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.pub_sub.chatMessage.entity.ChatMessage;
import movlit.be.pub_sub.chatMessage.presentation.dto.response.ChatMessageDto;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

/**
 * @RabbitListner : 지정된 큐(chat.queue)에서 메시지 수신,
 * 수신된 메시지는 WebSocket 주제 "/topic/chat"로 전송.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RabbitmqChatMessageListener {
    private final SimpMessagingTemplate messagingTemplate;

    @RabbitListener(queues = RabbitMQConfig.QUEUE_NAME)
    public void receiveMessage(ChatMessageDto chatMessageDto) {
        // RabbitMQ로부터 메시지를 수신하면, WebSocket을 통해 클라이언트에게 전달
        // + 채팅방 ID 추출 등 추가 로직 필요

        log.info("RabbitMQ Received Message: {}", chatMessageDto);
        messagingTemplate.convertAndSend("/topic/chat" + chatMessageDto.getRoomId(), chatMessageDto);
    }
}
