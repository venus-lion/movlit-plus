package movlit.be.pub_sub.notification.presentation;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.auth.application.service.MyMemberDetails;
import movlit.be.common.util.ids.MemberId;
import movlit.be.pub_sub.notification.application.service.NotificationService;
import movlit.be.pub_sub.notification.application.service.SseEmitterService;
import movlit.be.pub_sub.notification.domain.Notification;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequiredArgsConstructor
@Slf4j
public class NotificationController {

    private final SseEmitterService sseEmitterService;
    private final NotificationService notificationService;

    @GetMapping(value = "/api/subscribe/{id}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public ResponseEntity<SseEmitter> subscribe(@PathVariable String id) {
        SseEmitter emitter = sseEmitterService.addEmitter(id);
        return ResponseEntity.ok().body(emitter);
    }

    // 알림 목록 가져오기
    @GetMapping("/api/notification")
    public ResponseEntity<List<Notification>> fetchNotification(@AuthenticationPrincipal MyMemberDetails details) {
        if (details != null) {
            MemberId memberId = details.getMemberId();
            List<Notification> notificationList = notificationService.fetchNotificationList(memberId);
            return ResponseEntity.ok().body(notificationList);

        } else {
            return ResponseEntity.badRequest().build();
        }

    }

    // 하나의 알림 삭제
    @DeleteMapping("/api/notification/{notiId}")
    public ResponseEntity<Void> deleteNotification(@PathVariable String notiId) {
        notificationService.deleteNotificationById(notiId);
        return ResponseEntity.ok().build();
    }

    // 모든 알림 삭제
    @DeleteMapping("/api/notification/all")
    public ResponseEntity<Void> deleteAllNotification(@AuthenticationPrincipal MyMemberDetails details) {
        if (details != null) {
            MemberId memberId = details.getMemberId();
            notificationService.deleteAllNotification(memberId);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    // 모든 알림 읽음 처리 (알림 목록 페이지 접속 -> 모든 알림 읽음)
    @PutMapping("/api/notification/markAllAsRead")
    public ResponseEntity<Void> markAllAsRead(@AuthenticationPrincipal MyMemberDetails details) {
        if (details != null) {
            MemberId memberId = details.getMemberId();
            notificationService.markAllAsRead(memberId);
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    // 읽지 않은 알림 조회 (메인페이지에서 읽지 않은 알림이 있을 시 -> 종 아이콘에 빨간색 뱃지 "N" 표시)
    @GetMapping("/api/notification/unread")
    public ResponseEntity<List<Notification>> fetchUnreadNotifications(
            @AuthenticationPrincipal MyMemberDetails details) {
        if (details != null) {
            MemberId memberId = details.getMemberId();
            List<Notification> unreadNotifications = notificationService.fetchUnreadNotifications(memberId);
            return ResponseEntity.ok().body(unreadNotifications);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }


}
