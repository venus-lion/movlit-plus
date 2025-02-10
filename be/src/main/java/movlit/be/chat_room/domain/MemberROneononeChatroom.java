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
import movlit.be.common.util.ids.MemberROneOnOneChatroomId;
import movlit.be.member.domain.entity.MemberEntity;
import org.springframework.data.annotation.CreatedDate;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
@Table(name = "member_r_oneonone_chat_room")
public class MemberROneononeChatroom {

    @EmbeddedId
    private MemberROneOnOneChatroomId memberROneOnOneChatroomId;

    @ManyToOne(fetch = FetchType.LAZY)
    private MemberEntity member;

    @ManyToOne(fetch = FetchType.LAZY)
    private OneononeChatroom oneononeChatroom;

    @CreatedDate
    private LocalDateTime regDt;

    public MemberROneononeChatroom(MemberROneOnOneChatroomId memberROneOnOneChatroomId) {
        this.memberROneOnOneChatroomId = memberROneOnOneChatroomId;
        this.regDt = LocalDateTime.now();
    }

    public void updateMember(MemberEntity member) {
        this.member = member;
    }

    public void updateOneononeChatroom(OneononeChatroom oneononeChatroom) {
        this.oneononeChatroom = oneononeChatroom;
    }

}
