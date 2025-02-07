package movlit.be.auth.application.service;// OAuth2AuthenticationSuccessHandler.java

import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.auth.domain.repository.AuthCodeStorage;
import movlit.be.common.util.IdFactory;
import movlit.be.common.util.IdGenerator;
import movlit.be.common.util.JwtTokenUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

@Component
@RequiredArgsConstructor
@Slf4j
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final AuthCodeStorage authCodeStorage;
    private final JwtTokenUtil jwtTokenUtil;

    @Value("${share.url}")
    private String url;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                        Authentication authentication) throws IOException {

        // OAuth2User로부터 email을 가져옴
        MyMemberDetails oAuth2User = (MyMemberDetails) authentication.getPrincipal();
        String email = oAuth2User.getMember().getEmail();

        String code = IdGenerator.generate();
        authCodeStorage.saveCode(code, email);

        // 헤더 설정
        String accessToken = jwtTokenUtil.generateAccessToken(email);
        response.setHeader("Authorization", "Bearer " + accessToken);

        // 프론트엔드로 리다이렉트할 URL 생성 (쿼리 파라미터로 토큰 포함)
        String targetUrl = UriComponentsBuilder.fromUriString(url + "/oauth/callback") // 리다이렉트할 프론트엔드 주소
                .queryParam("code", code)
                .build().toUriString();

        // 리다이렉트 수행
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }

}