package movlit.be.pub_sub.chatRoom.presentation.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.auth.application.service.MyMemberDetails;
import movlit.be.common.util.ids.MemberId;
import movlit.be.pub_sub.chatRoom.application.service.FetchMyOneononeChatroomUseCase;
import movlit.be.pub_sub.chatRoom.application.service.OneononeChatroomService;
import movlit.be.pub_sub.chatRoom.presentation.dto.OneononeChatroomCreatePubRequest;
import movlit.be.pub_sub.chatRoom.presentation.dto.OneononeChatroomRequest;
import movlit.be.pub_sub.chatRoom.presentation.dto.OneononeChatroomResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@Slf4j
public class OneononeChatroomController {

    private final OneononeChatroomService oneononeChatroomService;
    private final FetchMyOneononeChatroomUseCase fetchMyOneononeChatroomUseCase;

    @GetMapping("/api/chat/oneOnOne")
    public ResponseEntity<List<OneononeChatroomResponse>> fetchMyOneOnOneChatList(
            @AuthenticationPrincipal MyMemberDetails details) {
        if (details == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        MemberId memberId = details.getMemberId();
        List<OneononeChatroomResponse> response = fetchMyOneononeChatroomUseCase.execute(memberId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/api/chat/create/oneOnOne")
    public ResponseEntity<OneononeChatroomResponse> createOneOnOneChatroom(
            @RequestBody OneononeChatroomRequest request,
            @AuthenticationPrincipal MyMemberDetails details) {

        if (details == null) {
            return new ResponseEntity<>(HttpStatus.UNAUTHORIZED);
        }

        MemberId memberId = details.getMemberId();
        OneononeChatroomResponse response = oneononeChatroomService.createOneononeChatroom(memberId, request);

        return ResponseEntity.ok(response);

    }

    // 처음 일대일 채팅방을 만든 후 메시지 보낼 경우 상대방에게 채팅방 발행
    @PostMapping("/api/chat/oneOnOne/create-publish")
    public void sendCreateOneononeChatroom(
            @AuthenticationPrincipal MyMemberDetails details,
            @RequestBody OneononeChatroomCreatePubRequest request) {
        log.info("Received OneononeChatroom Create Send : {}", request);
        MemberId topicSenderId = details.getMemberId();
        oneononeChatroomService.publishOneononeChatroomCreate(topicSenderId, request);
    }

    // TODO : 채팅방 나가기

}
