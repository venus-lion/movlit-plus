package movlit.be.chatRoom.presentation.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import movlit.be.common.util.ids.GroupChatroomId;

@Getter
@NoArgsConstructor
public class GroupChatroomResponse {

    private GroupChatroomId groupChatroomId;

    private GroupChatroomResponse(GroupChatroomId groupChatroomId) {
        this.groupChatroomId = groupChatroomId;
    }

    public static GroupChatroomResponse of(GroupChatroomId groupChatroomId) {
        return new GroupChatroomResponse(groupChatroomId);
    }

}
