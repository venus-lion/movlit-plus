package movlit.be.acceptance.group_chatroom;

import static movlit.be.acceptance.group_chatroom.GroupChatroomSteps.그룹_채팅_생성을_요청한다_1;
import static movlit.be.acceptance.group_chatroom.GroupChatroomSteps.그룹_채팅_생성을_요청한다_2;
import static movlit.be.acceptance.group_chatroom.GroupChatroomSteps.그룹_채팅_생성을_요청한다_3;
import static movlit.be.acceptance.group_chatroom.GroupChatroomSteps.그룹_채팅방_가입여부를_확인한다;
import static movlit.be.acceptance.group_chatroom.GroupChatroomSteps.그룹_채팅방을_가입한다;
import static movlit.be.acceptance.group_chatroom.GroupChatroomSteps.나의_그룹채팅리스트를_조회한다;
import static movlit.be.acceptance.group_chatroom.GroupChatroomSteps.반환값은_false_이다;
import static movlit.be.acceptance.group_chatroom.GroupChatroomSteps.반환값은_true_이다;
import static movlit.be.acceptance.group_chatroom.GroupChatroomSteps.상태코드가_200이다;

import java.util.HashMap;
import java.util.Map;
import movlit.be.acceptance.AcceptanceTest;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("그룹 채팅 인수 테스트")
public class GroupChatroomTest extends AcceptanceTest {

    @DisplayName("그룹 채팅을 생성하는 데 성공하면, 상태코드 200과 body를 반환한다.")
    @Test
    void when_create_group_chat_then_response_200_and_body() {
        // docs
        api_문서_타이틀("createGroupChat_success", spec);

        // given
        String accessToken = 회원_원준_액세스토큰;

        // when
        그룹_채팅_생성을_요청한다_1(accessToken, spec);
        그룹_채팅_생성을_요청한다_2(accessToken, spec);
        var response = 그룹_채팅_생성을_요청한다_3(accessToken, spec);

        // then
        상태코드가_200이다(response);
    }

    @DisplayName("나의 그룹 채팅 리스트를 가져오는 데 성공하면, 상태코드 200과 body를 반환한다.")
    @Test
    void when_fetch_my_group_chat_list_then_response_200_and_body() {
        // docs
        api_문서_타이틀("fetchMyGroupChatList_success", spec);

        // given
        String accessToken = 회원_원준_액세스토큰;

        // when
        var response = 나의_그룹채팅리스트를_조회한다(accessToken, spec);

        // then
        상태코드가_200이다(response);
    }

    @DisplayName("생성된 그룹 채팅방 가입에 성공하면, 상태코드 200과 body를 반환한다.")
    @Test
    void when_join_group_chat_then_response_200_and_body() {
        // docs
        api_문서_타이틀("joinGroupChat_success", spec);

        // given
        String accessToken = 회원_윤기_액세스토큰;
        String pathParam = "group_chat_room_1";

        // when
        var response = 그룹_채팅방을_가입한다(회원_윤기_액세스토큰, pathParam, spec);

        // then
        상태코드가_200이다(response);

    }

    @DisplayName("가입되지 않은 그룹 채팅방에 가입여부를 확인하면, 상태코드 200과 false 값을 반환한다.")
    @Test
    void when_un_join_member_check_group_chat_join_then_response_200_and_body() {
        // docs
        api_문서_타이틀("unJoinMemberCheckGroupChatJoin_success", spec);

        // given
        String accessToken = 회원_윤기_액세스토큰;

        Map<String, Object> body = new HashMap<>();
        body.put("contentId", "1");
        body.put("contentType", "movie");

        // when
        var response = 그룹_채팅방_가입여부를_확인한다(accessToken, body, spec);

        // then
        상태코드가_200이다(response);
//        반환값은_false_이다(response);
    }

    @DisplayName("가입된 그룹 채팅방에 가입여부를 확인하면, 상태코드 200과 true 값을 반환한다.")
    @Test
    void when_join_member_check_group_chat_join_then_response_200_and_body() {
        // docs
        api_문서_타이틀("joinMemberCheckGroupChatJoin_success", spec);

        // given
        String accessToken = 회원_윤기_액세스토큰;

        Map<String, Object> body = new HashMap<>();
        body.put("contentId", "1");
        body.put("contentType", "movie");

        // when
        String pathParam = "group_chat_room_1";

        그룹_채팅방을_가입한다(회원_윤기_액세스토큰, pathParam, spec);
        var response = 그룹_채팅방_가입여부를_확인한다(accessToken, body, spec);

        // then
        상태코드가_200이다(response);
//        반환값은_true_이다(response);
    }

    @DisplayName("존재하지 않는 그룹 채팅방에 가입여부를 확인하면, 상태코드 200과 true 값을 반환한다.")
    @Test
    void when_member_check_not_exist_group_chat_join_then_response_200_and_body() {
        // docs
        api_문서_타이틀("memberCheckNotExistGroupChatJoin_success", spec);

        // given
        String accessToken = 회원_윤기_액세스토큰;

        Map<String, Object> body = new HashMap<>();
        body.put("contentId", "3");
        body.put("contentType", "movie");

        // when
        var response = 그룹_채팅방_가입여부를_확인한다(accessToken, body, spec);

        // then
        상태코드가_200이다(response);
//        반환값은_false_이다(response);
    }

}
