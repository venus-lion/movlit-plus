package movlit.be.pub_sub.chatRoom.presentation;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.auth.application.service.MyMemberDetails;
import movlit.be.common.util.ids.MemberId;
import movlit.be.pub_sub.chatRoom.application.service.OneOnOneChatRoomService;
import movlit.be.pub_sub.chatRoom.presentation.dto.response.OneOnOneResponseDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/chatRoom")
public class ChatRoomController {

    private final OneOnOneChatRoomService oneOnOneChatRoomService;

    @GetMapping("/oneOnOne/list")
    public ResponseEntity<List<OneOnOneResponseDto>> fetchOneOnOneChatRoomList(
            @AuthenticationPrincipal MyMemberDetails details
    ) {
        MemberId memberId = details.getMemberId();

        return ResponseEntity.ok(oneOnOneChatRoomService.fetchOneOnOneChatRoomList(memberId));
    }

}
