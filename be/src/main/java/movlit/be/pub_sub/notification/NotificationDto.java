package movlit.be.pub_sub.notification;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
public class NotificationDto {

    private String id;
    private String message;     // 팔로잉 : {원준}님이 {민지}님을 팔로우했습니다.
    // 알림 타입, 생성 시간 등 추가 필드 정의 가능
    private NotificationType type;  // 찜, 팔로잉, 일대일알림, 그룹채팅알림
    private String timestamp;
    private String url;

    public NotificationDto(String id, String message, NotificationType type, String url) {
        this.id = id;
        this.message = message;
        this.type = type;
        this.timestamp = LocalDateTime.now().toString();
        this.url = url;
    }

}
