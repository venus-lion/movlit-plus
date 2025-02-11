package movlit.be.chat_room.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import java.util.List;
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
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
@Slf4j
public class GroupChatroomJoinedEventListener {

    private final GroupChatroomUseCase groupChatroomUseCase;
    private final RedisMessagePublisher redisMessagePublisher;
    private final MemberReadService memberReadService;

    @TransactionalEventListener
    public void handleGroupChatroomJoinEvent(GroupChatroomJoinedEvent event) throws JsonProcessingException {
        GroupChatroomId groupChatroomId = event.getGroupChatroomId();
        MemberId newMemberId = event.getMemberId();

        // 1. 'ㅇㅇ(닉네임) 님이 가입하셨습니다.' 메세지 생성
        MemberEntity newMember = memberReadService.findEntityById(newMemberId);
        String joinMessage = newMember.getNickname() + " 님이 가입하셨습니다.";

        // 2. 캐시된 멤버 목록 가져오기 (캐시 없으면 자동 생성)
        List<GroupChatroomMemberResponse> cachedMembers = groupChatroomUseCase.fetchMembersInGroupChatroom(
                groupChatroomId, true);

        // 3. 새 멤버 정보 생성 및 캐시된 목록에 추가
        GroupChatroomMemberResponse newMemberResponse = new GroupChatroomMemberResponse(
                newMemberId,
                newMember.getNickname(),
                newMember.getProfileImgUrl()
        );
        cachedMembers.add(newMemberResponse);
        log.info("GroupChatroomJoinedEventListener :: 캐시에 새로운 멤버 추가 :: {}", newMemberResponse);

        // 4. 업데이트된 목록, redis에 저장
        groupChatroomUseCase.updateCachedMembers(groupChatroomId, cachedMembers);

        // 5. UpdateRoomDto 생성
        UpdateRoomDto updateRoomDto = new UpdateRoomDto(
                groupChatroomId.getValue(),
                MessageType.GROUP,
                EventType.MEMBER_JOIN,
                newMemberId,
                joinMessage // 입장메세지 설정
        );

        // 6. /topic/chat/room/{roomId} 토픽으로 업데이트된 멤버 목록 발행 -> RedisMessageSubscriber에서 처리
        redisMessagePublisher.updateRoom(updateRoomDto);
        }
}
