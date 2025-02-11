package movlit.be.common.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.pub_sub.notification.application.dto.NotificationDto;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;

/**
 * 알림 메시지 수신자(Subscriber) 구현
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class RedisNotificationPublisher {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ChannelTopic notificationTopic;

    /**
     * 알림 보내기(notification) 토픽 발행하는 메서드
     * @param notificationDto
     */
    public void publishNotification(NotificationDto notificationDto) {
        log.info("Publishing notification {}", notificationDto);
        redisTemplate.convertAndSend(notificationTopic.getTopic(), notificationDto);
    }

}