package movlit.be.pub_sub.chat_message.application.service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.pub_sub.chat_message.domain.ChatMessage;
import movlit.be.pub_sub.chat_message.infra.persistence.ChatMessageRepository;
import movlit.be.pub_sub.chat_message.presentation.dto.response.ChatMessageDto;
import movlit.be.common.util.ids.MemberId;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StreamOperations;
import org.springframework.data.redis.stream.StreamListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
@RequiredArgsConstructor
public class ChatMessageStreamListener implements StreamListener<String, MapRecord<String, String, String>> {

    private final ChatMessageRepository chatMessageRepository;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String MESSAGE_QUEUE = "chat_message_queue";
    private static final String CONSUMER_GROUP = "chat_message_group";

    @Override
    public void onMessage(MapRecord<String, String, String> message) {
        log.info("Processing message in StreamListener : {}", message);
        try {
            // Redis Stream 메시지를 DTO로 변환
            ChatMessageDto chatMessageDto = convertFromMap(message.getValue());

            // MongoDB에 저장
            saveMessageToMongoDB(chatMessageDto);

            // 처리 완료 후 Ack 전송
            acknowledgeMessage(message);

        } catch (Exception e) {
            log.error("메시지 처리 중 예외 발생: {}", e);
        }
    }

    // 메시지 처리 후 Ack 전송
    private void acknowledgeMessage(MapRecord<String, String, String> record) {
        StreamOperations<String, String, String> streamOps = redisTemplate.opsForStream();
        streamOps.acknowledge(MESSAGE_QUEUE, CONSUMER_GROUP, record.getId());
        log.info("Message acknowledged: {}", record.getId());
    }

    // ChatMessage MongoDB 저장
    private void saveMessageToMongoDB(ChatMessageDto chatMessageDto) {
        ChatMessage chatMessage = ChatMessage.builder()
                .roomId(chatMessageDto.getRoomId())
                .senderId(chatMessageDto.getSenderId())
                .message(chatMessageDto.getMessage())
                .regDt(chatMessageDto.getRegDt())
                .messageType(chatMessageDto.getMessageType())
                .build();
        log.info("==== save MongoDB : {}", chatMessage);
        chatMessageRepository.saveMessage(chatMessage);
    }

    // Map -> DTO 변환
    private ChatMessageDto convertFromMap(Map<String, String> map) {
        // MongoDB로 저장 시 양 끝에 " 따옴표 처리 해줌
        DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
        String regDtString = map.get("regDt").replaceAll("\"", ""); // 따옴표 제거
        LocalDateTime regDt = LocalDateTime.parse(regDtString, formatter);
        return new ChatMessageDto(
                map.get("roomId").replaceAll("^\"|\"$", ""),
                new MemberId(map.get("senderId").replaceAll("^\"|\"$", "")),
                map.get("message").replaceAll("^\"|\"$", ""),
                regDt.format(formatter)
        );
    }

}
