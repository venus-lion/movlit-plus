package movlit.be.pub_sub;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;

@Configuration
@RequiredArgsConstructor
public class
RedisListenerConfig { // 클래스명 변경

    private final RedisMessageSubscriber subscriber;
    private final RedisNotificationSubscriber notificationSubscriber; // 변경된 부분

    /**
     * Topic 사용을 위한 Bean 설정
     */
    @Bean
    public ChannelTopic notificationTopic() { // 알림 토픽
        return new ChannelTopic("notification");
    }

    /**
     * Topic 사용을 위한 Bean 설정
     */
    @Bean
    public ChannelTopic sendMessageTopic() {
        return new ChannelTopic("sendMessage");
    }

    @Bean
    public ChannelTopic updateRoomTopic() {
        return new ChannelTopic("updateRoom");
    }

    @Bean
    public ChannelTopic createOneononeChatroomTopic() {
        return new ChannelTopic("createOneononeChatroom");
    }

    @Bean
    public ChannelTopic readMessageTopic() {
        return new ChannelTopic("readMessage");
    }

    /**
     * 메시지 전송을 처리하는 subscriber 설정 추가
     */
    @Bean
    public MessageListenerAdapter listenerAdapterSendMessage(RedisMessageSubscriber subscriber) {
        // subscriber 내의 메서드명을 지정
        return new MessageListenerAdapter(subscriber, "sendMessage");
    }

    /**
     * 채팅방정보 변경을 처리하는 subscriber 설정 추가
     */
    @Bean
    public MessageListenerAdapter listenerAdapterUpdateRoom(RedisMessageSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "updateRoom");
    }

    /**
     * 채팅 읽음을 처리하는 subscriber 설정 추가
     */
    @Bean
    public MessageListenerAdapter listenerAdapterReadMessage(RedisMessageSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "readMessage");
    }

    /**
     * 일대일 채팅방 시작되는 subscriber 설정 추가
     */
    @Bean
    public MessageListenerAdapter listenerAdapterCreateOneononeChatroom(RedisMessageSubscriber subscriber) {
        return new MessageListenerAdapter(subscriber, "createOneononeChatroom");
    }

    /**
     * 알림 메시지를 처리하는 subscriber 설정 추가
     */
    @Bean
    public MessageListenerAdapter listenerAdapterNotification(RedisNotificationSubscriber notificationSubscriber) {
        return new MessageListenerAdapter(notificationSubscriber, "onNotification"); // 메서드명 변경
    }

    /**
     * redis 에 발행(publish)된 메시지 처리를 위한 리스너 설정
     */
    @Bean
    public RedisMessageListenerContainer redisMessageListener(
            RedisConnectionFactory redisConnectionFactory,
            MessageListenerAdapter listenerAdapterSendMessage,
            MessageListenerAdapter listenerAdapterUpdateRoom,
            MessageListenerAdapter listenerAdapterReadMessage,
            MessageListenerAdapter listenerAdapterCreateOneononeChatroom,
            MessageListenerAdapter listenerAdapterNotification,
            ChannelTopic sendMessageTopic,
            ChannelTopic updateRoomTopic,
            ChannelTopic readMessageTopic,
            ChannelTopic createOneononeChatroomTopic,
            ChannelTopic notificationTopic
    ) {
        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
        container.setConnectionFactory(redisConnectionFactory);

        container.addMessageListener(listenerAdapterSendMessage, sendMessageTopic);
        container.addMessageListener(listenerAdapterUpdateRoom, updateRoomTopic);
        container.addMessageListener(listenerAdapterReadMessage, readMessageTopic);
        container.addMessageListener(listenerAdapterCreateOneononeChatroom, createOneononeChatroomTopic);
        container.addMessageListener(listenerAdapterNotification, notificationTopic);
        return container;
    }

}