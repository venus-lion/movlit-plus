package movlit.be.pub_sub.chat_message.infra.persistence;

import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import movlit.be.pub_sub.chat_message.domain.ChatMessage;
import movlit.be.pub_sub.chat_message.infra.persistence.mongo.ChatMessageMongoRepository;
import movlit.be.pub_sub.chat_message.presentation.dto.response.ChatMessageDto;
import movlit.be.common.util.ids.MemberId;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class ChatMessageRepositoryImpl implements ChatMessageRepository {

    private final ChatMessageMongoRepository chatMessageMongoRepository;

    @Override
    public void saveMessage(ChatMessage chatMessage) {
        chatMessageMongoRepository.save(chatMessage);
    }

    @Override
    public List<ChatMessage> findByRoomId(String roomId) {
        return chatMessageMongoRepository.findByRoomId(roomId);
    }

    @Override
    public Long findCountUnreadMessages(String roomId, MemberId memberId) {
        return chatMessageMongoRepository.countUnreadMessages(roomId, memberId);
    }

    @Override
    public List<ChatMessage> findUnreadMessages(String roomId, MemberId memberId) {
        return chatMessageMongoRepository.findUnreadMessages(roomId, memberId);
    }

    public ChatMessageDto findTopByRoomIdOrderByTimestampDesc(String roomId) {
        Optional<ChatMessage> messageOpt = chatMessageMongoRepository.findTopByRoomIdOrderByTimestampDesc(
                roomId);

        if (messageOpt.isEmpty()) {
            return new ChatMessageDto();
        }

        ChatMessage chatMessage = messageOpt.get();
        return new ChatMessageDto(chatMessage.getRoomId(), chatMessage.getSenderId(), chatMessage.getMessage(),
                chatMessage.getTimestamp());
    }

}
