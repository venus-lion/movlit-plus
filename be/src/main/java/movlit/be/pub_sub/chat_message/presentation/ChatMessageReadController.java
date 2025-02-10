package movlit.be.pub_sub.chat_message.presentation;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.pub_sub.chat_message.application.service.ChatMessageService;
import movlit.be.pub_sub.chat_message.presentation.dto.response.ChatMessageDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequiredArgsConstructor
@RequestMapping("/api/chat")
public class ChatMessageReadController {

    // history
    private final ChatMessageService chatMessageService;

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessageDto>> fetchChatMessages(@RequestParam String roomId) {
        List<ChatMessageDto> response = chatMessageService.fetchChatMessages(roomId);

        return ResponseEntity.ok().body(response);
    }

    @GetMapping("/recent/{roomId}")
    public ResponseEntity<ChatMessageDto> fetchRecentMessage(@PathVariable String roomId) {
        ChatMessageDto chatMessageRes = chatMessageService.fetchRecentMessage(roomId);
        return ResponseEntity.ok(chatMessageRes);
    }

}
