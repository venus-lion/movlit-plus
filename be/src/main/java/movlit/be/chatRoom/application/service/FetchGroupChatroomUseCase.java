package movlit.be.chatRoom.application.service;

import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import movlit.be.chatMessage.application.service.ChatMessageService;
import movlit.be.chatMessage.presentation.dto.response.ChatMessageDto;
import movlit.be.chatRoom.presentation.dto.GroupChatroomResponseDto;
import movlit.be.common.util.ids.MemberId;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class FetchGroupChatroomUseCase {

    private final GroupChatroomService groupChatroomService;
    private final ChatMessageService chatMessageService;

    // 내가 가입한 그룹채팅 리스트 가져오기
    public List<GroupChatroomResponseDto> execute(MemberId memberId) {
        List<GroupChatroomResponseDto> chatroomList = groupChatroomService.fetchMyGroupChatroomList(memberId);

        return chatroomList.stream()
                .peek(chatroom -> {
                    ChatMessageDto recentMessage = chatMessageService.fetchRecentMessage(
                            chatroom.getGroupChatroomId().getValue());
                    if (Objects.nonNull(recentMessage)) {
                        chatroom.setRecentMessage(recentMessage);
                    }
                })
                .toList();
    }

}
