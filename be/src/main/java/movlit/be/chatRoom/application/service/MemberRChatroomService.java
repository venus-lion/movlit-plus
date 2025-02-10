package movlit.be.chatRoom.application.service;

import lombok.RequiredArgsConstructor;
import movlit.be.chatRoom.domain.MemberRChatroom;
import movlit.be.chatRoom.domain.repository.MemberRChatroomRepository;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class MemberRChatroomService {

    private final MemberRChatroomRepository memberRChatroomRepository;

    public void save(MemberRChatroom memberRChatroom) {
        memberRChatroomRepository.save(memberRChatroom);
    }

}
