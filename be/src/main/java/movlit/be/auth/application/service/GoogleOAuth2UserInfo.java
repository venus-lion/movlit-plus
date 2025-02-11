package movlit.be.auth.application.service;

import java.util.Map;

public class GoogleOAuth2UserInfo implements OAuth2UserInfo {

    private final Map<String, Object> attributes;

    public GoogleOAuth2UserInfo(Map<String, Object> attributes) {
        this.attributes = attributes;
    }

    @Override
    public String getEmail() {
        return (String) attributes.get("email");
    }

    @Override
    public String getProfileImageUrl() {
        return (String) attributes.get("picture");
    }

    @Override
    public String getDob() {
        return ""; // Google은 생년월일 정보를 기본적으로 제공하지 않음. 필요하다면 추가적인 scope 설정 및 처리 필요
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

}