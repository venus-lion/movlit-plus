package movlit.be.chat_room.presentation.dto;

import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import movlit.be.common.util.ids.MemberId;
import movlit.be.member.domain.entity.MemberEntity;

@Getter
@AllArgsConstructor(access = AccessLevel.PRIVATE)
@ToString
public class GroupChatroomMemberResponse {

    private MemberId memberId;
    private String nickname;
    private String profileImgUrl;

    public static GroupChatroomMemberResponse from(MemberEntity memberEntity){
        return new GroupChatroomMemberResponse(
                memberEntity.getMemberId(),
                memberEntity.getNickname(),
                memberEntity.getProfileImgUrl()
        );
    }

}
