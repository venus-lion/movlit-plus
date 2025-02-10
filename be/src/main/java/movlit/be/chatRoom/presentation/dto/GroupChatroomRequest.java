package movlit.be.chatRoom.presentation.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@AllArgsConstructor
@Getter
public class GroupChatroomRequest {

    @NotBlank(message = "채팅방 제목은 항상 존재해야 합니다.")
    private String roomName;

    @NotBlank(message = "(개발자 알림) 컨텐츠 유형이 비어 있습니다.")
    private String contentType; // movie, book

    @NotNull(message = "컨텐츠의 id가 없습니다.")
    private Long contentId;

}
