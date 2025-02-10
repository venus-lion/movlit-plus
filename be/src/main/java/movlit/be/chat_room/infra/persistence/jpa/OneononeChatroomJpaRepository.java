package movlit.be.chat_room.infra.persistence.jpa;

import java.util.List;
import java.util.Optional;
import movlit.be.chat_room.domain.OneononeChatroom;
import movlit.be.common.util.ids.MemberId;
import movlit.be.common.util.ids.OneononeChatroomId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface OneononeChatroomJpaRepository extends JpaRepository<OneononeChatroom, OneononeChatroomId> {

    @Query("SELECT DISTINCT o FROM OneononeChatroom o " +
            "LEFT JOIN FETCH o.memberROneononeChatrooms " +
            "WHERE EXISTS (" +
            "  SELECT 1 FROM MemberROneononeChatroom mro " +
            "  WHERE mro.oneononeChatroom = o AND mro.member.memberId = :memberId" +
            ")")
    List<OneononeChatroom> findOneononeChatroomIdsByMemberId(MemberId memberId);

    @Query("SELECT oc "
            + "FROM OneononeChatroom oc "
            + "LEFT JOIN FETCH oc.memberROneononeChatrooms "
            + "WHERE oc.oneononeChatroomId = :roomId")
    Optional<OneononeChatroom> findWithMembersById(@Param("roomId") OneononeChatroomId roomId);

    @Query("SELECT o " +
            "FROM OneononeChatroom o " +
            "WHERE EXISTS (" +
            "   SELECT 1 " +
            "   FROM MemberROneononeChatroom mro1 " +
            "   WHERE mro1.oneononeChatroom = o " +
            "   AND mro1.member.memberId = :senderId" +
            ") " +
            "AND EXISTS (" +
            "   SELECT 1 " +
            "   FROM MemberROneononeChatroom mro2 " +
            "   WHERE mro2.oneononeChatroom = o " +
            "   AND mro2.member.memberId = :receiverId" +
            ")")
    Optional<OneononeChatroom> findOneOnOneChatroomBySenderAndReceiver(@Param("senderId") MemberId senderId,
                                                                       @Param("receiverId") MemberId receiverId);

}
