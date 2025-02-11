package movlit.be.chat_room.presentation.controller;

import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import movlit.be.auth.application.service.MyMemberDetails;
import movlit.be.chat_room.application.service.FetchGroupChatroomUseCase;
import movlit.be.chat_room.application.service.GroupChatroomService;
import movlit.be.chat_room.application.service.GroupChatroomUseCase;
import movlit.be.chat_room.presentation.dto.CheckJoinGroupChatroomRequest;
import movlit.be.chat_room.presentation.dto.CheckJoinGroupChatroomResponse;
import movlit.be.chat_room.presentation.dto.GroupChatroomMemberResponse;
import movlit.be.chat_room.presentation.dto.GroupChatroomRequest;
import movlit.be.chat_room.presentation.dto.GroupChatroomResponse;
import movlit.be.chat_room.presentation.dto.GroupChatroomResponseDto;
import movlit.be.common.exception.ChatroomAccessDenied;
import movlit.be.common.util.ids.GroupChatroomId;
import movlit.be.common.util.ids.MemberId;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
public class GroupChatroomController {

    private final GroupChatroomUseCase groupChatroomUseCase;
    private final FetchGroupChatroomUseCase fetchGroupChatroomUseCase;
    private final GroupChatroomService groupChatroomService;

    /**
     * 최초의 채팅방 (생성 후 가입)
     */
    @PostMapping("/api/chat/create/group")
    public ResponseEntity<GroupChatroomResponse> createGroupChatroom(@RequestBody @Valid GroupChatroomRequest request,
                                                                     @AuthenticationPrincipal MyMemberDetails myMemberDetails) {
        var response = groupChatroomUseCase.requestCreateGroupChatroom(request, myMemberDetails.getMemberId());
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // 그룹채팅 존재 유무 확인
    @PostMapping("/api/chat/group")
    public ResponseEntity fetchGroupChatroom(@RequestBody GroupChatroomRequest request) {
        GroupChatroomResponseDto groupChatroomRes = groupChatroomService.fetchGroupChatroom(request);

        return ResponseEntity.ok(groupChatroomRes);
    }

    // 존재하는 그룹채팅방 가입(들어가기)
    @PostMapping("/api/chat/group/{groupChatroomId}")
    public ResponseEntity joinGroupChatroom(@PathVariable GroupChatroomId groupChatroomId,
                                            @AuthenticationPrincipal MyMemberDetails details)
            throws ChatroomAccessDenied {
        if (details != null) {
            MemberId memberId = details.getMemberId();
            GroupChatroomResponse groupChatroomRes = groupChatroomUseCase.joinGroupChatroom(groupChatroomId, memberId);

            return ResponseEntity.ok(groupChatroomRes);
        } else {
            return ResponseEntity.badRequest().build();
        }

    }

    /**
     * 특정 그룹채팅방에 속한 모든 member 정보를 가져온다.
     *
     * @param chatroomId 채팅방 ID
     * @return ChatroomDto 채팅방 정보 및 멤버 리스트
     */
    @GetMapping("/api/chat/{chatroomId}/members")
    public ResponseEntity<List<GroupChatroomMemberResponse>> fetchMembersInGroupChatroom(
            @PathVariable GroupChatroomId chatroomId,
            @RequestParam(required = false, defaultValue = "true") boolean useCache) {
        var response = groupChatroomUseCase.fetchMembersInGroupChatroom(
                chatroomId, useCache);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

    // 내가 가입한 그룹채팅 리스트 가져오기
    @GetMapping("/api/chat/group/rooms/my")
    public ResponseEntity<List<GroupChatroomResponseDto>> fetchMyGroupChats(
            @AuthenticationPrincipal MyMemberDetails details) {
        MemberId memberId = details.getMemberId();
        List<GroupChatroomResponseDto> myGroupChatListRes = fetchGroupChatroomUseCase.execute(memberId);
        return ResponseEntity.status(HttpStatus.OK).body(myGroupChatListRes);
    }

    /**
     * 그룹 채팅방 나가기
     *
     * 현재 로그인한 사용자(MyMemberDetails)가 PathVariable인 GroupChatroomId 에서 나간다
     */
    @DeleteMapping("/api/chat/group/{groupChatroomId}/leave")
    public ResponseEntity<String> leaveGroupChatroom(
            @PathVariable GroupChatroomId groupChatroomId,
            @AuthenticationPrincipal MyMemberDetails details) {

        MemberId memberId = details.getMemberId();
        groupChatroomUseCase.leaveGroupChatroom(groupChatroomId, memberId);

        return ResponseEntity.ok().body(memberId.getValue() + " 님이 그룹채팅방에서 성공적으로 나갔습니다.");

    }

    // 채팅방 가입 여부
    @PostMapping("/api/chat/group/checkJoin")
    public ResponseEntity<CheckJoinGroupChatroomResponse> checkJoin(
            @AuthenticationPrincipal MyMemberDetails details,
            @RequestBody CheckJoinGroupChatroomRequest request) {
        MemberId memberId = details.getMemberId();
        CheckJoinGroupChatroomResponse isJoinedRes = groupChatroomService.checkIsJoined(memberId, request);

        return ResponseEntity.status(HttpStatus.OK).body(isJoinedRes);

    }

}
