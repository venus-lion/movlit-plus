package movlit.be.pub_sub.chatRoom.presentation.dto.response;

import java.time.LocalDateTime;
import java.util.List;
import lombok.Getter;
import movlit.be.pub_sub.chatRoom.entity.ContentType;

@Getter
public class GroupResponseDto extends ChatRoomResponseDto {

    private String roomName;
    private ContentType roomContentType;
    private List<String> participantIds;

    public GroupResponseDto(Long id, LocalDateTime lastChatTime, String roomName, ContentType roomContentType,
                            List<String> participantIds) {
        super(id, lastChatTime);
        this.roomName = roomName;
        this.roomContentType = roomContentType;
        this.participantIds = participantIds;
    }

}
