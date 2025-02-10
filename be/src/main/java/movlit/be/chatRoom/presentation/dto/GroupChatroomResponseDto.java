package movlit.be.chatRoom.presentation.dto;

import java.time.LocalDateTime;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import movlit.be.chatMessage.presentation.dto.response.ChatMessageDto;
import movlit.be.common.util.ids.GroupChatroomId;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class GroupChatroomResponseDto {

    private GroupChatroomId groupChatroomId;
    private String contentId; // MV_movieId, BK_bookId
    private String roomName; // 채팅방 이름
    private String contentName; // 콘텐츠(책, 영화)이름
    private LocalDateTime regDt; // 채팅방 생성일
    private ChatMessageDto recentMessage; // 최근 메시지

    public GroupChatroomResponseDto(GroupChatroomId groupChatroomId, String contentId, String roomName,
                                    String contentName,
                                    LocalDateTime regDt) {
        this.groupChatroomId = groupChatroomId;
        this.contentId = contentId;
        this.roomName = roomName;
        this.contentName = contentName;
        this.regDt = regDt;
    }

    public void setRecentMessage(ChatMessageDto recentMessage) {
        this.recentMessage = recentMessage;
    }

}
