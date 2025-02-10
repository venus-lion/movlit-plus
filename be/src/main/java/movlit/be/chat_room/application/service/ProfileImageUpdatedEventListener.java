package movlit.be.chat_room.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

            // 캐시된 멤버 목록 가져오기 (캐시 없으면 자동 생성)
            List<GroupChatroomMemberResponse> cachedMembers = groupChatroomUseCase.fetchMembersInGroupChatroom(
                    groupChatroomId, true);

            // 업데이트된 멤버 정보 설정
            GroupChatroomMemberResponse updatedMemberResponse = new GroupChatroomMemberResponse(
                    updatedMember.getMemberId(),
                    updatedMember.getNickname(),
                    updatedMember.getProfileImgUrl()
            );

            // 기존 캐시된 멤버 목록에서 업데이트된 멤버 정보 수정
            for (int i = 0; i < cachedMembers.size(); i++) {
                if (cachedMembers.get(i).getMemberId().equals(memberId)) {
                    cachedMembers.set(i, updatedMemberResponse);
                    break;
                }
            }

            // 업데이트된 멤버목록 Redis에 캐싱
            groupChatroomUseCase.updateCachedMembers(groupChatroomId, cachedMembers);

            // UpdateRoomDto 생성 및 발행
            UpdateRoomDto updateRoomDto = new UpdateRoomDto(
                    groupChatroomId,
                    MessageType.GROUP,
                    EventType.MEMBER_PROFILE_UPDATE,
                    memberId
            );

            redisMessagePublisher.updateRoom(updateRoomDto); // RedisMessageSubscriber에서 처리
        }
    }

}
