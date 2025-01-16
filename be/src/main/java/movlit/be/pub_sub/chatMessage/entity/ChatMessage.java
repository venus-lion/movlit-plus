package movlit.be.pub_sub.chatMessage.entity;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
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

    private Long roomId;
    private MemberId senderId;
    private String message;
    private String timestamp;

    @Builder
    public ChatMessage(Long roomId, MemberId senderId, String message) {
        this.roomId = roomId;
        this.senderId = senderId;
        this.message = message;
        this.timestamp = LocalDateTime.now().toString();
    }

}
