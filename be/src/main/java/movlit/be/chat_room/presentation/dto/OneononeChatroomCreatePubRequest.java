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
