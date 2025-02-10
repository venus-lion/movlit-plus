package movlit.be.chatMessage.presentation.dto.response;

import lombok.Getter;
import movlit.be.common.util.ids.MemberId;
import org.bson.types.ObjectId;

/**
 * 메시지 읽음 처리 발행의 처리를 위한 DTO 클래스
 */
@Getter
public class ReadMessageDto {

    private String roomId;
    private ObjectId chatMessageId;
    private MemberId memberId;

}
