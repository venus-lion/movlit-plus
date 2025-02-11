package movlit.be.auth.application.service;

import java.util.Map;
import java.util.Optional;

public class KakaoOAuth2UserInfo implements OAuth2UserInfo {

    private final Map<String, Object> attributes;
    private final Map<String, Object> account;

    public KakaoOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
        this.account = (Map<String, Object>) attributes.get("kakao_account");
    }

    @Override
    public String getEmail() {
        return (String) account.get("email");
    }

    @Override
    public String getProfileImageUrl() {
        Map<String, Object> profile = (Map<String, Object>) account.get("profile"); // profile 안에 profile_image_url
        return profile != null ? (String) profile.get("profile_image_url") : "";  // 카카오는 profile_image_url 키 사용
    }

    @Override
    public String getDob() {
        Optional<String> birthday = Optional.ofNullable((String) account.get("birthday"));
        Optional<String> birthyear = Optional.ofNullable((String) account.get("birthyear"));
        String dob = "";
        if (birthday.isPresent() && birthyear.isPresent()) {
            dob = birthyear.get() + "-" + birthday.get().substring(0, 2) + "-" + birthday.get().substring(2);
        }
        return dob;
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

}
