package movlit.be.pub_sub;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.pub_sub.chatMessage.presentation.dto.response.ChatMessageDto;
import movlit.be.pub_sub.chatRoom.presentation.dto.OneononeChatroomCreatePubDto;
import movlit.be.pub_sub.chatRoom.presentation.dto.UpdateRoomDto;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.listener.ChannelTopic;
import org.springframework.stereotype.Service;

/**
 * 메시지 발행자(Publisher) 구현
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RedisMessagePublisher {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ChannelTopic sendMessageTopic;
    private final ChannelTopic updateRoomTopic;
    private final ChannelTopic createOneononeChatroomTopic;

    /**
     * 채팅 보내기(sendMessage) 토픽 발행하는 메서드
     *
     * @param chatMessageDto
     */
    public void sendMessage(ChatMessageDto chatMessageDto) {

        log.info("Publishing send message {}", chatMessageDto);
        redisTemplate.convertAndSend(sendMessageTopic.getTopic(), chatMessageDto);

    }

    /*
        채팅방 정보 업데이트 토픽 발행하는 메서드
     */

    public void updateRoom(UpdateRoomDto updateRoomDto) {
        log.info("Publishing update chatroom {}", updateRoomDto);
        redisTemplate.convertAndSend(updateRoomTopic.getTopic(), updateRoomDto);
    }

    /**
     * 일대일 채팅방 생성 토픽 발행하는 메서드
     */
    public void createOneononeChatroom(OneononeChatroomCreatePubDto oneononeChatroomCreatePubDto) {
        log.info("Publishing create oneononeChatroom {}", oneononeChatroomCreatePubDto);
        redisTemplate.convertAndSend(createOneononeChatroomTopic.getTopic(), oneononeChatroomCreatePubDto);
    }

}