package movlit.be.member.application.converter;

import java.time.LocalDateTime;
import java.util.List;
import movlit.be.common.util.ids.MemberId;
import movlit.be.member.domain.Member;
import movlit.be.member.domain.entity.MemberEntity;
import movlit.be.member.domain.entity.MemberGenreEntity;
import movlit.be.member.presentation.dto.request.MemberRegisterOAuth2Request;
import movlit.be.member.presentation.dto.request.MemberRegisterRequest;
import movlit.be.member.presentation.dto.request.MemberUpdateRequest;
import movlit.be.member.presentation.dto.response.MemberRegisterResponse;
import movlit.be.movie.presentation.dto.request.MovieCommentData;
import movlit.be.movie.presentation.dto.request.MovieCommentRequest;
import org.springframework.security.crypto.bcrypt.BCrypt;

public class MemberConverter {

    private MemberConverter() {
        // TODO : 공통적인 예외처리 등록해주기
    }

    // Domain -> Entity
    public static MemberEntity toEntity(Member member) {
        System.out.println("%% member 장르리스트 : " + member.getMemberGenreEntityList());
        return MemberEntity.builder()
                .memberId(member.getMemberId())
                .memberGenreEntityList(member.getMemberGenreEntityList())
                .email(member.getEmail())
                .nickname(member.getNickname())
                .password(member.getPassword())
                .dob(member.getDob())
                .profileImgUrl(member.getProfileImgUrl())
                .role(member.getRole())
                .provider(member.getProvider())
                .regDt(member.getRegDt())
                .updDt(member.getUpdDt())
                .build();
    }

    // Entity -> Domain
    public static Member toDomain(MemberEntity memberEntity) {
        return Member.builder()
                .memberId(memberEntity.getMemberId())
                .email(memberEntity.getEmail())
                .nickname(memberEntity.getNickname())
                .password(memberEntity.getPassword())
                .dob(memberEntity.getDob())
                .profileImgUrl(memberEntity.getProfileImgUrl())
                .role(memberEntity.getRole())
                .provider(memberEntity.getProvider())
                .regDt(memberEntity.getRegDt())
                .updDt(memberEntity.getUpdDt())
                .build();
    }

    // Domain to Dto
    public static MemberRegisterResponse toRegisterResponse(Member member) {
        return MemberRegisterResponse.from(member.getMemberId());
    }

    public static MemberGenreEntity toMemberGenreEntity(Long genreId, MemberId memberId) {
        return new MemberGenreEntity(genreId, memberId);
    }

    public static MemberEntity toMemberEntity(MemberRegisterRequest request,
                                              List<MemberGenreEntity> memberGenreEntityList,
                                              MemberId memberId) {
        return MemberEntity.builder()
                .memberId(memberId)
                .password(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt()))
                .memberGenreEntityList(memberGenreEntityList)
                .nickname(request.getNickname())
                .email(request.getEmail())
                .dob(request.getDob())
                .regDt(LocalDateTime.now())
                .role("ROLE_Member")
                .provider("local")
                .build();
    }

    public static MemberRegisterResponse toMemberRegisterResponse(MemberId memberId) {
        return MemberRegisterResponse.from(memberId);
    }

    public static Member toMemberForUpdate(MemberUpdateRequest request) {
        return Member.builder()
                .nickname(request.getNickname())
                .password(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt()))
                .dob(request.getDob())
                .updDt(LocalDateTime.now())
                .build();
    }

    public static MovieCommentData toMovieDetailCommentData(Long movieId, MemberId memberId,
                                                            MovieCommentRequest request) {
        return new MovieCommentData(movieId, memberId, request);
    }

    public static Member oAuth2RequestToMemberEntity(MemberRegisterOAuth2Request request, String nickname,
                                                     List<MemberGenreEntity> memberGenreEntityList,
                                                     MemberId memberId) {
        return Member.builder()
                .memberId(memberId)
                .nickname(nickname)
                .email(request.getEmail())
                .password(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt()))
                .dob(request.getDob())
                .memberGenreEntityList(memberGenreEntityList)
                // TODO: profileImgId
                .profileImgUrl(request.getProfileImgUrl())
                .provider("oauth2")
                .role("ROLE_MEMBER")
                .regDt(LocalDateTime.now())
                .build();
    }

    public static MemberEntity toMemberEntity(MemberRegisterOAuth2Request request, String nickname,
                                              List<MemberGenreEntity> memberGenreEntityList,
                                              MemberId memberId) {
        return MemberEntity.builder()
                .memberId(memberId)
                .nickname(nickname)
                .email(request.getEmail())
                .password(BCrypt.hashpw(request.getPassword(), BCrypt.gensalt()))
                .dob(request.getDob())
                .memberGenreEntityList(memberGenreEntityList)
                // TODO: profileImgId
                .profileImgUrl(request.getProfileImgUrl())
                .provider("oauth2")
                .regDt(LocalDateTime.now())
                .build();
    }

    // Entity 업데이트 (부분 업데이트)
    public static void updateEntity(Member source, MemberEntity target) {
        if (source.getProfileImgUrl() != null) {
            target.updateProfileImgUrl(source.getNickname());
        }
    }

}
