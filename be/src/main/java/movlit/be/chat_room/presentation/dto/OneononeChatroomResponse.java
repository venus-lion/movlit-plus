package movlit.be.chat_room.presentation.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import movlit.be.pub_sub.chat_message.presentation.dto.response.ChatMessageDto;
import movlit.be.common.util.ids.MemberId;
import movlit.be.common.util.ids.OneononeChatroomId;

@Getter
@NoArgsConstructor
@ToString
public class OneononeChatroomResponse {

    private OneononeChatroomId roomId;
    private MemberId receiverId;
    private String receiverNickname;
    private String receiverProfileImgUrl;
    private ChatMessageDto recentMessage;

    // 최근 채팅정보도 필요한지 검토

    public OneononeChatroomResponse(OneononeChatroomId roomId, MemberId receiverId,
                                    String receiverNickname, String receiverProfileImgUrl) {
        this.roomId = roomId;
        this.receiverId = receiverId;
        this.receiverNickname = receiverNickname;
        this.receiverProfileImgUrl = receiverProfileImgUrl;
    }

    public void setRecentMessage(ChatMessageDto recentMessage) {
        this.recentMessage = recentMessage;
    }

}
