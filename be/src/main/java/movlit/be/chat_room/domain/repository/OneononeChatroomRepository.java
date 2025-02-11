package movlit.be.chat_room.domain.repository;

import java.util.List;
import movlit.be.chat_room.domain.MemberROneononeChatroom;
import movlit.be.chat_room.domain.OneononeChatroom;
import movlit.be.chat_room.presentation.dto.OneOnOneChatroomIdResponse;
import movlit.be.chat_room.presentation.dto.OneononeChatroomResponse;
import movlit.be.common.util.ids.MemberId;
import movlit.be.common.util.ids.OneononeChatroomId;

public interface OneononeChatroomRepository {

    OneononeChatroom create(OneononeChatroom oneOnOneChatroom);

    List<OneononeChatroomResponse> fetchOneOnOneChatList(MemberId memberId);

    List<MemberROneononeChatroom> fetchWithMembersById(OneononeChatroomId roomId);

    boolean existsOneOnOneChatroomBySenderAndReceiver(MemberId senderId, MemberId receiverId);

    OneOnOneChatroomIdResponse fetchOneOnOneChatroomIdBySenderAndReceiver(MemberId senderId, MemberId receiverId);
}
