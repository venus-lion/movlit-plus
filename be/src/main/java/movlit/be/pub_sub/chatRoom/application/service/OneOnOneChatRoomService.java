package movlit.be.pub_sub.chatRoom.application.service;

import java.util.List;

import lombok.RequiredArgsConstructor;
import movlit.be.common.util.ids.MemberId;
import movlit.be.pub_sub.chatRoom.entity.ContentType;
import movlit.be.pub_sub.chatRoom.entity.OneOnOneChatRoom;
import movlit.be.pub_sub.chatRoom.infra.persistence.ChatRoomRepository;
import movlit.be.pub_sub.chatRoom.infra.persistence.jpa.OneOnOneChatRoomJpaRepository;
import movlit.be.pub_sub.chatRoom.presentation.dto.response.OneOnOneResponseDto;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OneOnOneChatRoomService {

    private final OneOnOneChatRoomJpaRepository oneOnOneChatRoomJpaRepository;
    private final ChatRoomRepository chatRoomRepository;

    public OneOnOneChatRoom createChatRoom(String roomName, ContentType roomContentType,
                                           MemberId memberId) {
        OneOnOneChatRoom oneOnOneChatRoom = new OneOnOneChatRoom(memberId.getValue(), "memberB");
        return oneOnOneChatRoomJpaRepository.save(oneOnOneChatRoom);
    }

    public List<OneOnOneChatRoom> fetchAllChatRooms() {
        return oneOnOneChatRoomJpaRepository.findAll();
    }

    public OneOnOneChatRoom fetchChatRoomById(Long roomId) {
        return oneOnOneChatRoomJpaRepository.findById(roomId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 채팅방입니다."));
    }

    public List<OneOnOneResponseDto> fetchOneOnOneChatRoomList(MemberId memberId) {
        return chatRoomRepository.fetchOneOnOneChatRoomList(memberId.getValue());
    }

}
