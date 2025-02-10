package movlit.be.chat_room.presentation.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import movlit.be.common.util.ids.MemberId;

@Getter
@NoArgsConstructor
public class OneononeChatroomRequest {

    private MemberId receiverId;

    public OneononeChatroomRequest(MemberId receiverId) {
        this.receiverId = receiverId;
    }

    public OneononeChatroomRequest(String receiverId) {
        this.receiverId = new MemberId(receiverId);
    }

}
