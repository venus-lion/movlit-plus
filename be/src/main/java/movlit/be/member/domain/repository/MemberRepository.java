package movlit.be.member.domain.repository;

import movlit.be.common.util.ids.MemberId;
import movlit.be.member.domain.Member;
import movlit.be.member.domain.entity.MemberEntity;
import movlit.be.member.presentation.dto.response.MemberReadMyPage;

public interface MemberRepository {

    MemberEntity saveEntity(MemberEntity memberEntity);

    Member save(Member member);

    void deleteById(MemberId id);

    Member fetchByEmail(String email);

    Member fetchById(MemberId memberId);

    MemberEntity fetchEntityById(MemberId memberId);

    boolean existsByNickname(String nickname);

    boolean existsByEmail(String email);

    boolean existByMemberId(MemberId memberId);

    MemberReadMyPage fetchMyPageByMemberId(MemberId memberId);

    void softDeleteByMemberId(MemberId memberId);

}
