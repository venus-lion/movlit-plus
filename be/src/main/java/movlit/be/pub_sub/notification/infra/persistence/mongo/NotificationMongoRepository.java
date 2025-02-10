package movlit.be.pub_sub.notification.infra.persistence.mongo;

import java.util.List;
import movlit.be.common.util.ids.MemberId;
import movlit.be.pub_sub.notification.domain.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotificationMongoRepository extends MongoRepository<Notification, String> {

    List<Notification> findByMemberIdOrderByTimestampDesc(MemberId memberId);

    List<Notification> findByMemberIdAndIsReadOrderByTimestampDesc(MemberId memberId, Boolean isRead);

    void deleteAllByMemberId(MemberId memberId);

}
