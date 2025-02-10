package movlit.be.chatRoom.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.chatMessage.presentation.dto.response.MessageType;
import movlit.be.chatRoom.application.service.dto.ProfileImageUpdatedEvent;
import movlit.be.chatRoom.presentation.dto.GroupChatroomMemberResponse;
import movlit.be.chatRoom.presentation.dto.GroupChatroomResponseDto;
import movlit.be.chatRoom.presentation.dto.UpdateRoomDto;
import movlit.be.chatRoom.presentation.dto.UpdateRoomDto.EventType;
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
public class ProfileImageUpdatedEventListener {

    private final RedisMessagePublisher redisMessagePublisher;
    private final FetchGroupChatroomUseCase fetchGroupChatroomUseCase;

    private final RedisTemplate<String, Object> redisTemplate;
    private final MemberReadService memberReadService;
    private final ObjectMapper objectMapper;

    private static final String CHATROOM_MEMBERS_KEY_PREFIX = "chatroom:";
    private static final String CHATROOM_MEMBERS_KEY_SUFFIX = ":members";
    private static final long CHATROOM_MEMBERS_CACHE_TTL = 60 * 60; // 1시간

    @TransactionalEventListener
    public void handleProfileImageUpdatedEvent(ProfileImageUpdatedEvent event) throws JsonProcessingException {
        MemberId memberId = event.getMemberId();

        // 해당 멤버가 속한 모든 그룹채팅방 ID를 조회
        List<GroupChatroomResponseDto> groupChatroomResponseDtoList = fetchGroupChatroomUseCase.execute(memberId);

        // 업데이트된 멤버정보 조회
        MemberEntity updatedMember = memberReadService.findEntityById(memberId);
        log.info("RedisMessageSubscriber >>> 프로필업데이트된 멤버정보 : " + updatedMember.toStringExceptLazyLoading());

        // 각 그룹채팅방 ID에 대해 updatedRoomDto 생성 및 메세지 발행
        for (GroupChatroomResponseDto groupChatroomResponseDto : groupChatroomResponseDtoList) {
            GroupChatroomId groupChatroomId = groupChatroomResponseDto.getGroupChatroomId();

            // 캐시 키 생성
            String cacheKey = CHATROOM_MEMBERS_KEY_PREFIX + groupChatroomId + CHATROOM_MEMBERS_KEY_SUFFIX;

            // Redis에서 현재 캐시된 데이터 조회
            String cachedJson = (String) redisTemplate.opsForValue().get(cacheKey);

            List<GroupChatroomMemberResponse> cachedMembers;
            if (cachedJson != null) {
                // 캐시된 데이터(Json 문자열)를 List<GroupChatroomMemberResponse>로 역직렬화
                cachedMembers = objectMapper.readValue(cachedJson, new TypeReference<>() {
                });

                // 업데이트된 멤버 정보 설정
                GroupChatroomMemberResponse updatedMemberResponse = new GroupChatroomMemberResponse(
                        updatedMember.getMemberId(),
                        updatedMember.getNickname(),
                        updatedMember.getProfileImgUrl()
                );

                // 기존에 캐시된 멤버리스트에서, 업데이트된 멤버정보만 수정
                for (int i = 0; i < cachedMembers.size(); i++) {
                    if (cachedMembers.get(i).getMemberId().equals(memberId)) {
                        cachedMembers.set(i, updatedMemberResponse);
                        break;
                    }
                }

                // 업데이트된 멤버리스트를 다시 JSON 문자열로 변환하여, Redis에 캐싱
                String updatedJson = objectMapper.writeValueAsString(cachedMembers);
                redisTemplate.opsForValue().set(cacheKey, updatedJson, CHATROOM_MEMBERS_CACHE_TTL, TimeUnit.SECONDS);

                // UpdateRoomDto 생성 및 발행
                UpdateRoomDto updateRoomDto = new UpdateRoomDto(
                        groupChatroomId,
                        MessageType.GROUP,
                        EventType.MEMBER_PROFILE_UPDATE,
                        memberId
                );

                redisMessagePublisher.updateRoom(updateRoomDto);
            }
        }
    }

}
