package movlit.be.pub_sub.chat_message.presentation;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.pub_sub.chat_message.application.service.ChatMessageService;
import movlit.be.pub_sub.chat_message.presentation.dto.response.ChatMessageDto;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ChatMessageWriteController {

    private final ChatMessageService chatMessageService;

    @MessageMapping("/chat/message/one-on-one")
    public void sendOneOnOneMessage(@RequestBody ChatMessageDto message) {
        log.info("Received one on one chat message: {}", message);
        chatMessageService.sendMessageForOneOnOne(message);
    }

    @MessageMapping("/chat/message/group")
    public void sendGroupMessage(@RequestBody ChatMessageDto message) {
        log.info("Received group chat message: {}", message);
        chatMessageService.sendMessageForGroup(message);
    }

}
