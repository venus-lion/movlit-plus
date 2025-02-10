package movlit.be.chatRoom.infra.persistence.jpa;

import movlit.be.chatRoom.domain.MemberROneononeChatroom;
import movlit.be.common.util.ids.MemberROneOnOneChatroomId;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MemberROneononeChatroomJpaRepository extends
        JpaRepository<MemberROneononeChatroom, MemberROneOnOneChatroomId> {

}
