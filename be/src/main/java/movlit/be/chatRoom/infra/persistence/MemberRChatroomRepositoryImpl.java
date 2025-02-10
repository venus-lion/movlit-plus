package movlit.be.chatRoom.infra.persistence;

import lombok.RequiredArgsConstructor;
import movlit.be.chatRoom.domain.MemberRChatroom;
import movlit.be.chatRoom.domain.repository.MemberRChatroomRepository;
import movlit.be.chatRoom.infra.persistence.jpa.MemberRChatroomJpaRepository;
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
