package movlit.be.pub_sub.notification;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.common.util.ids.GroupChatroomId;
import movlit.be.member.application.service.MemberReadService;
import movlit.be.pub_sub.RedisNotificationPublisher;
import movlit.be.pub_sub.chatMessage.presentation.dto.response.ChatMessageDto;
import movlit.be.pub_sub.chatRoom.application.service.GroupChatroomService;
import movlit.be.pub_sub.chatRoom.presentation.dto.GroupChatroomMemberResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationUseCase {

    private final MemberReadService memberReadService;
    private final RedisNotificationPublisher redisNotificationPublisher;
    private final GroupChatroomService groupChatroomService;
    private final NotificationService notificationService;

    @Value("${share.url}")
    private String basicUrl;

    // 그룹 채팅방 메시지 전송 알림
    public void groupChatroomMessageNotification(ChatMessageDto chatMessageDto) {
        String roomName = groupChatroomService.fetchGroupChatroomById(new GroupChatroomId(chatMessageDto.getRoomId()))
                .getRoomName();
        GroupChatroomId groupChatroomId = new GroupChatroomId(chatMessageDto.getRoomId());
        List<GroupChatroomMemberResponse> responseList = groupChatroomService.fetchMembersInGroupChatroom(
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

}
