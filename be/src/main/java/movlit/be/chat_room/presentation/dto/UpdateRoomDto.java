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

    //private String roomId;      // OneononeChatroomId, GroupChatroomId : getValue()로 넣어주기
//    private GroupChatroomId groupChatroomId;
    private String roomId;
    private MessageType messageType;

    private EventType eventType; // ex) MEMBER_PROFILE_UPDATE
    private MemberId memberId; // "업데이트된" memberId
    private String eventMessage; // 새로운 멤버 가입 메시지

    public enum EventType {
        MEMBER_PROFILE_UPDATE, // 멤버 프로필 정보 업데이트
        MEMBER_JOIN, // 새로운 멤버 가입 이벤트
        MEMBER_LEAVE // 멤버 나가기 이벤트

    }

    public UpdateRoomDto(String roomId, MessageType messageType, EventType eventType,
                         MemberId memberId) {
        this.roomId = roomId;
        this.messageType = messageType;
        this.eventType = eventType;
        this.memberId = memberId;
    }

    public UpdateRoomDto(String roomId, MessageType messageType, EventType eventType,
                         MemberId memberId
            , String eventMessage) {
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
                ", memberId=" + memberId.getValue();
    }

    public String toStringWithJoinMsg() {
        return "UpdateRoomDto{" +
                "groupChatroomId='" + roomId + '\'' +
                ", messageType=" + messageType +
                ", eventType=" + eventType +
                ", memberId=" + memberId.getValue() +
                ", joinMessage= " + eventMessage + '}';
    }

}
