package movlit.be.chatRoom.application.service.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import movlit.be.common.util.ids.GroupChatroomId;
import movlit.be.common.util.ids.MemberId;

@Getter
@AllArgsConstructor
public class GroupChatroomJoinedEvent {

    private final GroupChatroomId groupChatroomId;
    private final MemberId memberId;

}
