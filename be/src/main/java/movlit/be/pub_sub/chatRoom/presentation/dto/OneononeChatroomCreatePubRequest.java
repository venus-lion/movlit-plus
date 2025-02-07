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
public class OneononeChatroomCreatePubRequest {

    private OneononeChatroomId roomId;
    private MemberId topicReceiverId;
    private ChatMessageDto chatMessage;

    public OneononeChatroomCreatePubRequest(OneononeChatroomId roomId, MemberId topicReceiverId,
                                            ChatMessageDto chatMessage) {
        this.roomId = roomId;
        this.topicReceiverId = topicReceiverId;
        this.chatMessage = chatMessage;
    }

}
