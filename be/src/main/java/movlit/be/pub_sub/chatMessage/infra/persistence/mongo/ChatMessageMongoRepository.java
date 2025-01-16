package movlit.be.pub_sub.chatMessage.infra.persistence.mongo;

import movlit.be.pub_sub.chatMessage.entity.ChatMessage;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface ChatMessageMongoRepository extends MongoRepository<ChatMessage, Long> {
    List<ChatMessage> findByRoomId(Long roomId);
}
