package movlit.be.common.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.ChannelRegistration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final StompInterceptor stompInterceptor; // JWT 등 인증이 필요하다면 사용

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // /topic (또는 /sub) 으로 시작하는 엔드포인트는 메모리 기반 브로커로 처리
        config.enableSimpleBroker("/topic");
        // 클라이언트가 메시지를 보낼 때 붙이는 prefix
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 클라이언트가 웹소켓 연결을 맺을 엔드포인트
        registry.addEndpoint("/ws-stomp")
                .setAllowedOriginPatterns("*")
                .withSockJS();
    }

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        /* stompHandler가 websocket 앞단에서 token 을 체크할 수 있도록 인터셉터 설정 */
        registration.interceptors(stompInterceptor);
    }

}
