package movlit.be.pub_sub.chatMessage.presentation.dto.response;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import movlit.be.common.util.ids.MemberId;
import org.springframework.data.annotation.CreatedDate;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class ChatMessageDto {

    private String roomId;
    private MemberId senderId;
    private String message;
    
    private LocalDateTime regDt;
    private MessageType messageType;

    public ChatMessageDto(String roomId, MemberId senderId, String message, LocalDateTime regDt,
                          MessageType messageType) {

        this.roomId = roomId;
        this.senderId = senderId;
        this.message = message;
        this.regDt = regDt;
        this.messageType = messageType;
    }

    public ChatMessageDto(String roomId, MemberId senderId, String message, String regDt) {
        this.roomId = roomId;
        this.senderId = senderId;
        this.message = message;
        this.regDt = LocalDateTime.parse(regDt);
    }

}
