package movlit.be.chat_room.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.pub_sub.chat_message.presentation.dto.response.MessageType;
import movlit.be.chat_room.application.service.dto.GroupChatroomLeftEvent;
import movlit.be.chat_room.presentation.dto.GroupChatroomMemberResponse;
import movlit.be.chat_room.presentation.dto.UpdateRoomDto;
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
public class GroupChatroomLeaveEventListener {

    private final GroupChatroomService groupChatroomService;
    private final RedisMessagePublisher redisMessagePublisher;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private final MemberReadService memberReadService;

    private static final String CHATROOM_MEMBERS_KEY_PREFIX = "chatroom:";
    private static final String CHATROOM_MEMBERS_KEY_SUFFIX = ":members";
    private static final long CHATROOM_MEMBERS_CACHE_TTL = 60 * 60; // 1시간

    @TransactionalEventListener
    public void handleGroupChatroomLeftEvent(GroupChatroomLeftEvent event) throws JsonProcessingException {
        log.info("GroupChatroomLeftEventListener 실행...");
        GroupChatroomId groupChatroomId = event.getGroupChatroomId();
        MemberId leftMemberId = event.getMemberId();

        // 1. 'ㅇㅇ(닉네임)님이 나갔습니다.' 메세지 생성
        MemberEntity leftMember = memberReadService.findEntityById(leftMemberId);
        String leftMessage = leftMember.getNickname() + " 님이 나갔습니다.";

        // 2. UpdateRoomDto 생성 및 발행
        UpdateRoomDto updateRoomDto = new UpdateRoomDto(
                groupChatroomId,
                MessageType.GROUP,
                UpdateRoomDto.EventType.MEMBER_LEAVE,
                leftMemberId,
                leftMessage // 나가기 메세지 설정
        );

        log.info(">> updateRoomDto :: {}", updateRoomDto);

        // 3. Redis 캐시 업데이트 (RedisMessageSubscriber 메세지 로직 유지)
        String cacheKey = CHATROOM_MEMBERS_KEY_PREFIX + groupChatroomId + CHATROOM_MEMBERS_KEY_SUFFIX;
        String cachedJson = (String) redisTemplate.opsForValue().get(cacheKey);

        List<GroupChatroomMemberResponse> cachedMembers;
        if (cachedJson != null) {
            // 캐시된 데이터(Json 문자열)를 List<GroupChatroomMemberResponse>로 역직렬화
            cachedMembers = objectMapper.readValue(cachedJson, new TypeReference<>() {
            });

            // 나간 멤버 정보 제거
            cachedMembers.removeIf(member -> member.getMemberId().equals(leftMemberId));
            log.info("GroupChatroomLeftEventListener :: 캐시에서 나간 멤버 제거 :: {}", leftMember.getNickname());

            // 업데이트된 멤버리스트를 다시 JSON 문자열로 변환하여, Redis에 캐싱
            String updatedJson = objectMapper.writeValueAsString(cachedMembers);
            redisTemplate.opsForValue().set(cacheKey, updatedJson, CHATROOM_MEMBERS_CACHE_TTL, TimeUnit.SECONDS);

            // /topic/chat/room/{roomId} 토픽으로 업데이트된 멤버 목록 발행
            redisMessagePublisher.updateRoom(updateRoomDto);
        }


    }

}
