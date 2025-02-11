package movlit.be.acceptance.group_chatroom;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import io.restassured.RestAssured;
import io.restassured.response.ExtractableResponse;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import java.util.HashMap;
import java.util.Map;
import org.assertj.core.api.AbstractIntegerAssert;
import org.assertj.core.api.AbstractStringAssert;
import org.junit.jupiter.api.Assertions;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

public class GroupChatroomSteps {

    public static ExtractableResponse<Response> 그룹_채팅_생성을_요청한다_1(String accessToken,
                                                                 RequestSpecification spec) {
        Map<String, Object> body = new HashMap<>();
        body.put("roomName", "해리포터 활동방");
        body.put("contentType", "movie");
        body.put("contentId", 767L);

        return 그룹_채팅을_생성한다(accessToken, spec, body);
    }

    public static ExtractableResponse<Response> 그룹_채팅_생성을_요청한다_2(String accessToken,
                                                                 RequestSpecification spec) {
        Map<String, Object> body = new HashMap<>();
        body.put("roomName", "기타 활동방");
        body.put("contentType", "movie");
        body.put("contentId", 278L);

        return 그룹_채팅을_생성한다(accessToken, spec, body);
    }

    public static ExtractableResponse<Response> 그룹_채팅_생성을_요청한다_3(String accessToken,
                                                                 RequestSpecification spec) {
        Map<String, Object> body = new HashMap<>();
        body.put("roomName", "안녕 활동방");
        body.put("contentType", "movie");
        body.put("contentId", 315162L);

        return 그룹_채팅을_생성한다(accessToken, spec, body);
    }

    public static ExtractableResponse<Response> 그룹_채팅을_생성한다(String accessToken,
                                                            RequestSpecification spec, Map<String, Object> body) {
        return RestAssured
                .given()
                .contentType(APPLICATION_JSON_VALUE)
                .accept(APPLICATION_JSON_VALUE)
                .spec(spec)
                .log().all()
                .auth().oauth2(accessToken)
                .body(body)
                .when()
                .post("/api/chat/create/group")
                .then()
                .log().all()
                .extract();
    }

    public static ExtractableResponse<Response> 나의_그룹채팅리스트를_조회한다(String accessToken,
                                                                 RequestSpecification spec) {
        return RestAssured
                .given()
                .contentType(MediaType.APPLICATION_JSON_VALUE)
                .spec(spec)
                .log().all()
                .auth().oauth2(accessToken)
                .when()
                .get("/api/chat/group/rooms/my")
                .then()
                .log().all()
                .extract();
    }

    public static ExtractableResponse<Response> 그룹_채팅방을_가입한다(String accessToken,
                                                             String pathParam,
                                                             RequestSpecification spec) {
        return RestAssured
                .given()
                .contentType(APPLICATION_JSON_VALUE)
                .spec(spec)
                .log().all()
                .auth().oauth2(accessToken)
                .when()
                .pathParam("groupChatroomId", pathParam)
                .post("/api/chat/group/{groupChatroomId}")
                .then()
                .log().all()
                .extract();

    }

    public static ExtractableResponse<Response> 그룹_채팅방_가입여부를_확인한다(String accessToken,
                                                                  Map<String, Object> body,
                                                                  RequestSpecification spec) {
        return RestAssured
                .given()
                .contentType(APPLICATION_JSON_VALUE)
                .spec(spec)
                .log().all()
                .auth().oauth2(accessToken)
                .when()
                .body(body)
                .post("/api/chat/group/checkJoin")
                .then()
                .log().all()
                .extract();
    }

    public static void 상태코드가_200이다(ExtractableResponse<Response> response) {
        Assertions.assertAll(
                () -> 상태코드를_검증한다(response, HttpStatus.OK));
    }

    public static void 상태코드가_404이고_오류코드는_m105이다(ExtractableResponse<Response> response) {
        Assertions.assertAll(
                () -> 상태코드를_검증한다(response, HttpStatus.NOT_FOUND),
                () -> 오류코드를_검증한다(response, "m105"));
    }

    public static void 반환값은_false_이다(ExtractableResponse<Response> response) {
        Boolean result = response.as(Boolean.class);
        Assertions.assertAll(
                () -> assertThat(result).isEqualTo(false)
        );
    }

    public static void 반환값은_true_이다(ExtractableResponse<Response> response) {
        Boolean result = response.as(Boolean.class);
        Assertions.assertAll(
                () -> assertThat(result).isEqualTo(true)
        );
    }

    public static AbstractIntegerAssert<?> 상태코드를_검증한다(ExtractableResponse<Response> response,
                                                      HttpStatus expectedHttpStatus) {
        return assertThat(response.statusCode()).isEqualTo(expectedHttpStatus.value());
    }

    public static AbstractStringAssert<?> 오류코드를_검증한다(ExtractableResponse<Response> response, String code) {
        return assertThat(response.jsonPath().getString("code")).isEqualTo(code);
    }

}
