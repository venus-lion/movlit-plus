package movlit.be.pub_sub.notification;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.chat_room.application.service.GroupChatroomService;
import movlit.be.pub_sub.chat_message.presentation.dto.response.ChatMessageDto;
import movlit.be.chat_room.application.service.GroupChatroomUseCase;
import movlit.be.chat_room.application.service.OneononeChatroomService;
import movlit.be.chat_room.presentation.dto.GroupChatroomMemberResponse;
import movlit.be.chat_room.presentation.dto.OneononeChatroomResponse;
import movlit.be.common.config.RedisNotificationPublisher;
import movlit.be.common.util.ids.GroupChatroomId;
import movlit.be.common.util.ids.OneononeChatroomId;
import movlit.be.member.application.service.MemberReadService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationUseCase {

    private final MemberReadService memberReadService;
    private final RedisNotificationPublisher redisNotificationPublisher;
    private final GroupChatroomUseCase groupChatroomUseCase;
    private final OneononeChatroomService oneononeChatroomService;
    private final NotificationService notificationService;
    private final GroupChatroomService groupChatroomService;

    @Value("${share.url}")
    private String basicUrl;

    // 그룹 채팅방 메시지 전송 알림
    public void publishGroupChatMessageNotification(ChatMessageDto chatMessageDto) {
        String roomName = groupChatroomService.fetchGroupChatroomById(new GroupChatroomId(chatMessageDto.getRoomId()))
                .getRoomName();
        GroupChatroomId groupChatroomId = new GroupChatroomId(chatMessageDto.getRoomId());
        List<GroupChatroomMemberResponse> responseList = groupChatroomUseCase.fetchMembersInGroupChatroom(
                groupChatroomId, true);

        String senderNickname = memberReadService.findByMemberId(chatMessageDto.getSenderId()).getNickname();
        String message = NotificationMessage.generateGroupChatMessage(senderNickname, roomName,
                chatMessageDto.getMessage());

        // 발신자를 제외한 멤버들에게 알림 전송
        String senderId = chatMessageDto.getSenderId().getValue();
        String url = basicUrl + "/chatMain/" + chatMessageDto.getRoomId() + "/group";
        List<NotificationDto> notificationDtoList = responseList.stream()
                .filter(response -> !response.getMemberId().getValue().equals(senderId)) // 발신자 제외
                .map(response -> new NotificationDto(
                        response.getMemberId().getValue(),
                        message,
                        NotificationType.GROUP_CHAT,
                        url
                ))
                .toList();

        notificationDtoList.forEach(notificationDto -> {
            // Notification Redis Publish (SSE 알림)
            redisNotificationPublisher.publishNotification(notificationDto);

            // Notification MongoDB에 저장
            notificationService.saveNotification(notificationDto);
        });
    }

    // 일대일 채팅방 메시지 전송 알림
    public void publishOneOnOneChatMessageNotification(ChatMessageDto chatMessageDto) {
        OneononeChatroomId roomId = new OneononeChatroomId(chatMessageDto.getRoomId());
        OneononeChatroomResponse roomInfo = oneononeChatroomService.fetchChatroomInfo(roomId,
                chatMessageDto.getSenderId());

        String senderNickname = memberReadService.findByMemberId(chatMessageDto.getSenderId()).getNickname();
        String roomIdStr = roomInfo.getRoomId().getValue();
        String url = basicUrl + "/chatMain/" + roomIdStr + "/personal";

        NotificationDto notification = new NotificationDto(
                roomInfo.getReceiverId().getValue(),    // 메시지 받는 사람 memberId
                NotificationMessage.generateChatMessage(senderNickname, chatMessageDto.getMessage()),
                NotificationType.ONE_ON_ONE_CHAT,
                url
        );

        // Notification Redis Publish (SSE 알림)
        redisNotificationPublisher.publishNotification(notification);

        // Notification MongoDB에 저장
        notificationService.saveNotification(notification);
    }

}
