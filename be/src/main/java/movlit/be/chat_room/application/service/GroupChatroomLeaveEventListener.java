package movlit.be.chat_room.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
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

    private final GroupChatroomUseCase groupChatroomUseCase;
    private final RedisMessagePublisher redisMessagePublisher;
    private final MemberReadService memberReadService;


    @TransactionalEventListener
    public void handleGroupChatroomLeftEvent(GroupChatroomLeftEvent event) throws JsonProcessingException {
        log.info("GroupChatroomLeftEventListener 실행...");
        GroupChatroomId groupChatroomId = event.getGroupChatroomId();
        MemberId leftMemberId = event.getMemberId();

        // 1. 'ㅇㅇ(닉네임)님이 나갔습니다.' 메세지 생성
        MemberEntity leftMember = memberReadService.findEntityById(leftMemberId);
        String leftMessage = leftMember.getNickname() + " 님이 나갔습니다.";

        // 2. 캐시된 멤버 목록 가져오기 (캐시 없으면 자동 생성됨)
        List<GroupChatroomMemberResponse> cachedMembers = groupChatroomUseCase.fetchMembersInGroupChatroom(groupChatroomId, true);

        // 3. 나간 멤버 정보 제거
        cachedMembers.removeIf(member -> member.getMemberId().equals(leftMemberId));
        log.info("GroupChatroomLeftEventListener :: 캐시에서 나간 멤버 제거 :: {}", leftMember.getNickname());

        // 4. 업데이트된 멤버목록, redis에 다시 저장
        groupChatroomUseCase.updateCachedMembers(groupChatroomId, cachedMembers);

        // 5. UpdateRoomDto 생성 및 발행
        UpdateRoomDto updateRoomDto = new UpdateRoomDto(
                groupChatroomId,
                MessageType.GROUP,
                UpdateRoomDto.EventType.MEMBER_LEAVE,
                leftMemberId,
                leftMessage // 나가기 메세지 설정
        );

        // 6. /topic/chat/room/{roomId} 토픽으로 업데이트된 멤버 목록 발행 -> RedisMessageSubscriber에서 처리
        redisMessagePublisher.updateRoom(updateRoomDto);
    }

}
