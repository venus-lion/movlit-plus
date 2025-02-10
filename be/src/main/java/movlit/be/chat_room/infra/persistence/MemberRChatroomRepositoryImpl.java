package movlit.be.chat_room.infra.persistence;

import lombok.RequiredArgsConstructor;
import movlit.be.chat_room.domain.MemberRChatroom;
import movlit.be.chat_room.domain.repository.MemberRChatroomRepository;
import movlit.be.chat_room.infra.persistence.jpa.MemberRChatroomJpaRepository;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class MemberRChatroomRepositoryImpl implements MemberRChatroomRepository {

    private final MemberRChatroomJpaRepository memberRChatroomJpaRepository;

    @Override
    public void save(MemberRChatroom memberRChatroom) {
        memberRChatroomJpaRepository.save(memberRChatroom);
    }

}
