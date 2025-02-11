package movlit.be.chat_room.application.service.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import movlit.be.common.util.ids.MemberId;

@NoArgsConstructor
@Getter
public class RequestDataForCreationWorker {

    private String roomName;
    private String workerContentId;
    private MemberId workerMemberId;

    private RequestDataForCreationWorker(String roomName, String workerContentId, MemberId workerMemberId) {
        this.roomName = roomName;
        this.workerContentId = workerContentId;
        this.workerMemberId = workerMemberId;
    }

    public static RequestDataForCreationWorker from(String roomName, String workerContentId, MemberId workerMemberId) {
        return new RequestDataForCreationWorker(roomName, workerContentId, workerMemberId);
    }

}
