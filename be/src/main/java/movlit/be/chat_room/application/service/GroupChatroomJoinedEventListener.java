package movlit.be.chat_room.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.pub_sub.chat_message.presentation.dto.response.MessageType;
import movlit.be.chat_room.application.service.dto.GroupChatroomJoinedEvent;
import movlit.be.chat_room.presentation.dto.GroupChatroomMemberResponse;
import movlit.be.chat_room.presentation.dto.UpdateRoomDto;
import movlit.be.chat_room.presentation.dto.UpdateRoomDto.EventType;
import movlit.be.common.config.RedisMessagePublisher;
import movlit.be.common.util.ids.GroupChatroomId;
import movlit.be.common.util.ids.MemberId;
import movlit.be.member.application.service.MemberReadService;
import movlit.be.member.domain.entity.MemberEntity;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class GroupChatroomJoinedEventListener {

    private final GroupChatroomService groupChatroomService;
    private final RedisMessagePublisher redisMessagePublisher;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private final MemberReadService memberReadService;

    private static final String CHATROOM_MEMBERS_KEY_PREFIX = "chatroom:";
    private static final String CHATROOM_MEMBERS_KEY_SUFFIX = ":members";
    private static final long CHATROOM_MEMBERS_CACHE_TTL = 60 * 60; // 1시간

    @TransactionalEventListener
    public void handleGroupChatroomJoinEvent(GroupChatroomJoinedEvent event) throws JsonProcessingException {
        log.info("GroupChatroomJoinedEventListener 실행..");
        GroupChatroomId groupChatroomId = event.getGroupChatroomId();
        MemberId newMemberId = event.getMemberId();

        // 1. 'ㅇㅇ(닉네임) 님이 가입하셨습니다.' 메세지 생성
        MemberEntity newMember = memberReadService.findEntityById(newMemberId);
        String joinMessage = newMember.getNickname() + " 님이 가입하셨습니다.";

        // 2. UpdateRoomDto 생성 및 발행
        UpdateRoomDto updateRoomDto = new UpdateRoomDto(
                groupChatroomId,
                MessageType.GROUP,
                EventType.MEMBER_JOIN,
                newMemberId,
                joinMessage // 입장메세지 설정
        );

        log.info(">> updateRoomDto :: {}", updateRoomDto.toStringWithJoinMsg());

        // 3. Redis 캐시 업데이트 (RedisMessageSubscriber 메세지 로직 유지)
        String cacheKey = CHATROOM_MEMBERS_KEY_PREFIX + groupChatroomId + CHATROOM_MEMBERS_KEY_SUFFIX;
        String cachedJson = (String) redisTemplate.opsForValue().get(cacheKey);

        List<GroupChatroomMemberResponse> cachedMembers;
        if (cachedJson != null) {
            // 캐시된 데이터(Json 문자열)를 List<GroupChatroomMemberResponse>로 역직렬화
            cachedMembers = objectMapper.readValue(cachedJson, new TypeReference<>() {
            });

            // 새 멤버정보 추가
            GroupChatroomMemberResponse newMemberResponse = new GroupChatroomMemberResponse(
                    newMemberId,
                    newMember.getNickname(),
                    newMember.getProfileImgUrl()
            );
            cachedMembers.add(newMemberResponse);
            log.info("GroupChatroomJoinedEventListener :: 캐시에 새로운 멤버 추가 :: {}", newMemberResponse);

            // 업데이트된 멤버리스트를 다시 JSON 문자열로 변환하여 Redis에 캐싱
            String updatedJson = objectMapper.writeValueAsString(cachedMembers);
            redisTemplate.opsForValue().set(cacheKey, updatedJson, CHATROOM_MEMBERS_CACHE_TTL, TimeUnit.SECONDS);

            // 4. /topic/chat/room/{roomId} 토픽으로 업데이트된 멤버 목록 발행
            redisMessagePublisher.updateRoom(updateRoomDto);
        }

    }

}
