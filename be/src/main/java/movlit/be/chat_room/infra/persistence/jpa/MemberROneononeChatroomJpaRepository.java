package movlit.be.chat_room.infra.persistence.jpa;

import movlit.be.chat_room.domain.MemberROneononeChatroom;
import movlit.be.common.util.ids.MemberROneOnOneChatroomId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberROneononeChatroomJpaRepository extends
        JpaRepository<MemberROneononeChatroom, MemberROneOnOneChatroomId> {

}
