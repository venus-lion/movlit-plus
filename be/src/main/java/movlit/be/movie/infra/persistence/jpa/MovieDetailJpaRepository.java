package movlit.be.movie.infra.persistence.jpa;

import java.util.Optional;
import movlit.be.common.util.ids.MemberId;
import movlit.be.movie.domain.entity.MovieEntity;
import movlit.be.movie.presentation.dto.response.MovieDetailResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface MovieDetailJpaRepository extends JpaRepository<MovieEntity, Long> {

    @Query(" SELECT new movlit.be.movie.presentation.dto.response.MovieDetailResponse "
            + "(m.movieId, m.title, m.originalTitle, m.overview, "
            + "m.popularity, COALESCE(mhc.count, 0), false, m.posterPath, m.backdropPath, "
            + "m.releaseDate, m.productionCountry, m.originalLanguage, "
            + "m.runtime, m.status, m.voteAverage, m.tagline) "
            + "FROM MovieEntity m "
            + "LEFT JOIN FETCH m.movieHeartCount mhc " // Fetch Join 적용
            + "WHERE m.movieId = :movieId")
    Optional<MovieDetailResponse> findMovieDetailByMovieId(@Param("movieId") Long movieId);

    @Query("SELECT new movlit.be.movie.presentation.dto.response.MovieDetailResponse "
            + "(m.movieId, m.title, m.originalTitle, m.overview, "
            + "m.popularity, COALESCE(mhc.count, 0), COALESCE(mh.isHearted, false), m.posterPath, m.backdropPath, "
            + "m.releaseDate, m.productionCountry, m.originalLanguage, "
            + "m.runtime, m.status, m.voteAverage, m.tagline) "
            + "FROM MovieEntity m "
            + "LEFT JOIN FETCH m.movieHeartCount mhc " // Fetch Join 적용
            + "LEFT JOIN MovieHeartEntity mh ON mh.movieId = m.movieId AND mh.memberId = :currentMemberId "
            + "WHERE m.movieId = :movieId")
    Optional<MovieDetailResponse> findMovieDetailByMovieIdAndMemberId(@Param("movieId") Long movieId, @Param("currentMemberId") MemberId currentMemberId);

}