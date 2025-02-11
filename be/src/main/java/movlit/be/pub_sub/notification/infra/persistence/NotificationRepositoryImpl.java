package movlit.be.pub_sub.notification.infra.persistence;

import java.util.List;
import lombok.RequiredArgsConstructor;
import movlit.be.common.util.ids.MemberId;
import movlit.be.pub_sub.notification.domain.Notification;
import movlit.be.pub_sub.notification.infra.persistence.mongo.NotificationMongoRepository;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class NotificationRepositoryImpl implements NotificationRepository {

    private final NotificationMongoRepository notificationMongoRepository;

    @Override
    public List<Notification> findByMemberId(MemberId memberId) {
        return notificationMongoRepository.findByMemberIdOrderByTimestampDesc(memberId);
    }

    @Override
    public void saveNotification(Notification notification) {
        notificationMongoRepository.save(notification);
    }

    @Override
    public void deleteById(String id) {
        notificationMongoRepository.deleteById(id);
    }

    @Override
    public void deleteAllByMemberId(MemberId memberId) {
        notificationMongoRepository.deleteAllByMemberId(memberId);
    }

    @Override
    public void saveAll(List<Notification> notificationList) {
        notificationMongoRepository.saveAll(notificationList);
    }

    @Override
    public List<Notification> fetchByMemberIdAndIsRead(MemberId memberId, Boolean isRead) {
        return notificationMongoRepository.findByMemberIdAndIsReadOrderByTimestampDesc(memberId, isRead);
    }

}
