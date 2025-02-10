package movlit.be.chat_room.domain.repository;

import java.util.List;
import movlit.be.chat_room.domain.GroupChatroom;
import movlit.be.chat_room.presentation.dto.GroupChatroomMemberResponse;
import movlit.be.chat_room.presentation.dto.GroupChatroomResponse;
import movlit.be.chat_room.presentation.dto.GroupChatroomResponseDto;
import movlit.be.common.util.ids.GroupChatroomId;
import movlit.be.common.util.ids.MemberId;
import org.springframework.data.repository.query.Param;

public interface GroupChatRepository {

    GroupChatroomResponse create(GroupChatroom groupChatroom);

    GroupChatroomResponseDto fetchRoomByContentId(String contentId);

    boolean existsByContentId(String contentId);

    List<GroupChatroomResponseDto> fetchGroupChatroomByMemberId(MemberId memberId);

    List<GroupChatroomMemberResponse> findMembersByChatroomId(@Param("chatroomId") GroupChatroomId chatroomId);

    GroupChatroom findByChatroomId(GroupChatroomId chatroomId);

    GroupChatroom fetchEntityByContentId(String contentId);

}
