package movlit.be.pub_sub.chatMessage.application.service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.common.exception.RedisStreamOperationReturnNull;
import movlit.be.common.util.ids.MemberId;
import movlit.be.common.util.ids.OneononeChatroomId;
import movlit.be.member.application.service.MemberReadService;
import movlit.be.pub_sub.RedisMessagePublisher;
import movlit.be.pub_sub.RedisNotificationPublisher;
import movlit.be.pub_sub.chatMessage.domain.ChatMessage;
import movlit.be.pub_sub.chatMessage.infra.persistence.ChatMessageRepository;
import movlit.be.pub_sub.chatMessage.presentation.dto.response.ChatMessageDto;
import movlit.be.pub_sub.chatMessage.presentation.dto.response.MessageType;
import movlit.be.pub_sub.chatRoom.application.service.OneononeChatroomService;
import movlit.be.pub_sub.chatRoom.presentation.dto.OneononeChatroomResponse;
import movlit.be.pub_sub.notification.NotificationDto;
import movlit.be.pub_sub.notification.NotificationMessage;
import movlit.be.pub_sub.notification.NotificationService;
import movlit.be.pub_sub.notification.NotificationType;
import movlit.be.pub_sub.notification.NotificationUseCase;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatMessageService {

    private final ChatMessageRepository chatMessageRepository;
    private final RedisMessagePublisher messagePublisher;
    private final RedisTemplate<String, String> redisTemplate;
    private final RedisNotificationPublisher redisNotificationPublisher;
    private final NotificationUseCase notificationUsecase;
    private final NotificationService notificationService;

    private static final String MESSAGE_QUEUE = "chat_message_queue";   // 큐 이름 (채팅방마다 별도의 큐를 사용할 수 있음)
    private final MemberReadService memberReadService;
    private final OneononeChatroomService oneononeChatroomService;

    @Value("${share.url}")
    private String basicUrl;

    // 가장 최근 채팅 메시지 가져오기 (채팅 리스트에서 화면 표시)
    public ChatMessageDto fetchRecentMessage(String roomId) {
        return chatMessageRepository.findTopByRoomIdOrderByTimestampDesc(roomId);
    }

    // 일대일 채팅방 sendMessage
    @Transactional
    public void sendMessageForOneOnOne(ChatMessageDto chatMessageDto) {
        chatMessageDto.setMessageType(MessageType.ONE_ON_ONE);

        // Producer : 메시지를 Redis Stream 에 추가
        produceChatMessage(chatMessageDto);

        messagePublisher.sendMessage(chatMessageDto);

        // 알림 발행 로직
        publishOneOnOneNotification(chatMessageDto);
    }

    private void publishOneOnOneNotification(ChatMessageDto chatMessageDto) {
        OneononeChatroomId roomId = new OneononeChatroomId(chatMessageDto.getRoomId());
        OneononeChatroomResponse roomInfo = oneononeChatroomService.fetchChatroomInfo(roomId,
                chatMessageDto.getSenderId());

        String senderNickname = memberReadService.findByMemberId(chatMessageDto.getSenderId()).getNickname();
        String roomIdStr = roomInfo.getRoomId().getValue();
        log.info("====== basic url =======, {}", basicUrl);
        String url = basicUrl + "/chatMain/" + roomIdStr + "/personal";

        NotificationDto notification = new NotificationDto(
                roomIdStr,
                NotificationMessage.generateChatMessage(senderNickname, chatMessageDto.getMessage()),
                NotificationType.ONE_ON_ONE_CHAT,
                url
        );

        // Notification Redis Publish (SSE 알림)
        redisNotificationPublisher.publishNotification(notification);
        // Notification MongoDB에 저장
        notificationService.saveNotification(notification);
    }

    // 그룹 채팅방 sendMessage
    @Transactional
    public void sendMessageForGroup(ChatMessageDto chatMessageDto) {
        chatMessageDto.setMessageType(MessageType.GROUP);

        // Producer : 메시지를 Redis Stream 에 추가
        produceChatMessage(chatMessageDto);

        messagePublisher.sendMessage(chatMessageDto);

        notificationUsecase.groupChatroomMessageNotification(chatMessageDto);   // 그룹 채팅방 메시지 전송 알림
    }

    // 해당 채팅방의 읽지 않은 메시지 갯수 return
    public Long fetchCountUnreadMessages(OneononeChatroomId roomId, MemberId memberId) {
        return chatMessageRepository.findCountUnreadMessages(roomId.getValue(), memberId);
    }

    // 해당 채팅방의 읽지 않은 메시지 return
    public List<ChatMessage> fetchUnreadMessages(OneononeChatroomId roomId, MemberId memberId) {
        return chatMessageRepository.findUnreadMessages(roomId.getValue(), memberId);
    }

    // TODO : 채팅 읽음 처리
    public void updateMessageAsRead(String roomId, MemberId memberId) {
        
    }

    /**
     * 채팅방의 채팅목록 가져오기
     */
    public List<ChatMessageDto> fetchChatMessages(String roomId) {
        List<ChatMessage> chatMessages = chatMessageRepository.findByRoomId(roomId);
        if (chatMessages.isEmpty()) {
            return new ArrayList<>();       // 빈 값 전달
        }

        log.info("=== chatMessages : {}", chatMessages);
        // TODO : Converter 나중에 빼기
        return chatMessages.stream().map(
                c -> new ChatMessageDto(
                        c.getRoomId(),
                        c.getSenderId(),
                        c.getMessage(),
                        c.getTimestamp()
                )
        ).toList();
    }

    private void produceChatMessage(ChatMessageDto chatMessageDto) {
        // Produce : 메시지를 Redis Stream 에 추가
        RecordId recordId = Optional.ofNullable(redisTemplate.opsForStream().add(
                MESSAGE_QUEUE, convertToMap(chatMessageDto)
        )).orElseThrow(RedisStreamOperationReturnNull::new);

        String messageId = recordId.toString();
    }

    // DTO -> Map 변환
    private Map<String, String> convertToMap(ChatMessageDto chatMessageDto) {
        return Map.of(
                "roomId", chatMessageDto.getRoomId(),
                "senderId", chatMessageDto.getSenderId().getValue(),
                "message", chatMessageDto.getMessage(),
                "regDt", chatMessageDto.getRegDt().toString(),
                "messageType", chatMessageDto.getMessageType().toString()
        );
    }

}
