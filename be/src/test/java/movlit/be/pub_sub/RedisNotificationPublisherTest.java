package movlit.be.pub_sub;

import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import movlit.be.common.config.RedisNotificationPublisher;
import movlit.be.common.util.IdFactory;
import movlit.be.pub_sub.notification.application.dto.NotificationDto;
import movlit.be.pub_sub.notification.domain.NotificationType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;

@ExtendWith(MockitoExtension.class)
class RedisNotificationPublisherTest {

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private ChannelTopic notificationTopic;

    @InjectMocks
    private RedisNotificationPublisher publisher;

    @Test
    void publishNotificationTest() {
        // Given
        NotificationDto notificationDto = new NotificationDto(IdFactory.createMemberId().getValue(),
                "Test Notification", NotificationType.FOLLOW, "/");
        when(notificationTopic.getTopic()).thenReturn("notification");

        // When
        publisher.publishNotification(notificationDto);

        // Then
        verify(redisTemplate, times(1)).convertAndSend("notification", notificationDto);
    }

}