package movlit.be.auth.application.service;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Map;
import lombok.Getter;
import lombok.extern.slf4j.Slf4j;
import movlit.be.common.util.ids.MemberId;
import movlit.be.member.domain.Member;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.oauth2.core.user.OAuth2User;

// 스프링 시큐리티가 로그인 포스트 요청을 낚아채서 로그인을 진행시킴
// 로컬 로그인 - MemberDetails 구현
// 소셜 로그인 - OAuth2Member 구현

@Slf4j
public class MyMemberDetails implements UserDetails, OAuth2User {

    // 공통
    private MemberId memberId;

    // 로컬 로그인
    private Member member;

    // 소셜 로그인
    private Map<String, Object> attributes;

    public MyMemberDetails(Member member) {
        this.member = member;
        this.memberId = member.getMemberId();
    }

    public MyMemberDetails(Member member, Map<String, Object> attributes) {
        this.member = member;
        this.attributes = attributes;
        log.info("[확인] member={}", member.toString());
        log.info("[확인] attribute={}", attributes.toString());
    }

    @Override
    public Map<String, Object> getAttributes() {
        return attributes;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.singletonList(
                new SimpleGrantedAuthority(member.getRole())
        );
    }

    @Override
    public String getPassword() {
        return member.getMemberId().getValue();
    }

    public MemberId getMemberId() {
        if (member != null) {
            return member.getMemberId();
        }

        return null;
    }

    public Member getMember() {
        if (member != null) {
            return member;
        }

        return null;
    }

    @Override
    public String getUsername() {
        return member.getEmail();
    }

    @Override
    public String getName() {
        return member.getNickname();
    }

    // 버전 문제로 기존 default 메서드 추가
    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }

}