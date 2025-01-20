package movlit.be.pub_sub.chatRoom.presentation.dto.response;

import java.time.LocalDateTime;
import lombok.Getter;

@Getter
public class ChatRoomResponseDto {

    private Long id;
    private LocalDateTime lastChatTime;

    public ChatRoomResponseDto(Long id) {
        this.id = id;
    }

    public ChatRoomResponseDto(Long id, LocalDateTime lastChatTime) {
        this.id = id;
        this.lastChatTime = lastChatTime;
    }

}
