package movlit.be.pub_sub.chat_message.infra.persistence;

import java.util.List;
import movlit.be.pub_sub.chat_message.domain.ChatMessage;
import movlit.be.pub_sub.chat_message.presentation.dto.response.ChatMessageDto;
import movlit.be.common.util.ids.MemberId;

public interface ChatMessageRepository {

    void saveMessage(ChatMessage chatMessage);

    List<ChatMessage> findByRoomId(String roomId);

    Long findCountUnreadMessages(String roomId, MemberId memberId);

    List<ChatMessage> findUnreadMessages(String roomId, MemberId memberId);

    // 가장 최근 메시지 반환
    ChatMessageDto findTopByRoomIdOrderByTimestampDesc(String roomId);

}
