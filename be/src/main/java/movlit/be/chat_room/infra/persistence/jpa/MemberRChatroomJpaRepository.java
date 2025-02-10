package movlit.be.chat_room.infra.persistence.jpa;

import movlit.be.chat_room.domain.MemberRChatroom;
import movlit.be.common.util.ids.MemberRChatroomId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberRChatroomJpaRepository extends JpaRepository<MemberRChatroom, MemberRChatroomId> {

}
