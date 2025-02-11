package movlit.be.auth.application.service;

import java.util.Map;
import java.util.Optional;

public class NaverOAuth2UserInfo implements OAuth2UserInfo {

    private final Map<String, Object> attributes;
    private final Map<String, Object> response; // 네이버는 response 안에 정보가 있음

    public NaverOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
        this.response = (Map<String, Object>) attributes.get("response");
    }

    @Override
    public String getEmail() {
        return (String) response.get("email");
    }

    @Override
    public String getProfileImageUrl() {
        return Optional.ofNullable((String) response.get("profile_image")).orElse("");
    }

    @Override
    public String getDob() {
        Optional<String> birthday = Optional.ofNullable((String) response.get("birthday"));
        Optional<String> birthyear = Optional.ofNullable((String) response.get("birthyear"));
        return birthday.isPresent() && birthyear.isPresent() ? birthyear.get() + "-" + birthday.get() : "";
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

}
