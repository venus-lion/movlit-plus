package movlit.be.chatRoom.domain;

import jakarta.persistence.CascadeType;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import movlit.be.common.util.ids.GroupChatroomId;

@Entity
@Table(name = "group_chat_room")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@ToString
public class GroupChatroom {

    @EmbeddedId
    private GroupChatroomId groupChatroomId;
    private String roomName;
    private String contentId; // MV_uuid, BK_uuid
    private LocalDateTime regDt;

    @OneToMany(mappedBy = "groupChatroom", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<MemberRChatroom> memberRChatroom = new ArrayList<>();

    public GroupChatroom(GroupChatroomId groupChatroomId, String roomName, String contentId, LocalDateTime regDt) {
        this.groupChatroomId = groupChatroomId;
        this.roomName = roomName;
        this.contentId = contentId;
        this.regDt = regDt;
    }

    public void updateMemberRChatroom(MemberRChatroom memberRChatroom) {
        this.memberRChatroom.add(memberRChatroom);
    }

}
