package movlit.be.chat_room.presentation.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@NoArgsConstructor
@Builder
@ToString
public class CheckJoinGroupChatroomResponse {
    private Boolean isJoined;
    private String url = "";

    public CheckJoinGroupChatroomResponse(Boolean isJoined, String url){
        this.isJoined = isJoined;
        this.url = url;
    }
}
