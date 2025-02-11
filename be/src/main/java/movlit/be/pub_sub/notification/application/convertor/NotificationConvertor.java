package movlit.be.pub_sub.notification.application.convertor;

import movlit.be.common.util.IdFactory;
import movlit.be.pub_sub.notification.application.dto.NotificationDto;
import movlit.be.pub_sub.notification.domain.Notification;

public class NotificationConvertor {

    private NotificationConvertor() {
    }

    public static Notification makeNotification(NotificationDto notificationdto) {
        return new Notification(
                IdFactory.createMemberId(notificationdto.getId()),
                notificationdto.getMessage(),
                notificationdto.getType(),
                notificationdto.getUrl(),
                notificationdto.getTimestamp()
        );
    }

}
