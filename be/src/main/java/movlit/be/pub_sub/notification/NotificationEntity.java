package movlit.be.pub_sub.notification;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import java.time.LocalDateTime;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import movlit.be.common.util.ids.MemberId;
import movlit.be.common.util.ids.NotificationId;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notification")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class NotificationEntity {

    @EmbeddedId
    private NotificationId notificationId;

    @AttributeOverride(name = "value", column = @Column(name = "sender_id"))
    private MemberId senderId;

    @AttributeOverride(name = "value", column = @Column(name = "recipient_id"))
    private MemberId recipientId;

    @Enumerated(EnumType.STRING)
    private NotificationType notificationType;

    private boolean isRead;

    private boolean isDeleted;

    private LocalDateTime regDt;

    public NotificationEntity(NotificationId notificationId, MemberId senderId, MemberId recipientId,
                              NotificationType notificationType, boolean isRead, boolean isDeleted,
                              LocalDateTime regDt) {
        this.notificationId = notificationId;
        this.senderId = senderId;
        this.recipientId = recipientId;
        this.notificationType = notificationType;
        this.isRead = isRead;
        this.isDeleted = isDeleted;
        this.regDt = regDt;
    }

}
