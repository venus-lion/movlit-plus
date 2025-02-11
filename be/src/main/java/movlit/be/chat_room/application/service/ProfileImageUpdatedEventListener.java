package movlit.be.chat_room.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.chat_room.presentation.dto.OneononeChatroomResponse;
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
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class ProfileImageUpdatedEventListener {

    private final RedisMessagePublisher redisMessagePublisher;
    private final FetchGroupChatroomUseCase fetchGroupChatroomUseCase;
    private final GroupChatroomUseCase groupChatroomUseCase;
    private final MemberReadService memberReadService;
    private final OneononeChatroomService oneononeChatroomService;

    @TransactionalEventListener
    public void handleProfileImageUpdatedEvent(ProfileImageUpdatedEvent event) throws JsonProcessingException {
        MemberId memberId = event.getMemberId();

        // 1. 해당 멤버와 관련된 모든 1:1 채팅방 ID 조회
        List<OneononeChatroomResponse> oneononeChatrooms = oneononeChatroomService.fetchMyOneOnOneChatList(
                memberId);

        // 2. 업데이트된 멤버 정보 조회
        MemberEntity updatedMember = memberReadService.findEntityById(memberId);
        log.info("개인채팅방 >>> 프로필 업데이트된 멤버 정보 : " + updatedMember.toStringExceptLazyLoading());

        // 3. 각 1:1 채팅방에 대해 UpdateRoomDto 생성 및 메시지 발행
        for (OneononeChatroomResponse chatroom : oneononeChatrooms) {
            // UpdateRoomDto 생성
            UpdateRoomDto updateRoomDto = new UpdateRoomDto(
                    chatroom.getRoomId().getValue(), // 1:1 채팅방 ID
                    MessageType.ONE_ON_ONE, // 1:1 채팅 타입
                    EventType.MEMBER_PROFILE_UPDATE, // 프로필 업데이트 이벤트
                    memberId, // 업데이트된 멤버 ID
                    updatedMember.getProfileImgUrl(),
                    true
            );

            // Redis 메시지 발행
            redisMessagePublisher.updateRoom(updateRoomDto);
        }

        // ------------------- 그룹 채팅 관련 로직 ------------------------
        // 1. 해당 멤버가 속한 모든 그룹채팅방 ID를 조회
        List<GroupChatroomResponseDto> groupChatroomResponseDtoList = fetchGroupChatroomUseCase.execute(memberId);

        // 2. 각 그룹채팅방 ID에 대해 updatedRoomDto 생성 및 메세지 발행
        for (GroupChatroomResponseDto groupChatroomResponseDto : groupChatroomResponseDtoList) {
            GroupChatroomId groupChatroomId = groupChatroomResponseDto.getGroupChatroomId();

            // 3. 캐시된 멤버 목록 가져오기 (캐시 없으면 자동 생성)
            List<GroupChatroomMemberResponse> cachedMembers = groupChatroomUseCase.fetchMembersInGroupChatroom(
                    groupChatroomId, true);

            // 4. 업데이트된 멤버 정보 설정
            GroupChatroomMemberResponse updatedMemberResponse = new GroupChatroomMemberResponse(
                    updatedMember.getMemberId(),
                    updatedMember.getNickname(),
                    updatedMember.getProfileImgUrl()
            );

            // 5. 기존 캐시된 멤버 목록에서 업데이트된 멤버 정보 수정
            for (int i = 0; i < cachedMembers.size(); i++) {
                if (cachedMembers.get(i).getMemberId().equals(memberId)) {
                    cachedMembers.set(i, updatedMemberResponse);
                    break;
                }
            }

            // 6. 업데이트된 멤버목록 Redis에 캐싱
            groupChatroomUseCase.updateCachedMembers(groupChatroomId, cachedMembers);

            // 7. UpdateRoomDto 생성 및 발행
            UpdateRoomDto updateRoomDto = new UpdateRoomDto(
                    groupChatroomId.getValue(),
                    MessageType.GROUP,
                    EventType.MEMBER_PROFILE_UPDATE,
                    memberId,
                    updatedMember.getProfileImgUrl(),
                    true
            );

            redisMessagePublisher.updateRoom(updateRoomDto); // RedisMessageSubscriber에서 처리
        }
    }
//        // 해당 멤버가 속한 모든 그룹채팅방 ID를 조회
//        List<GroupChatroomResponseDto> groupChatroomResponseDtoList = fetchGroupChatroomUseCase.execute(memberId);
//
//        // 업데이트된 멤버정보 조회
//        MemberEntity updatedMember = memberReadService.findEntityById(memberId);
//        log.info("RedisMessageSubscriber >>> 프로필업데이트된 멤버정보 : " + updatedMember.toStringExceptLazyLoading());
//
//        // 각 그룹채팅방 ID에 대해 updatedRoomDto 생성 및 메세지 발행
//        for (GroupChatroomResponseDto groupChatroomResponseDto : groupChatroomResponseDtoList) {
//            GroupChatroomId groupChatroomId = groupChatroomResponseDto.getGroupChatroomId();
//
//            // 캐시된 멤버 목록 가져오기 (캐시 없으면 자동 생성)
//            List<GroupChatroomMemberResponse> cachedMembers = groupChatroomUseCase.fetchMembersInGroupChatroom(
//                    groupChatroomId, true);
//
//            // 업데이트된 멤버 정보 설정
//            GroupChatroomMemberResponse updatedMemberResponse = new GroupChatroomMemberResponse(
//                    updatedMember.getMemberId(),
//                    updatedMember.getNickname(),
//                    updatedMember.getProfileImgUrl()
//            );
//
//            // 기존 캐시된 멤버 목록에서 업데이트된 멤버 정보 수정
//            for (int i = 0; i < cachedMembers.size(); i++) {
//                if (cachedMembers.get(i).getMemberId().equals(memberId)) {
//                    cachedMembers.set(i, updatedMemberResponse);
//                    break;
//                }
//            }
//
//            // 업데이트된 멤버목록 Redis에 캐싱
//            groupChatroomUseCase.updateCachedMembers(groupChatroomId, cachedMembers);
//
//            // UpdateRoomDto 생성 및 발행
//            UpdateRoomDto updateRoomDto = new UpdateRoomDto(
//                    groupChatroomId.getValue(),
//                    MessageType.GROUP,
//                    EventType.MEMBER_PROFILE_UPDATE,
//                    memberId
//            );
//
//            redisMessagePublisher.updateRoom(updateRoomDto); // RedisMessageSubscriber에서 처리
//        }
//    }

}
