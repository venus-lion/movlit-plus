package movlit.be.chat_room.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.List;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.chat_room.domain.GroupChatroom;
import movlit.be.chat_room.domain.repository.GroupChatRepository;
import movlit.be.chat_room.presentation.dto.CheckJoinGroupChatroomRequest;
import movlit.be.chat_room.presentation.dto.GroupChatroomMemberResponse;
import movlit.be.chat_room.presentation.dto.GroupChatroomRequest;
import movlit.be.chat_room.presentation.dto.GroupChatroomResponseDto;
import movlit.be.common.exception.GroupChatroomAlreadyJoinedException;
import movlit.be.common.exception.GroupChatroomNotFoundException;
import movlit.be.common.util.ids.GroupChatroomId;
import movlit.be.common.util.ids.MemberId;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupChatroomService {
    private final GroupChatRepository groupChatRepository;

    // 그룹채팅 존재 유무 확인
    public GroupChatroomResponseDto fetchGroupChatroom(GroupChatroomRequest request) {
        String contentType = request.getContentType().trim();
        GroupChatroomResponseDto groupChatroomRes = null;

        if (contentType.equals("movie")) {
            Long movieId = request.getContentId();
            String roomContentId = "MV_" + movieId;

            groupChatroomRes = groupChatRepository.fetchRoomByContentId(roomContentId);

        } else if (contentType.equals("book")) {
            Long bookId = request.getContentId();
            String roomContentId = "BK_" + bookId;

            groupChatroomRes = groupChatRepository.fetchRoomByContentId(roomContentId);
        }
        if (groupChatroomRes == null) {
            log.info(">> 해당 하는 그룹 채팅방이 존재하지 않습니다.");
        } else {
            log.info(">> GroupChatRoomRes : " + groupChatroomRes);
        }

        return groupChatroomRes;
    }

    // 내가 가입한 그룹채팅 리스트만 가져오기
    public List<GroupChatroomResponseDto> fetchMyGroupChatroomList(MemberId memberId) {
        return groupChatRepository.fetchGroupChatroomByMemberId(memberId);
    }

    public GroupChatroom fetchGroupChatroomById(GroupChatroomId groupChatroomId) {
        return groupChatRepository.findByChatroomId(groupChatroomId);
    }

    public Boolean checkIfGroupChatroomJoin(MemberId memberId, CheckJoinGroupChatroomRequest request) {
        try {
            String contentId;

            if ("movie".equals(request.contentType())) {
                contentId = "MV_" + request.contentId();
            } else {
                contentId = "BK_" + request.contentId();
            }

            GroupChatroom groupChatroom = groupChatRepository.fetchEntityByContentId(contentId);
            validateAlreadyJoined(memberId, groupChatroom);

            return false;

        } catch (GroupChatroomNotFoundException e) {
            return false;
        } catch (GroupChatroomAlreadyJoinedException e) {
            return true;
        }
    }
    private void validateAlreadyJoined(MemberId memberId, GroupChatroom existingGroupChatroom) {
        if (existingGroupChatroom.getMemberRChatroom().stream()
                .anyMatch(rChatroom -> rChatroom.getMember().getMemberId().equals(memberId))) {
            throw new GroupChatroomAlreadyJoinedException();
        }
    }
}
