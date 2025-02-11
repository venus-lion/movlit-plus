package movlit.be.chat_room.presentation.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import movlit.be.pub_sub.chat_message.presentation.dto.response.MessageType;
import movlit.be.common.util.ids.GroupChatroomId;
import movlit.be.common.util.ids.MemberId;

/**
 * updateRoom Topic publish용 DTO
 * one-on-one / group chatroom 에서 활용 가능
 */
@Getter
@NoArgsConstructor
public class UpdateRoomDto {

    private String roomId;      // OneononeChatroomId, GroupChatroomId : getValue()로 넣어주기
   // private GroupChatroomId groupChatroomId;
    private MessageType messageType;

    private EventType eventType; // ex) MEMBER_PROFILE_UPDATE
    private MemberId memberId; // "업데이트된" memberId
    private String eventMessage; // 새로운 멤버 가입 메시지
    private String profileImgUrl; // 추가: 프로필 이미지 URL
    private boolean isProfileUpdate;

    public enum EventType {
        MEMBER_PROFILE_UPDATE, // 멤버 프로필 정보 업데이트
        MEMBER_JOIN, // 새로운 멤버 가입 이벤트
        MEMBER_LEAVE // 멤버 나가기 이벤트

    }

    // 프로필 업데이트용 생성자
    public UpdateRoomDto(String roomId, MessageType messageType, EventType eventType,
                         MemberId memberId, String profileImgUrl, boolean isProfileUpdate) {
        this.roomId = roomId;
        this.messageType = messageType;
        this.eventType = eventType;
        this.memberId = memberId;
        this.profileImgUrl = profileImgUrl;
        this.isProfileUpdate = isProfileUpdate;
    }

    // 기존 생성자 (MEMBER_JOIN, MEMBER_LEAVE용)
    public UpdateRoomDto(String roomId, MessageType messageType, EventType eventType,
                         MemberId memberId, String eventMessage) {
        this.roomId = roomId;
        this.messageType = messageType;
        this.eventType = eventType;
        this.memberId = memberId;
        this.eventMessage = eventMessage;
    }

    @Override
    public String toString() {
        return "UpdateRoomDto{" +
                "groupChatroomId='" + roomId + '\'' +
                ", messageType=" + messageType +
                ", eventType=" + eventType +
                ", memberId=" + memberId.getValue() + ", profileImgUrl='" + profileImgUrl + '\'' + // 추가
                '}';

    }

    public String toStringWithEventMsg() {
        return "UpdateRoomDto{" +
                "groupChatroomId='" + roomId + '\'' +
                ", messageType=" + messageType +
                ", eventType=" + eventType +
                ", memberId=" + memberId.getValue() +
                ", joinMessage= " + eventMessage + '}';
    }

}
