package movlit.be.pub_sub.chatRoom.infra.persistence;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import movlit.be.pub_sub.chatRoom.entity.OneOnOneChatRoom;
import movlit.be.pub_sub.chatRoom.infra.persistence.jpa.OneOnOneChatRoomJpaRepository;
import movlit.be.pub_sub.chatRoom.presentation.dto.response.OneOnOneResponseDto;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ChatRoomRepositoryImpl implements ChatRoomRepository {

    private final OneOnOneChatRoomJpaRepository oneOnOneChatRoomJpaRepository;
    // GroupChatRoomJpaRepository

    public List<OneOnOneResponseDto> fetchOneOnOneChatRoomList(String memberIdVal) {
        return oneOnOneChatRoomJpaRepository.findOneOnOneChatRoomByMemberId(memberIdVal);
    }

}
