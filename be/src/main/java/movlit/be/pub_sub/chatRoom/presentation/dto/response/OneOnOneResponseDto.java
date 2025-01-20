package movlit.be.pub_sub.chatRoom.presentation.dto.response;

import java.time.LocalDateTime;
import lombok.Getter;
import lombok.ToString;

@Getter
@ToString
public class OneOnOneResponseDto extends ChatRoomResponseDto {

    private String memberAId;
    private String memberBId;
    private String roomName;

    public OneOnOneResponseDto(Long id, String memberAId, String memberBId, String currentMemberId) {
        super(id);
        this.memberAId = memberAId;
        this.memberBId = memberBId;
        this.roomName = currentMemberId.equals(memberAId) ? memberAId : memberBId;
    }

    public OneOnOneResponseDto(Long id, String memberAId, String memberBId, LocalDateTime lastChatTime) {
        super(id, lastChatTime);
        this.memberAId = memberAId;
        this.memberBId = memberBId;
    }

}
