package movlit.be.common.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.stereotype.Component;

/**
 * WebSocket 통신 시 들어오는 STOMP 메시지를 가로채어
 * 토큰 인증, 헤더 분석 등의 전처리를 수행하는 인터셉터 -> 우린 메인 서버에서 인증,인가 처리를 하기 때문에 스킵
 */
@Slf4j
@Component
public class StompInterceptor implements ChannelInterceptor {

    /** websocket을 통해 들어온 요청이 처리 되기전 실행된다.*/
    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = StompHeaderAccessor.wrap(message);
        return message;
    }

}
