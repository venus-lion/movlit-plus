package movlit.be.rabbitmq;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.pub_sub.chatMessage.entity.ChatMessage;
import movlit.be.pub_sub.chatMessage.presentation.dto.response.ChatMessageDto;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class RabbitmqChatMessagePublisher {

    private final RabbitTemplate rabbitTemplate;

    // 메시지를 교환기로 발행
    public void sendMessage(ChatMessageDto chatMessageDto) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.EXCHANGE_NAME, RabbitMQConfig.ROUTING_KEY, chatMessageDto);
        log.info("RabbitMQ Message sent: {}", chatMessageDto);
    }
}
