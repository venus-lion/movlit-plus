package movlit.be.pub_sub;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.common.exception.ContentTypeNotExistException;
import movlit.be.common.util.ids.GroupChatroomId;
import movlit.be.pub_sub.chatMessage.presentation.dto.response.ChatMessageDto;
import movlit.be.pub_sub.chatMessage.presentation.dto.response.MessageType;
import movlit.be.pub_sub.chatRoom.presentation.dto.GroupChatroomMemberResponse;
import movlit.be.pub_sub.chatRoom.presentation.dto.OneononeChatroomCreatePubDto;
import movlit.be.pub_sub.chatRoom.presentation.dto.UpdateRoomDto;
import movlit.be.pub_sub.chatRoom.presentation.dto.UpdateRoomDto.EventType;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * 메시지 수신자(Subscriber) 구현
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class RedisMessageSubscriber {

    private final ObjectMapper objectMapper;
    private final SimpMessageSendingOperations messagingTemplate;
    private final RedisTemplate<String, Object> redisTemplate;

    private static final String CHATROOM_MEMBERS_KEY_PREFIX = "chatroom:";
    private static final String CHATROOM_MEMBERS_KEY_SUFFIX = ":members";
    private static final long CHATROOM_MEMBERS_CACHE_TTL = 60 * 60; // 1시간

    /**
     * Redis에서 메시지가 발행(publish)되면
     * 대기하고 있던 Redis Subscriber가 해당 메시지를 받아 처리한다.
     */
    public void sendMessage(String publishMessage) {
        try {
            ChatMessageDto chatMessageDto = objectMapper.readValue(publishMessage, ChatMessageDto.class);

            // 1:1 채팅 메시지
            if (chatMessageDto.getMessageType() == MessageType.ONE_ON_ONE) {
                log.info("1:1 채팅 메시지");
                messagingTemplate.convertAndSend(
                        "/topic/chat/message/one-on-one/" + chatMessageDto.getRoomId(), chatMessageDto
                );
                return;
            }

            // 그룹 채팅 메시지
            if (chatMessageDto.getMessageType() == MessageType.GROUP) {
                log.info("일반 그룹 채팅 메시지");
                messagingTemplate.convertAndSend(
                        "/topic/chat/message/group/" + chatMessageDto.getRoomId(), chatMessageDto
                );
                return;
            }

            throw new ContentTypeNotExistException();

        } catch (Exception e) {
            log.error("Exception {}", e);
        }
    }

    public void updateRoom(String publishMessage) {
        try {
            // 1. publisher로부터 발행받은 updateRoomDto 체크
            UpdateRoomDto updateRoomDto = objectMapper.readValue(publishMessage, UpdateRoomDto.class);
            log.info("RedisMessageSubscriber ::: publisher부터 발행받은 updateRoomDto - Profile_Update : "
                    + updateRoomDto.toString());
            log.info("RedisMessageSubscriber ::: publisher부터 발행받은 updateRoomDto - Member_Join : "
                    + updateRoomDto.toStringWithJoinMsg());

            GroupChatroomId groupChatroomId = updateRoomDto.getGroupChatroomId();

            // 2. 캐시 키 생성 (roomId 사용)
            String cacheKey = CHATROOM_MEMBERS_KEY_PREFIX + groupChatroomId + CHATROOM_MEMBERS_KEY_SUFFIX;

            // 3. Redis에서 캐시된 데이터 조회
            String cachedJson = (String) redisTemplate.opsForValue().get(cacheKey);

            if (cachedJson != null) {
                // 캐시된 데이터(Json 문자열)를 List<GroupChatroomMemberResponse>로 역직렬화
                List<GroupChatroomMemberResponse> cachedMembers = objectMapper.readValue(cachedJson,
                        new TypeReference<>() {
                        });

                // WebSocket 클라이언트한테 업데이트된 멤버정보 전송
                System.out.println("RedisMessageSubscriber >>>> roomId :: " + groupChatroomId);

                if (updateRoomDto.getEventType().equals(EventType.MEMBER_PROFILE_UPDATE)) {
                    // 멤버 프로필 업데이트 이벤트 처리
                    messagingTemplate.convertAndSend("/topic/chat/room/" + groupChatroomId.getValue(), cachedMembers);
                } else if (updateRoomDto.getEventType().equals(EventType.MEMBER_JOIN)) {
                    // 새로운 멤버가입 이벤트 처리
                    // eventMessage와 cachedMembers를 함께 전송
                    Map<String, Object> response = new HashMap<>();
                    response.put("updateRoomDto", updateRoomDto);
                    response.put("cachedMembers", cachedMembers);
                    log.info("RedisMessageSubscriber의 cachedMembers 개수 : {}", cachedMembers.size());

                    messagingTemplate.convertAndSend("/topic/chat/room/" + groupChatroomId.getValue(), response);
                } else if (updateRoomDto.getEventType().equals(EventType.MEMBER_LEAVE)) {
                    // 기존 멤버 나가는 이벤트 처리
                    // eventMessage와 cachedMembers 함께 전송
                    Map<String, Object> response = new HashMap<>();
                    response.put("updateRoomDto", updateRoomDto);
                    response.put("cachedMembers", cachedMembers);

                    messagingTemplate.convertAndSend("/topic/chat/room/" + groupChatroomId.getValue(), response);
                }
            }

        } catch (Exception e) {
            log.error("Exception in updateRoom {}", e);
        }
    }

    public void createOneononeChatroom(String publishMessage) {
        try {
            OneononeChatroomCreatePubDto oneononeChatroomCreatePubDto = objectMapper.readValue(publishMessage,
                    OneononeChatroomCreatePubDto.class);
            log.info("Received message to 'createOneononeChatroom' : {}", publishMessage);
            messagingTemplate.convertAndSend(
                    "/topic/oneononeChatroom/create/publish/" + oneononeChatroomCreatePubDto.getTopicReceiverId()
                            .getValue(),
                    oneononeChatroomCreatePubDto
            );

        } catch (Exception e) {
            log.error("Exception in OneononeChatroom publish : {}", e);
        }


    }

    public void readMessage(String publishMessage) {
        try {
            ChatMessageDto chatMessageDto = objectMapper.readValue(publishMessage, ChatMessageDto.class);
            log.info("Received message to 'readMessage': {}", publishMessage);
            messagingTemplate.convertAndSend(
                    "/topic/chat/readMessage/", publishMessage
            );
            // 메시지를 필요에 따라 처리
        } catch (Exception e) {
            log.error("Exception in updateRoom {}");
        }
    }

}