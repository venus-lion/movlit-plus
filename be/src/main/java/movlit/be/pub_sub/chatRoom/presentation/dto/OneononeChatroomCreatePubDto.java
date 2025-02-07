package movlit.be.pub_sub.chatRoom.presentation.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import movlit.be.common.util.ids.MemberId;
import movlit.be.common.util.ids.OneononeChatroomId;
import movlit.be.pub_sub.chatMessage.presentation.dto.response.ChatMessageDto;

@Getter
@NoArgsConstructor
@ToString
public class OneononeChatroomCreatePubDto {

    private OneononeChatroomId roomId;
    private MemberId topicReceiverId;
    private MemberId receiverId;        // 토픽을 받는 사람입장에서의 채팅 receiver
    private String receiverNickname;
    private String receiverProfileImgUrl;
    private ChatMessageDto recentMessage;

    public OneononeChatroomCreatePubDto(OneononeChatroomId roomId, MemberId topicReceiverId, MemberId receiverId,
                                        String receiverNickname, String receiverProfileImgUrl) {
        this.roomId = roomId;
        this.topicReceiverId = topicReceiverId;
        this.receiverId = receiverId;
        this.receiverNickname = receiverNickname;
        this.receiverProfileImgUrl = receiverProfileImgUrl;
    }

    public OneononeChatroomCreatePubDto(OneononeChatroomId roomId, MemberId topicReceiverId, MemberId receiverId,
                                        String receiverNickname, String receiverProfileImgUrl,
                                        ChatMessageDto recentMessage) {
        this.roomId = roomId;
        this.topicReceiverId = topicReceiverId;
        this.receiverId = receiverId;
        this.receiverNickname = receiverNickname;
        this.receiverProfileImgUrl = receiverProfileImgUrl;
        this.recentMessage = recentMessage;
    }

}
