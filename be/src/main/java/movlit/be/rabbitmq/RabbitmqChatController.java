package movlit.be.rabbitmq;

import lombok.RequiredArgsConstructor;
import movlit.be.pub_sub.chatMessage.presentation.dto.response.ChatMessageDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class RabbitmqChatController {

    private final RabbitmqChatMessageService chatMessageService;

    @GetMapping("/history")
    public ResponseEntity<List<ChatMessageDto>> fetchChatMessages(@RequestParam Long roomId) {
        List<ChatMessageDto> response = chatMessageService.getChatMessages(roomId);

        return ResponseEntity.ok().body(response);
    }
}
