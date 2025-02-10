package movlit.be.chatMessage.infra.persistence.mongo;

import java.util.List;
import java.util.Optional;
import movlit.be.chatMessage.domain.ChatMessage;
import movlit.be.common.util.ids.MemberId;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface ChatMessageMongoRepository extends MongoRepository<ChatMessage, ObjectId> {

    List<ChatMessage> findByRoomId(String roomId);

    /**
     * 특정 사용자의 읽지 않은 메시지 개수 조회
     */
    @Query(value = "{ 'roomId': ?0, 'readMembers': { $nin: [?1] } }", count = true)
    long countUnreadMessages(String roomId, MemberId memberId);

    /**
     * 특정 사용자의 읽지 않은 메시지 조회
     */
    @Query(value = "{ 'roomId': ?0, 'readMembers': { $nin: [?1] } }", count = true)
    List<ChatMessage> findUnreadMessages(String roomId, MemberId memberId);

    /**
     * timestamp로 내림차순 정렬하여 첫 번째 메시지 하나 반환
     */
    Optional<ChatMessage> findTopByRoomIdOrderByTimestampDesc(String roomId);

}
