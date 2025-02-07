package movlit.be.member.application.service;

import jakarta.persistence.EntityManager;
import java.util.List;
import lombok.RequiredArgsConstructor;
import movlit.be.common.exception.MemberNotFoundException;
import movlit.be.common.util.Genre;
import movlit.be.common.util.JwtTokenUtil;
import movlit.be.common.util.ids.MemberId;
import movlit.be.member.domain.Member;
import movlit.be.member.domain.entity.MemberEntity;
import movlit.be.member.domain.repository.MemberRepository;
import movlit.be.member.presentation.dto.response.GenreListReadResponse;
import movlit.be.member.presentation.dto.response.MemberIdResponse;
import movlit.be.member.presentation.dto.response.MemberReadMyPage;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
//@Transactional(readOnly = true)
public class MemberReadService {

    private final MemberRepository memberRepository;
    private final JwtTokenUtil jwtTokenUtil;
    private final EntityManager entityManager;

    public static final int CORRECT_LOGIN = 0;
    public static final int WRONG_PASSWORD = 1;
    public static final int Member_NOT_EXIST = 2;

    @Transactional(readOnly = true)
    public Member findByMemberEmail(String email) {
        return memberRepository.findByEmail(email);
    }

    public int login(String email, String pwd) {
        Member member = findByMemberEmail(email);
        // TODO: login 실패 로직 짜기
        if (member == null) {
            return Member_NOT_EXIST;
        }
        if (BCrypt.checkpw(pwd, member.getPassword())) {
            return CORRECT_LOGIN;
        }
        return WRONG_PASSWORD;
    }

    @Transactional(readOnly = true)
    public Member findByMemberId(MemberId memberId) {
        return memberRepository.findById(memberId);
    }

    @Transactional(readOnly = true)
    public MemberEntity findEntityByMemberId(MemberId memberId) {
        return memberRepository.findEntityById(memberId);
    }

    public void validateMemberIdExists(MemberId memberId) {
        if (!memberRepository.existByMemberId(memberId)) {
            throw new MemberNotFoundException();
        }
    }

    @Transactional(readOnly = true)
    public List<GenreListReadResponse> fetchGenreListById(MemberId memberId) {
        MemberEntity memberEntity = memberRepository.findEntityById(memberId);
        return memberEntity.getMemberGenreEntityList().stream()
                .map(genre -> {
                    Long genreId = genre.getGenreId();
                    String genreName = Genre.of(genreId).getName();
                    return new GenreListReadResponse(genreId, genreName);
                })
                .toList();
    }

    public List<GenreListReadResponse> getGenreList() {
        return Genre.getGenreList();
    }

    @Transactional(readOnly = true)
    public MemberReadMyPage fetchMyPage(MemberId memberId) {
        return memberRepository.fetchMyPageByMemberId(memberId);
    }

    @Transactional(readOnly = true)
    public MemberIdResponse fetchMemberId(String accessToken) {
        String email = jwtTokenUtil.extractEmail(accessToken);
        MemberId memberId = memberRepository.findByEmail(email).getMemberId();
        return MemberIdResponse.of(memberId);
    }

    @Transactional(readOnly = false)
    public MemberEntity findEntityById(MemberId memberId) {
        entityManager.clear(); // 1차 캐시 초기화 (안하면, 프로필 업데이트된 멤버정보를 제대로 조회 안하고, JPA에서 프로필업데이트되기 전, 멤버정보를 조회한다)
        MemberEntity memberEntity = memberRepository.findEntityById(memberId);

        System.out.println("::MemberReadService >>> 찾은 memberEntity " + memberEntity.toStringExceptLazyLoading());
        return memberEntity;
    }

}
