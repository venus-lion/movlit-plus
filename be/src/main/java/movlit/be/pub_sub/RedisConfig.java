package movlit.be.pub_sub;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.autoconfigure.data.redis.RedisProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.data.redis.listener.RedisMessageListenerContainer;
import org.springframework.data.redis.listener.adapter.MessageListenerAdapter;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
@RequiredArgsConstructor
public class RedisConfig {

    private final RedisProperties redisProperties;

    /**
     * 단일 Topic 사용을 위한 Bean 설정
     */
//    @Bean
//    public ChannelTopic channelTopic() {
//        return new ChannelTopic("chatroom");
//    }

//    @Bean
//    public RedisConnectionFactory redisConnectionFactory() {
//        LettuceConnectionFactory lettuceConnectionFactory = new LettuceConnectionFactory();
//        lettuceConnectionFactory.setHostName(redisProperties.getHost());
//        lettuceConnectionFactory.setPort(redisProperties.getPort());
//        lettuceConnectionFactory.setPassword(redisProperties.getPassword());
//        return lettuceConnectionFactory;
//    }

    /**
     * redis 에 발행(publish)된 메시지 처리를 위한 리스너 설정
     */
//    @Bean
//    public RedisMessageListenerContainer redisMessageListener(
//            MessageListenerAdapter listenerAdapterChatMessage,
//            ChannelTopic channelTopic
//    ) {
//        RedisMessageListenerContainer container = new RedisMessageListenerContainer();
//        container.setConnectionFactory(redisConnectionFactory());
//        container.addMessageListener(listenerAdapterChatMessage, channelTopic);
//        return container;
//    }

    /** 실제 메시지를 처리하는 subscriber 설정 추가*/
//    @Bean
//    public MessageListenerAdapter listenerAdapterChatMessage(RedisMessageSubscriber subscriber) {
//        // subscriber 내의 메서드명을 지정
//        return new MessageListenerAdapter(subscriber, "sendMessage");
//    }

    /** 실제 메시지 방을 처리하는 subscriber 설정 추가*/
//    @Bean
//    public MessageListenerAdapter listenerAdapterChatRoomList(RedisMessageSubscriber subscriber) {
//        return new MessageListenerAdapter(subscriber, "sendRoomList");
//    }
//    @Bean
//    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
//        RedisTemplate<String, Object> redisTemplate = new RedisTemplate<>();
//        redisTemplate.setConnectionFactory(connectionFactory);
//
//        // ObjectMapper 생성 및 JavaTimeModule 등록
//        ObjectMapper objectMapper = new ObjectMapper();
//        objectMapper.registerModule(new JavaTimeModule());
//
//        // Jackson2JsonRedisSerializer 생성 시 ObjectMapper 설정
//        Jackson2JsonRedisSerializer<Object> jsonSerializer = new Jackson2JsonRedisSerializer<>(objectMapper,
//                Object.class);
//
//        redisTemplate.setKeySerializer(new StringRedisSerializer());
//        redisTemplate.setValueSerializer(jsonSerializer); // 수정된 부분
//
//        // hash key/value 시리얼라이저 설정
//        redisTemplate.setHashKeySerializer(new StringRedisSerializer());
//        redisTemplate.setHashValueSerializer(jsonSerializer);
//
//        return redisTemplate;
//    }

}