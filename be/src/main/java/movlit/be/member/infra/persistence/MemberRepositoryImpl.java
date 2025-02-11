package movlit.be.member.infra.persistence;

import lombok.RequiredArgsConstructor;
import movlit.be.common.exception.MemberNotFoundException;
import movlit.be.common.util.ids.MemberId;
import movlit.be.member.application.converter.MemberConverter;
import movlit.be.member.domain.Member;
import movlit.be.member.domain.entity.MemberEntity;
import movlit.be.member.domain.repository.MemberRepository;
import movlit.be.member.infra.persistence.jpa.MemberJpaRepository;
import movlit.be.member.presentation.dto.response.MemberReadMyPage;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class MemberRepositoryImpl implements MemberRepository {

    private final MemberJpaRepository memberJpaRepository;

    @Override
    public MemberEntity saveEntity(MemberEntity memberEntity) {
        return memberJpaRepository.save(memberEntity);
    }

    @Override
    public Member save(Member member) {
        MemberEntity memberEntity = MemberConverter.toEntity(member);
        memberJpaRepository.save(memberEntity);
        return MemberConverter.toDomain(memberEntity);
    }

    @Override
    public Member fetchById(MemberId memberId) {
        MemberEntity memberEntity = memberJpaRepository.findByMemberId(memberId)
                .orElseThrow(MemberNotFoundException::new);
        return MemberConverter.toDomain(memberEntity);
    }

    @Override
    public MemberEntity fetchEntityById(MemberId memberId) {
        return memberJpaRepository.findByMemberId(memberId)
                .orElseThrow(MemberNotFoundException::new);
    }

    @Override
    public Member fetchByEmail(String email) {
        MemberEntity memberEntity = memberJpaRepository.findByEmail(email)
                .orElseThrow(MemberNotFoundException::new);

        return MemberConverter.toDomain(memberEntity);
    }

    @Override
    public void deleteById(MemberId memberId) {
        memberJpaRepository.deleteById(memberId);
    }

    @Override
    public boolean existsByNickname(String nickname) {
        return memberJpaRepository.existsByNickname(nickname);
    }

    @Override
    public boolean existsByEmail(String email) {
        return memberJpaRepository.existsByEmail(email);
    }

    @Override
    public boolean existByMemberId(MemberId memberId) {
        return memberJpaRepository.existsById(memberId);
    }

    @Override
    public MemberReadMyPage fetchMyPageByMemberId(MemberId memberId) {
        return memberJpaRepository.findMyPageByMemberId(memberId);
    }

    @Override
    public void softDeleteByMemberId(MemberId memberId) {
        memberJpaRepository.softDeleteByMemberId(memberId);
    }

}
