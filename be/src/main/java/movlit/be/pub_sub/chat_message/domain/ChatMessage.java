package movlit.be.pub_sub.chat_message.domain;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import movlit.be.pub_sub.chat_message.presentation.dto.response.MessageType;
import movlit.be.common.util.ids.MemberId;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "chat_message")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {

    @Id
    private ObjectId id;

    private String roomId;
    private MemberId senderId;
    private String message;
    private String timestamp;
    private MessageType messageType;

    // 읽지 않은 상태를 관리할 필드 (읽은 멤버들의 ID 리스트)
    private List<MemberId> readMembers = new ArrayList<>();

    @Builder
    public ChatMessage(String roomId, MemberId senderId, String message, LocalDateTime regDt, MessageType messageType) {

        this.roomId = roomId;
        this.senderId = senderId;
        this.message = message;
        this.timestamp = regDt.toString();
        this.messageType = messageType;
    }

    //메시지 읽음 처리
    public void markAsRead(MemberId memberId) {
        if (!this.readMembers.contains(memberId)) {
            this.readMembers.add(memberId);
        }
    }

}
