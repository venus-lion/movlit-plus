package movlit.be.pub_sub.chatRoom.infra.persistence.jpa;

import java.util.List;
import java.util.Optional;
import movlit.be.pub_sub.chatRoom.entity.OneOnOneChatRoom;
import movlit.be.pub_sub.chatRoom.presentation.dto.response.OneOnOneResponseDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface OneOnOneChatRoomJpaRepository extends JpaRepository<OneOnOneChatRoom, Long> {

    @Query("SELECT new movlit.be.pub_sub.chatRoom.presentation.dto.response.OneOnOneResponseDto"
            + "(r.id, r.memberAId, r.memberBId, :memberId) "
            + "FROM OneOnOneChatRoom r "
            + "WHERE r.memberAId = :memberId OR r.memberBId = :memberId")
    List<OneOnOneResponseDto> findOneOnOneChatRoomByMemberId(String memberId);

}
