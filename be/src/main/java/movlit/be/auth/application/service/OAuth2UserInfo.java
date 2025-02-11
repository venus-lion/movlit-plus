package movlit.be.auth.application.service;

import java.util.Map;

public interface OAuth2UserInfo {

    String getEmail();

    String getProfileImageUrl();

    String getDob();

    Map<String, Object> getAttributes(); // 추가: 속성 접근을 위한 메서드

}
