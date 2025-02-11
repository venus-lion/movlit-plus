package movlit.be.chat_room.application.service;

import lombok.RequiredArgsConstructor;
import movlit.be.chat_room.domain.MemberRChatroom;
import movlit.be.chat_room.domain.repository.MemberRChatroomRepository;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class MemberRChatroomService {

    private final MemberRChatroomRepository memberRChatroomRepository;

    public void save(MemberRChatroom memberRChatroom) {
        memberRChatroomRepository.save(memberRChatroom);
    }

}
