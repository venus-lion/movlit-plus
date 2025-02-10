package movlit.be.chat_room.domain;

import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import movlit.be.common.util.ids.MemberRChatroomId;
import movlit.be.member.domain.entity.MemberEntity;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "member_r_chatroom")
@ToString(exclude = {"member", "groupChatroom"})
public class MemberRChatroom {

    @EmbeddedId
    private MemberRChatroomId memberRChatroomId;

    @ManyToOne(fetch = FetchType.LAZY)
    private MemberEntity member;

    @ManyToOne(fetch = FetchType.LAZY)
    private GroupChatroom groupChatroom;

    private LocalDateTime regDt;

    public MemberRChatroom(MemberRChatroomId memberRChatroomId, LocalDateTime regDt) {
        this.memberRChatroomId = memberRChatroomId;
        this.regDt = regDt;
    }

    public void updateMember(MemberEntity member) {
        this.member = member;
    }

    public void updateGroupChatRoom(GroupChatroom groupChatroom) {
        this.groupChatroom = groupChatroom;
    }

}
