package movlit.be.acceptance.oneonone_chatroom;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.http.MediaType.APPLICATION_JSON_VALUE;

import io.restassured.RestAssured;
import io.restassured.response.ExtractableResponse;
import io.restassured.response.Response;
import io.restassured.specification.RequestSpecification;
import java.util.Map;
import org.assertj.core.api.AbstractIntegerAssert;
import org.assertj.core.api.AbstractStringAssert;
import org.junit.jupiter.api.Assertions;
import org.springframework.http.HttpStatus;

public class OneOnOneChatroomSteps {

    public static ExtractableResponse<Response> 일대일_채팅을_생성한다(String accessToken,
                                                             Map<String, Object> request,
                                                             RequestSpecification spec) {
        return RestAssured
                .given()
                .contentType(APPLICATION_JSON_VALUE)
                .accept(APPLICATION_JSON_VALUE)
                .spec(spec)
                .log().all()
                .auth().oauth2(accessToken)
                .body(request)
                .when()
                .post("/api/chat/create/oneOnOne")
                .then()
                .log().all()
                .extract();
    }

    public static ExtractableResponse<Response> 로그인_유저의_일대일_채팅_목록을_가져온다(String accessToken,
                                                                        RequestSpecification spec) {

        return RestAssured
                .given()
                .contentType(APPLICATION_JSON_VALUE)
                .accept(APPLICATION_JSON_VALUE)
                .spec(spec)
                .log().all()
                .auth().oauth2(accessToken)
                .when()
                .get("/api/chat/oneOnOne")
                .then()
                .log().all()
                .extract();
    }

    public static void 응답결과를_검증한다(ExtractableResponse<Response> response, int size) {
        Assertions.assertAll(
                () -> assertThat(response.jsonPath().getInt("size()")).isEqualTo(size),
                () -> 상태코드가_200이다(response)
        );
    }

    public static void 상태코드가_200이다(ExtractableResponse<Response> response) {
        Assertions.assertAll(
                () -> 상태코드를_검증한다(response, HttpStatus.OK));
    }

    public static void 상태코드_409와_오류코드_o001을_반환하는지_검증한다(ExtractableResponse<Response> response) {
        Assertions.assertAll(
                () -> 상태코드를_검증한다(response, HttpStatus.CONFLICT),
                () -> 오류코드를_검증한다(response, "o001")
        );
    }

    private static AbstractStringAssert<?> 오류코드를_검증한다(ExtractableResponse<Response> response, String code) {
        return assertThat(response.jsonPath().getString("code")).isEqualTo(code);
    }

    public static AbstractIntegerAssert<?> 상태코드를_검증한다(ExtractableResponse<Response> response,
                                                      HttpStatus expectedHttpStatus) {
        return assertThat(response.statusCode()).isEqualTo(expectedHttpStatus.value());
    }

}
