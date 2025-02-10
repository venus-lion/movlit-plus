package movlit.be.pub_sub.notification.application.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.common.util.IdFactory;
import movlit.be.common.util.ids.MemberId;
import movlit.be.pub_sub.notification.application.dto.NotificationDto;
import movlit.be.pub_sub.notification.domain.Notification;
import movlit.be.pub_sub.notification.infra.persistence.NotificationRepository;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;

    // 알림 목록 가져오기
    public List<Notification> fetchNotificationList(MemberId memberId) {
        return notificationRepository.findByMemberId(memberId);
    }

    // 하나의 알림 삭제
    public void deleteNotificationById(String id) {
        log.info("::NotificationService_deleteNotificationById::");
        log.info(">> deleted Noti Id " + id);
        notificationRepository.deleteById(id);
    }

    // 알림 전체 삭제
    public void deleteAllNotification(MemberId memberId) {
        log.info("::NotificationService_deleteAllNotification::");
        log.info(">> deleted Noti memberId " + memberId.getValue());
        notificationRepository.deleteAllByMemberId(memberId);
    }

    // 알림 MongoDB 저장
    public void saveNotification(NotificationDto notificationdto) {

        // Dto -> Document
        Notification notification = new Notification(
                IdFactory.createMemberId(notificationdto.getId()),
                notificationdto.getMessage(),
                notificationdto.getType(),
                notificationdto.getUrl(),
                notificationdto.getTimestamp()
        );

        notificationRepository.saveNotification(notification);
    }

    // 모든 알림 읽음 처리
    public void markAllAsRead(MemberId memberId) {
        List<Notification> notifications = notificationRepository.findByMemberId(memberId);
        for (Notification notification : notifications) {
            notification.setIsRead(true); // 읽음으로 설정
        }
        notificationRepository.saveAll(notifications); // 일괄 저장
    }

    // 읽지 않은 알림 조회
    public List<Notification> fetchUnreadNotifications(MemberId memberId) {
        return notificationRepository.findByMemberIdAndIsRead(memberId, false);
    }

}
