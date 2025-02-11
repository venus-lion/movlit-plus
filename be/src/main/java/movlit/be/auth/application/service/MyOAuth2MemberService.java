package movlit.be.auth.application.service;

import java.util.Map;
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
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
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
        OAuth2User oAuth2User = super.loadUser(memberRequest);
        log.info("===getAttributes()===: " + oAuth2User.getAttributes());

        String provider = memberRequest.getClientRegistration().getRegistrationId();
        OAuth2UserInfo oAuth2UserInfo = getOAuth2UserInfo(provider, oAuth2User.getAttributes());

        String email = oAuth2UserInfo.getEmail();
        String profileUrl = oAuth2UserInfo.getProfileImageUrl();
        String dob = oAuth2UserInfo.getDob();
        String hashedPwd = bCryptPasswordEncoder.encode("Social Login"); // 공통 로직

        Member member;
        try {
            member = memberReadService.findByMemberEmail(email);
            log.info("=== findByMemberEmail : {}", member);
        } catch (MemberNotFoundException e) {
            MemberRegisterOAuth2Request request = MemberRegisterOAuth2Request.builder()
                    .email(email)
                    .password(hashedPwd)
                    .profileImgUrl(profileUrl)
                    .dob(dob)
                    .build();
            member = memberWriteService.registerOAuth2Member(request);
            log.info("{} 계정을 통해 회원가입이 되었습니다. {}", provider.toUpperCase(), request.getEmail());
        }

        return new MyMemberDetails(member, oAuth2User.getAttributes()); // OAuth2AuthenticationToken 자동 생성
    }

    private OAuth2UserInfo getOAuth2UserInfo(String provider, Map<String, Object> attributes) {
        return switch (provider) {
            case "google" -> new GoogleOAuth2UserInfo(attributes);
            case "naver" -> new NaverOAuth2UserInfo(attributes);
            case "kakao" -> new KakaoOAuth2UserInfo(attributes);
            default -> throw new OAuth2AuthenticationException("올바른 OAuth 형식이 아닙니다.");
        };
    }

}