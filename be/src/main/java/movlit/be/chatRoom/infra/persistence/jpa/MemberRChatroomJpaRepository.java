package movlit.be.chatRoom.infra.persistence.jpa;

import movlit.be.chatRoom.domain.MemberRChatroom;
import movlit.be.common.util.ids.MemberRChatroomId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRChatroomJpaRepository extends JpaRepository<MemberRChatroom, MemberRChatroomId> {

}
