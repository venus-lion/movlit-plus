package movlit.be.auth.application.service;

import java.util.Map;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.common.exception.MemberNotFoundException;
import movlit.be.member.application.service.MemberReadService;
import movlit.be.member.application.service.MemberWriteService;
import movlit.be.member.domain.Member;
import movlit.be.member.presentation.dto.request.MemberRegisterOAuth2Request;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class MyOAuth2MemberService extends DefaultOAuth2UserService {

    private final MemberReadService memberReadService;
    private final MemberWriteService memberWriteService;
    private final BCryptPasswordEncoder bCryptPasswordEncoder;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest memberRequest) {
        String email, profileUrl;
        String hashedPwd = bCryptPasswordEncoder.encode("Social Login");
        Member member = null;

        OAuth2User oAuth2User = super.loadUser(memberRequest);
        log.info("===getAttributes()===: " + oAuth2User.getAttributes());

        String provider = memberRequest.getClientRegistration().getRegistrationId();
        switch (provider) {
            case "google":
                email = oAuth2User.getAttribute("email");    // Google Email
                try {
                    member = memberReadService.findByMemberEmail(email);
                    log.info("=== findByMemberEmail : {}", member);
                } catch (MemberNotFoundException e) {
                    profileUrl = oAuth2User.getAttribute("picture");
                    MemberRegisterOAuth2Request request = MemberRegisterOAuth2Request.builder()
                            .email(email)
                            .password(hashedPwd)
                            .profileImgUrl(profileUrl)
                            .build();
                    memberWriteService.registerOAuth2Member(request);
                    log.info("구글 계정을 통해 회원가입이 되었습니다. " + request.getEmail());
                }
                break;

            case "naver":
                Map<String, Object> response = (Map) oAuth2User.getAttribute("response");
                email = (String) response.get("email");

                try {
                    member = memberReadService.findByMemberEmail(email);
                    log.info("로그인이 되었습니다. email={}", member.getEmail());
                } catch (MemberNotFoundException e) {
                    profileUrl = Optional.ofNullable((String) response.get("profile_image")).orElse("");

                    // 생일 처리
                    Optional<String> birthday = Optional.ofNullable((String) response.get("birthday"));
                    Optional<String> birthyear = Optional.ofNullable((String) response.get("birthyear"));
                    String dob = "";
                    if (birthday.isPresent() && birthyear.isPresent()) {
                        dob = birthyear.get() + "-" + birthday.get();
                    }
                    MemberRegisterOAuth2Request request = MemberRegisterOAuth2Request.builder()
                            .email(email)
                            .password(hashedPwd)
                            .profileImgUrl(profileUrl)
                            .dob(dob)
                            .build();
                    member = memberWriteService.registerOAuth2Member(request);
                    log.info("네이버 계정을 통해 회원가입이 되었습니다. " + request.getEmail());
                }
                break;

            case "kakao":
                Map<String, String> properties = (Map) oAuth2User.getAttribute("properties");
                Map<String, Object> account = (Map) oAuth2User.getAttribute("kakao_account");
                email = (String) account.get("email");
                try {
                    member = memberReadService.findByMemberEmail(email);
                } catch (MemberNotFoundException e) {
                    Optional<String> birthday = Optional.ofNullable((String) account.get("birthday"));
                    Optional<String> birthyear = Optional.ofNullable((String) account.get("birthyear"));
                    String dob = "";
                    if (birthday.isPresent() && birthyear.isPresent()) {
                        dob = birthyear + "-"
                                + birthday.get().substring(0, 2) + "-" + birthday.get().substring(3);
                    }

                    profileUrl = Optional.ofNullable((String) account.get("profile_image")).orElse("");
                    MemberRegisterOAuth2Request request = MemberRegisterOAuth2Request.builder()
                            .email(email)
                            .password(hashedPwd)
                            .profileImgUrl(profileUrl)
                            .dob(dob)
                            .build();
                    memberWriteService.registerOAuth2Member(request);

                    log.info("카카오 계정을 통해 회원가입이 되었습니다. " + request.getEmail());
                }

                break;
        }

        return new MyMemberDetails(member, oAuth2User.getAttributes()); // OAuth2AuthenticationToken 자동 생성
    }

}
