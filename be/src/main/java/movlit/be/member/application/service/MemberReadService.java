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
        return memberRepository.fetchByEmail(email);
    }

    @Transactional(readOnly = true)
    public Member fetchByMemberId(MemberId memberId) {
        return memberRepository.fetchById(memberId);
    }

    @Transactional(readOnly = true)
    public MemberEntity fetchEntityByMemberId(MemberId memberId) {
        return memberRepository.fetchEntityById(memberId);
    }

    public void validateMemberIdExists(MemberId memberId) {
        if (!memberRepository.existByMemberId(memberId)) {
            throw new MemberNotFoundException();
        }
    }

    @Transactional(readOnly = true)
    public List<GenreListReadResponse> fetchGenreListById(MemberId memberId) {
        MemberEntity memberEntity = memberRepository.fetchEntityById(memberId);
        return memberEntity.getMemberGenreEntityList().stream()
                .map(genre -> {
                    Long genreId = genre.getGenreId();
                    String genreName = Genre.of(genreId).getName();
                    return new GenreListReadResponse(genreId, genreName);
                })
                .toList();
    }

    @Transactional(readOnly = true)
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
        MemberId memberId = memberRepository.fetchByEmail(email).getMemberId();
        return MemberIdResponse.of(memberId);
    }

    @Transactional
    public MemberEntity findEntityById(MemberId memberId) {
        entityManager.clear(); // 1차 캐시 초기화 (안하면, 프로필 업데이트된 멤버정보를 제대로 조회 안하고, JPA에서 프로필업데이트되기 전, 멤버정보를 조회한다)
        MemberEntity memberEntity = memberRepository.fetchEntityById(memberId);

        System.out.println("::MemberReadService >>> 찾은 memberEntity " + memberEntity.toStringExceptLazyLoading());
        return memberEntity;
    }

}
