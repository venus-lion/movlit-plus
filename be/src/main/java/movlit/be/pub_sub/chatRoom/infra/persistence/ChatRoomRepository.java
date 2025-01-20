package movlit.be.pub_sub.chatRoom.infra.persistence;

import java.util.List;
import movlit.be.pub_sub.chatRoom.presentation.dto.response.OneOnOneResponseDto;

public interface ChatRoomRepository {

    List<OneOnOneResponseDto> fetchOneOnOneChatRoomList(String memberIdVal);

}
