package movlit.be.chat_room.presentation.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import movlit.be.common.util.ids.MemberId;

@Getter
@AllArgsConstructor
@ToString
public class GroupChatroomMemberResponse {

    private MemberId memberId;
    private String nickname;
    private String profileImgUrl;

}
