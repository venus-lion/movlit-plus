package movlit.be.pub_sub.notification.domain;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import movlit.be.common.util.ids.MemberId;
import movlit.be.pub_sub.notification.NotificationType;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "notification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Notification {

    @Id
    private String id;

    private MemberId memberId; // 알림 받을 멤버id
    private String message;     // 알림 메시지 ex. 팔로잉 : {원준}님이 {민지}님을 팔로우했습니다.
    private NotificationType type;  // 찜, 팔로잉, 일대일알림, 그룹채팅알림
    private String url; // 알림 클릭했을 때 넘어갈 url
    private Boolean isRead = false; // 알림 읽음 여부 표시
    private String timestamp; // 알림 생성 시간

    public Notification(MemberId memberId, String message, NotificationType type, String url, String timestamp) {

        this.memberId = memberId;
        this.message = message;
        this.type = type;
        this.url = url;
        this.timestamp = timestamp;
    }

}
