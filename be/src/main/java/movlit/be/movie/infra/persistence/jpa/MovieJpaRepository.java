package movlit.be.movie.infra.persistence.jpa;

import java.util.List;

import movlit.be.movie.domain.entity.MovieEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface MovieJpaRepository extends JpaRepository<MovieEntity, Long> {

    @Query("SELECT DISTINCT m FROM MovieEntity m LEFT JOIN FETCH m.movieGenreEntityList " +
            "ORDER BY m.releaseDate DESC")
    Page<MovieEntity> findAllByOrderByReleaseDateDesc(Pageable pageable);      // 개봉순

    // 인기순 : VoteCount 500이상의 영화를 popularity 내림차순으로
    @Query("SELECT DISTINCT m FROM MovieEntity m LEFT JOIN FETCH m.movieGenreEntityList " +
            "WHERE m.voteCount >= :voteCount " +
            "ORDER BY m.popularity DESC")
    Page<MovieEntity> findByVoteCountGreaterThanEqualOrderByPopularityDesc(Long voteCount, Pageable pageable);

    // 장르별
    Page<MovieEntity> findByMovieGenreEntityList_MovieGenreIdForEntity_GenreIdOrderByReleaseDateDescPopularityDescVoteCountDesc(
            Long genreId, Pageable pageable);

    @Query("SELECT DISTINCT m FROM MovieEntity m "
            + "LEFT JOIN FETCH m.movieRCrewEntityList mrc "
            + "LEFT JOIN FETCH mrc.movieCrewEntity mc "
            + "WHERE m.movieId IN :movieIds ")
    List<MovieEntity> findInIdsWithCrew(List<Long> movieIds);

    @Query("SELECT DISTINCT m FROM MovieEntity m, MovieHeartEntity mh "
            + "WHERE m.movieId = mh.movieId "
            + "AND mh.memberId = :memberId")
    Page<MovieEntity> findMoviesByMemberHeart(Pageable pageable, Long memberId);

    // 최신 추가된 영화
    @Query("SELECT m FROM MovieEntity m ORDER BY m.releaseDate DESC")
    Page<MovieEntity> findMovieEntitiesByOrderByReleaseDateDesc(Pageable pageable);

    // 인기순 : VoteCount 500이상의 영화를 popularity 내림차순으로
    @Query("SELECT m FROM MovieEntity m WHERE m.voteCount >= :voteCount " +
            "ORDER BY m.popularity DESC")
    Page<MovieEntity> findMovieEntitiesByVoteCountGreaterThanEqualOrderByPopularityDesc(Long voteCount, Pageable pageable);

}
