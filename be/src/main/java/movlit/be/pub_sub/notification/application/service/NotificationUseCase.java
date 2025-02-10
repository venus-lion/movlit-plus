package movlit.be.pub_sub.notification.application.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.chat_room.application.service.GroupChatroomService;
import movlit.be.chat_room.application.service.OneononeChatroomService;
import movlit.be.chat_room.presentation.dto.GroupChatroomMemberResponse;
import movlit.be.chat_room.presentation.dto.OneononeChatroomResponse;
import movlit.be.common.config.RedisNotificationPublisher;
import movlit.be.common.util.IdFactory;
import movlit.be.common.util.ids.GroupChatroomId;
import movlit.be.common.util.ids.OneononeChatroomId;
import movlit.be.member.application.service.MemberReadService;
import movlit.be.pub_sub.chat_message.presentation.dto.response.ChatMessageDto;
import movlit.be.pub_sub.notification.application.dto.NotificationDto;
import movlit.be.pub_sub.notification.domain.NotificationMessage;
import movlit.be.pub_sub.notification.domain.NotificationType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationUseCase {

    private final MemberReadService memberReadService;
    private final RedisNotificationPublisher redisNotificationPublisher;
    private final GroupChatroomService groupChatroomService;
    private final OneononeChatroomService oneononeChatroomService;
    private final NotificationService notificationService;

    @Value("${share.url}")
    private String basicUrl;

    // 그룹 채팅방 메시지 전송 알림
    public void publishGroupChatMessageNotification(ChatMessageDto chatMessageDto) {
        GroupChatroomId groupChatroomId = IdFactory.createGroupChatroomId(chatMessageDto.getRoomId());
        String roomName = groupChatroomService.fetchGroupChatroomById(groupChatroomId).getRoomName();
        List<GroupChatroomMemberResponse> responseList = groupChatroomService.fetchMembersInGroupChatroom(
                groupChatroomId, true
        );
        String senderNickname = memberReadService.fetchByMemberId(chatMessageDto.getSenderId()).getNickname();
        String message = NotificationMessage.generateGroupChatMessage(
                senderNickname, roomName, chatMessageDto.getMessage()
        );
        List<NotificationDto> notificationDtoList = makeGroupNotificationDto(
                chatMessageDto, responseList, message
        );

        processForGroup(notificationDtoList);
    }

    private void processForGroup(List<NotificationDto> notificationDtoList) {
        notificationDtoList.forEach(this::processForOneOnOne);
    }

    private List<NotificationDto> makeGroupNotificationDto(ChatMessageDto chatMessageDto,
                                                           List<GroupChatroomMemberResponse> responseList, String message) {
        String senderId = chatMessageDto.getSenderId().getValue();
        String url = basicUrl + "/chatMain/" + chatMessageDto.getRoomId() + "/group";

        // 발신자 제외
        return responseList.stream()
                .filter(response -> !response.getMemberId().getValue().equals(senderId)) // 발신자 제외
                .map(response -> new NotificationDto(
                        response.getMemberId().getValue(),
                        message,
                        NotificationType.GROUP_CHAT,
                        url
                ))
                .toList();
    }

    // 일대일 채팅방 메시지 전송 알림
    public void publishOneOnOneChatMessageNotification(ChatMessageDto chatMessageDto) {
        OneononeChatroomId roomId = new OneononeChatroomId(chatMessageDto.getRoomId());
        OneononeChatroomResponse roomInfo = oneononeChatroomService.fetchChatroomInfo(roomId,
                chatMessageDto.getSenderId());
        String senderNickname = memberReadService.fetchByMemberId(chatMessageDto.getSenderId()).getNickname();
        NotificationDto notification = makeOneOnOneNotificationDto(
                chatMessageDto, roomInfo, senderNickname
        );

        processForOneOnOne(notification);
    }

    private void processForOneOnOne(NotificationDto notification) {
        // Notification Redis Publish (SSE 알림)
        redisNotificationPublisher.publishNotification(notification);

        // Notification MongoDB에 저장
        notificationService.saveNotification(notification);
    }

    private NotificationDto makeOneOnOneNotificationDto(ChatMessageDto chatMessageDto, OneononeChatroomResponse roomInfo,
                                               String senderNickname) {
        String roomIdStr = roomInfo.getRoomId().getValue();
        String url = basicUrl + "/chatMain/" + roomIdStr + "/personal";

        // 메시지 받는 사람 memberId
        return new NotificationDto(
                roomInfo.getReceiverId().getValue(),    // 메시지 받는 사람 memberId
                NotificationMessage.generateChatMessage(senderNickname, chatMessageDto.getMessage()),
                NotificationType.ONE_ON_ONE_CHAT,
                url
        );
    }

}
