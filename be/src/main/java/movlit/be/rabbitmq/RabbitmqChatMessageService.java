package movlit.be.rabbitmq;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.pub_sub.chatMessage.application.service.ChatMessageService;
import movlit.be.pub_sub.chatMessage.entity.ChatMessage;
import movlit.be.pub_sub.chatMessage.infra.persistence.mongo.ChatMessageMongoRepository;
import movlit.be.pub_sub.chatMessage.presentation.dto.response.ChatMessageDto;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class RabbitmqChatMessageService {

    private final ChatMessageService chatMessageService;
    private final RabbitmqChatMessagePublisher messagePublisher;
    private final ChatMessageMongoRepository chatMessageMongoRepository;

    public ChatMessageDto processAndSendMessage(ChatMessageDto chatMessageDto) {
        // MongoDB 저장
        ChatMessage savedMessage = this.saveMessage(chatMessageDto);
        messagePublisher.sendMessage(chatMessageDto);

        return chatMessageDto;
    }

    private ChatMessage saveMessage(ChatMessageDto chatMessageDto) {
        ChatMessage chatMessage = ChatMessage.builder()
                .roomId(chatMessageDto.getRoomId())
                .senderId(chatMessageDto.getSenderId())
                .message(chatMessageDto.getMessage())
                .build();

        return chatMessageMongoRepository.save(chatMessage);
    }

    public List<ChatMessageDto> getChatMessages(Long roomId) {
        List<ChatMessage> chatMessages = chatMessageMongoRepository.findByRoomId(roomId);
        log.info("=== chatMessages : {}", chatMessages);
        return chatMessages.stream().map(c -> ChatMessageDto.builder()
                .roomId(c.getRoomId())
                .senderId(c.getSenderId())
                .message(c.getMessage())
                .regDt(LocalDateTime.parse(c.getTimestamp())).build()).toList();
    }
}
