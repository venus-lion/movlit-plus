package movlit.be.chat_room.infra.persistence.jpa;

import java.util.List;
import java.util.Optional;
import movlit.be.chat_room.domain.GroupChatroom;
import movlit.be.chat_room.presentation.dto.GroupChatroomMemberResponse;
import movlit.be.chat_room.presentation.dto.GroupChatroomResponseDto;
import movlit.be.common.util.ids.GroupChatroomId;
import movlit.be.common.util.ids.MemberId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface GroupChatroomJpaRepository extends JpaRepository<GroupChatroom, GroupChatroomId> {

    Optional<GroupChatroom> findByGroupChatroomId(GroupChatroomId chatroomId);

    @Query("SELECT NEW movlit.be.chat_room.presentation.dto.GroupChatroomResponseDto( "
            + "gc.groupChatroomId, "
            + "gc.contentId, "
            + "gc.roomName, "
            + " '' AS contentName, "
            + " gc.regDt "
            + " ) "
            + "FROM GroupChatroom gc "
            + "WHERE contentId = :contentId")
    Optional<GroupChatroomResponseDto> findRoomByContentId(String contentId);

    // 특정 채팅방id의 member 정보 조회
    @Query("SELECT NEW movlit.be.chat_room.presentation.dto.GroupChatroomMemberResponse(" +
            "m.memberId, m.nickname, m.profileImgUrl)" +
            "FROM GroupChatroom g " +
            "LEFT JOIN g.memberRChatroom mr " +
            "LEFT JOIN mr.member m " +
            "WHERE g.groupChatroomId = :chatroomId"
    )
    List<GroupChatroomMemberResponse> findMembersByChatroomId(@Param("chatroomId") GroupChatroomId chatroomId);

    // 해당 사용자가 가입된 그룹 채팅방 리스트
    @Query("SELECT NEW movlit.be.chat_room.presentation.dto.GroupChatroomResponseDto( "
            + "gc.groupChatroomId, "
            + "gc.contentId, "
            + "gc.roomName, "
            + " ( "
            + "   CASE "
            + "    WHEN gc.contentId LIKE 'BK_%' THEN b.title  "
            + "    WHEN gc.contentId LIKE 'MV_%' THEN m.title  "
            + "    ELSE '알 수 없음'  "
            + "   END "
            + " ) AS contentName, "
            + "gc.regDt "
            + ") "
            + "FROM GroupChatroom gc "
            + "LEFT JOIN gc.memberRChatroom mr "
            + "LEFT JOIN BookEntity b ON gc.contentId = CONCAT('BK_', b.bookId) AND gc.contentId LIKE 'BK_%'  "
            + "LEFT JOIN MovieEntity m ON gc.contentId = CONCAT('MV_', m.movieId) AND gc.contentId LIKE 'MV_%' "
            + "WHERE mr.member.memberId = :memberId "
            + "ORDER BY mr.regDt DESC ")
    Optional<List<GroupChatroomResponseDto>> findAllByMemberId(@Param("memberId") MemberId memberId);

    boolean existsByContentId(String contentId);

    @Query("SELECT gc "
            + "FROM GroupChatroom gc "
            + "LEFT JOIN gc.memberRChatroom mr "
            + "WHERE gc.contentId = :contentId")
    Optional<GroupChatroom> findGroupChatroomByContentId(String contentId);


}


