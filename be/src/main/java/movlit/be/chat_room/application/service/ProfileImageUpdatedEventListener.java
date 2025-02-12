package movlit.be.chat_room.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;
import java.util.Objects;
import java.util.concurrent.TimeUnit;

import java.util.stream.IntStream;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.chat_room.presentation.dto.OneononeChatroomResponse;
import movlit.be.common.util.ids.OneononeChatroomId;
import movlit.be.pub_sub.chat_message.presentation.dto.response.MessageType;
import movlit.be.chat_room.application.service.dto.ProfileImageUpdatedEvent;
import movlit.be.chat_room.presentation.dto.GroupChatroomMemberResponse;
import movlit.be.chat_room.presentation.dto.GroupChatroomResponseDto;
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
public class ProfileImageUpdatedEventListener {

    private final RedisMessagePublisher redisMessagePublisher;
    private final FetchGroupChatroomUseCase fetchGroupChatroomUseCase;
    private final GroupChatroomUseCase groupChatroomUseCase;
    private final FetchOneononeChatroomUseCase fetchOneononeChatroomUseCase;
    private final RedisTemplate<String, String> stringRedisTemplate;
    private final MemberReadService memberReadService;
    private final ObjectMapper objectMapper;
    private static final String ONE_ON_ONE_CHATROOM_KEY_PREFIX = "oneononeChatList:";

    @TransactionalEventListener
    public void handleProfileImageUpdatedEvent(ProfileImageUpdatedEvent event) throws JsonProcessingException {
        MemberId memberId = event.getMemberId();

        // 해당 멤버가 속한 모든 그룹채팅방 ID를 조회
        List<GroupChatroomResponseDto> groupChatroomResponseDtoList = fetchGroupChatroomUseCase.execute(memberId);

        // 업데이트된 멤버정보 조회
        MemberEntity updatedMember = memberReadService.findEntityById(memberId);

        // 일대일 채팅방에 프로필정보 발행
        publishToOneononeChat(updatedMember);

        // 각 그룹채팅방 ID에 대해 updatedRoomDto 생성 및 메세지 발행
        for (GroupChatroomResponseDto groupChatroomResponseDto : groupChatroomResponseDtoList) {
            GroupChatroomId groupChatroomId = groupChatroomResponseDto.getGroupChatroomId();

            updateGroupChatroomCacheAndPublish(groupChatroomId, updatedMember);
        }
    }

    public void updateGroupChatroomCacheAndPublish(GroupChatroomId groupChatroomId, MemberEntity updatedMember){
        // 캐시된 멤버 목록 가져오기 (캐시 없으면 자동 생성)
        List<GroupChatroomMemberResponse> cachedMembers = groupChatroomUseCase.fetchMembersInGroupChatroom(
        groupChatroomId, true);

        // 업데이트된 멤버정보 생성
        GroupChatroomMemberResponse updatedMemberResponse = GroupChatroomMemberResponse.from(updatedMember);

        // 기존 캐시된 멤버 목록에서 업데이트된 멤버 정보 수정
        modifyCachedMember(cachedMembers, updatedMemberResponse);

        // 업데이트된 멤버목록 Redis에 캐싱
        groupChatroomUseCase.updateCachedMembers(groupChatroomId, cachedMembers);

        // UpdateRoomDto 생성 및 발행
        UpdateRoomDto updateRoomDto = UpdateRoomDto.UpdateRoomDtoForProfileUpdate(groupChatroomId.getValue(),
                updatedMember.getMemberId());

        redisMessagePublisher.updateRoom(updateRoomDto); // RedisMessageSubscriber에서 처리
    }

    private void modifyCachedMember(List<GroupChatroomMemberResponse> cachedMembers,
                                        GroupChatroomMemberResponse updatedMemberResponse){

        IntStream.range(0, cachedMembers.size())
                .filter(i -> Objects.equals(cachedMembers.get(i).getMemberId(),
                             updatedMemberResponse.getMemberId()))
                .findFirst()
                .ifPresent(i -> cachedMembers.set(i, updatedMemberResponse));
    }

    private void publishToOneononeChat(MemberEntity member) throws JsonProcessingException {
        // 이 멤버가 속한 1:1 채팅방 조회 (캐시 혹은 DB)
        List<OneononeChatroomResponse> chatrooms = fetchOneononeChatroomUseCase.execute(member.getMemberId());

        // 상대방에게 프로필 업데이트 사실 알리고 Redis 캐시 갱신
        for (OneononeChatroomResponse oneononeChatroomResponse : chatrooms) {
            MemberId receiverId = oneononeChatroomResponse.getReceiverId();     // 상대방 멤버 ID
            log.info("=== Oneonone - receiverId : {}", receiverId.getValue());

            String cacheKey = ONE_ON_ONE_CHATROOM_KEY_PREFIX + receiverId.getValue();
            String field = oneononeChatroomResponse.getRoomId().getValue();
            // Redis에서 채팅방 목록 조회
            Object cachedData = stringRedisTemplate.opsForHash().get(cacheKey, field);

            if (cachedData != null) {
                // 역직렬화
                // 4) 역직렬화
                String jsonString = (String) cachedData;
                OneononeChatroomResponse response = objectMapper.readValue(jsonString, OneononeChatroomResponse.class);

                // 프로필 업데이트
                response.updateProfileImgUrl(member.getProfileImgUrl());

                // 직렬화
                String updatedJson = objectMapper.writeValueAsString(response);
                stringRedisTemplate.opsForHash().put(cacheKey, field, updatedJson);

                // 필요하면 로그 확인
                log.info("Updated 1:1 chat in Redis. key={}, field={}, updatedNickname={}",
                        cacheKey, field, member.getNickname());
            }

            // UpdateRoomDto 생성 및 발행
            UpdateRoomDto updateRoomDto = new UpdateRoomDto(
                    oneononeChatroomResponse.getRoomId().getValue(),
                    MessageType.ONE_ON_ONE,
                    EventType.MEMBER_PROFILE_UPDATE,
                    receiverId
            );

            redisMessagePublisher.updateRoom(updateRoomDto);
        }
    }

}
