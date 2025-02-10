package movlit.be.chat_room.application.service.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import movlit.be.common.util.ids.GroupChatroomId;
import movlit.be.common.util.ids.MemberId;

@Data
@AllArgsConstructor
public class GroupChatroomLeftEvent {

    private final GroupChatroomId groupChatroomId;
    private final MemberId memberId;

}
