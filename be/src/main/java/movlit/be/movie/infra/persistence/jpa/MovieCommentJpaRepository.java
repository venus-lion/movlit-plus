package movlit.be.movie.infra.persistence.jpa;

import movlit.be.common.util.ids.MemberId;
import movlit.be.common.util.ids.MovieCommentId;
import movlit.be.movie.domain.entity.MovieCommentEntity;
import movlit.be.movie.presentation.dto.response.MovieCommentReadResponse;
import movlit.be.movie.presentation.dto.response.MovieMyCommentReadResponse;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Slice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MovieCommentJpaRepository extends JpaRepository<MovieCommentEntity, MovieCommentId> {

    // TODO: 좋아요 추가 후, 정렬 다시 생각 + 서브 쿼리 분리
    @Query(
            "SELECT NEW movlit.be.movie.presentation.dto.response.MovieCommentReadResponse"
                    + "(mc.movieCommentId, mc.score, mc.comment, mb.nickname, mb.profileImgUrl, "
                    + "(SELECT COUNT(mcc) FROM MovieCommentEntity mcc WHERE mcc.movieId = :movieId), "
                    + "false, mclc.count, mb.memberId) "
                    + "FROM MovieCommentEntity mc "
                    + "LEFT JOIN MovieCommentLikeCountEntity mclc ON mclc.movieCommentId = mc.movieCommentId "
                    + "LEFT JOIN MemberEntity mb ON mb.memberId = mc.memberId "
                    + "WHERE mc.movieId = :movieId "
                    + "ORDER BY mc.regDt DESC"
    )
    Slice<MovieCommentReadResponse> findAllComment(@Param("movieId") Long movieId,
                                                   @Param("pageable") Pageable pageable);

    @Query(
            "SELECT NEW movlit.be.movie.presentation.dto.response.MovieCommentReadResponse"
                    + "(mc.movieCommentId, mc.score, mc.comment, mb.nickname, mb.profileImgUrl, "
                    + "(SELECT COUNT(mcc) FROM MovieCommentEntity mcc WHERE mcc.movieId = :movieId), "
                    + "COALESCE(mcl.isLiked, false), mclc.count, mb.memberId) "
                    + "FROM MovieCommentEntity mc "
                    + "LEFT JOIN MovieCommentLikeEntity mcl ON mcl.movieCommentId = mc.movieCommentId AND mcl.memberId = :memberId "
                    + "LEFT JOIN MovieCommentLikeCountEntity mclc ON mclc.movieCommentId = mc.movieCommentId "
                    + "LEFT JOIN MemberEntity mb ON mb.memberId = mc.memberId "
                    + "WHERE mc.movieId = :movieId "
                    + "ORDER BY mc.regDt DESC"
    )
    Slice<MovieCommentReadResponse> findAllCommentsWithMemberId(@Param("movieId") Long movieId,
                                                                @Param("memberId") MemberId memberId,
                                                                @Param("pageable") Pageable pageable);

    @Query("SELECT CASE WHEN COUNT(mc) > 0 THEN true ELSE false END "
            + "FROM MovieCommentEntity mc "
            + "WHERE mc.memberId = :memberId AND mc.movieId = :movieId")
    boolean existsByMemberIdAndMovieId(@Param("memberId") MemberId memberId, @Param("movieId") Long movieId);

    @Query("SELECT NEW movlit.be.movie.presentation.dto.response.MovieMyCommentReadResponse"
            + "(mb.nickname, mb.profileImgUrl, mc.movieCommentId, mc.comment, mc.score) "
            + "FROM MovieCommentEntity mc "
            + "LEFT JOIN MemberEntity  mb ON mb.memberId = mc.memberId "
            + "WHERE mc.movieId = :movieId AND mb.memberId = :memberId")
    MovieMyCommentReadResponse findMyComment(@Param("movieId") Long movieId, @Param("memberId") MemberId memberId);

}
