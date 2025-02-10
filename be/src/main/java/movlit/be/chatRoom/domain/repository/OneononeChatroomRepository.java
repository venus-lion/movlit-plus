package movlit.be.chatRoom.domain.repository;

import java.util.List;
import movlit.be.chatRoom.domain.MemberROneononeChatroom;
import movlit.be.chatRoom.domain.OneononeChatroom;
import movlit.be.chatRoom.presentation.dto.OneononeChatroomResponse;
import movlit.be.common.util.ids.MemberId;
import movlit.be.common.util.ids.OneononeChatroomId;

public interface OneononeChatroomRepository {

    OneononeChatroom create(OneononeChatroom oneOnOneChatroom);

    List<OneononeChatroomResponse> fetchOneOnOneChatList(MemberId memberId);

    List<MemberROneononeChatroom> findWithMembersById(OneononeChatroomId roomId);

    boolean existsOneOnOneChatroomBySenderAndReceiver(MemberId senderId, MemberId receiverId);

}
