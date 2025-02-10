package movlit.be.pub_sub.notification.infra.persistence;

import java.util.List;
import movlit.be.common.util.ids.MemberId;
import movlit.be.pub_sub.notification.domain.Notification;

public interface NotificationRepository {

    List<Notification> findByMemberId(MemberId memberId);

    void saveNotification(Notification notification);

    void deleteById(String id);

    void deleteAllByMemberId(MemberId memberId);

    void saveAll(List<Notification> notificationList);

    List<Notification> findByMemberIdAndIsRead(MemberId memberId, Boolean isRead);

}
