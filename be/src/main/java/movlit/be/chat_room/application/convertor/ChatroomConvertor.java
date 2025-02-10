package movlit.be.chat_room.application.convertor;

import java.time.LocalDateTime;
import java.util.Objects;
import movlit.be.chat_room.application.service.dto.RequestDataForCreationWorker;
import movlit.be.chat_room.domain.GroupChatroom;
import movlit.be.chat_room.domain.MemberRChatroom;
import movlit.be.common.exception.ContentTypeNotExistException;
import movlit.be.common.util.IdFactory;

public class ChatroomConvertor {

    private ChatroomConvertor() {
    }

    public static MemberRChatroom makeNonReMemberRChatroom() {
        return new MemberRChatroom(IdFactory.createMemberRChatroom(), LocalDateTime.now());
    }

    public static GroupChatroom makeNonReGroupChatroom(RequestDataForCreationWorker data) {
        return new GroupChatroom(IdFactory.createGroupChatroomId(),
                data.getRoomName(),
                data.getWorkerContentId(),
                LocalDateTime.now());
    }

    public static String generateContentId(String contentType, Long contentId) {
        if (Objects.equals(contentType, "movie")) {
            return "MV_" + contentId;
        }

        if (Objects.equals(contentType, "book")) {
            return "BK_" + contentId;
        }

        throw new ContentTypeNotExistException();
    }

}
