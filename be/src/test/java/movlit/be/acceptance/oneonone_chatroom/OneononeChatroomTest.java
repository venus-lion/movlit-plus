package movlit.be.acceptance.oneonone_chatroom;

import static movlit.be.acceptance.oneonone_chatroom.OneOnOneChatroomSteps.로그인_유저의_일대일_채팅_목록을_가져온다;
import static movlit.be.acceptance.oneonone_chatroom.OneOnOneChatroomSteps.상태코드_409와_오류코드_o001을_반환하는지_검증한다;
import static movlit.be.acceptance.oneonone_chatroom.OneOnOneChatroomSteps.상태코드가_200이다;
import static movlit.be.acceptance.oneonone_chatroom.OneOnOneChatroomSteps.응답결과를_검증한다;
import static movlit.be.acceptance.oneonone_chatroom.OneOnOneChatroomSteps.일대일_채팅을_생성한다;

import java.util.HashMap;
import java.util.Map;
import movlit.be.acceptance.AcceptanceTest;
import movlit.be.common.util.JwtTokenUtil;
import movlit.be.common.util.ids.MemberId;
import movlit.be.member.application.service.MemberReadService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

@DisplayName("일대일 채팅 인수 테스트")
public class OneononeChatroomTest extends AcceptanceTest {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Autowired
    private MemberReadService memberReadService;

    @DisplayName("일대일 채팅을 생성하는 데 성공하면, 상태코드 200과 body를 반환한다.")
    @Test
    void when_create_oneonone_chatroom_then_response_200_and_body() {
        // docs
        api_문서_타이틀("createOneononeChatroom_success", spec);

        // given
        String senderAccessToken = 회원_윤기_액세스토큰;

        String receiverAccessToken = 회원_원준_액세스토큰;
        MemberId receiverId = memberReadService.findByMemberEmail(jwtTokenUtil.extractEmail(receiverAccessToken))
                .getMemberId();
        Map<String, Object> request = new HashMap<>();
        request.put("receiverId", receiverId.getValue());
        // when
        var response = 일대일_채팅을_생성한다(senderAccessToken, request, spec);

        // then
        상태코드가_200이다(response);
    }

    @DisplayName("일대일 채팅을 중복 생성하면, 상태코드 404와 오류코드 o001을 반환하는지 검증한다.")
    @Test
    void when_create_oneonone_chatroom_duplicated_then_response_404_and_error_code_o001() {
        // docs
        api_문서_타이틀("createOneononeChatroom_failed_duplicated", spec);

        // given
        String senderAccessToken = 회원_윤기_액세스토큰;

        String receiverAccessToken = 회원_원준_액세스토큰;
        MemberId receiverId = memberReadService.findByMemberEmail(jwtTokenUtil.extractEmail(receiverAccessToken))
                .getMemberId();
        Map<String, Object> request = new HashMap<>();
        request.put("receiverId", receiverId.getValue());
        // when
        일대일_채팅을_생성한다(senderAccessToken, request, spec);
        var response = 일대일_채팅을_생성한다(senderAccessToken, request, spec);

        // then
        상태코드_409와_오류코드_o001을_반환하는지_검증한다(response);
    }

    @DisplayName("일대일 채팅을 생성하고, 채팅 목록을 가져오는데 성공하면, 상태코드 200과 body를 반환한다.")
    @Test
    void given_created_when_get_oneonone_chatroom_then_response_200_and_body() {
        // docs
        api_문서_타이틀("getOneononeChatroom_success", spec);

        // given
        Map<String, Object> request = new HashMap<>();
        String senderAccessToken = 회원_윤기_액세스토큰;

        // 채팅1
        MemberId receiverId = memberReadService.findByMemberEmail(jwtTokenUtil.extractEmail(회원_원준_액세스토큰))
                .getMemberId();
        request.put("receiverId", receiverId.getValue());
        일대일_채팅을_생성한다(senderAccessToken, request, spec);

        // 채팅2
        receiverId = memberReadService.findByMemberEmail(jwtTokenUtil.extractEmail(회원_민지_액세스토큰))
                .getMemberId();
        request.replace("receiverId", receiverId.getValue());
        일대일_채팅을_생성한다(senderAccessToken, request, spec);

        // when
        var response = 로그인_유저의_일대일_채팅_목록을_가져온다(senderAccessToken, spec);

        // then
        응답결과를_검증한다(response, 2);
    }

}
