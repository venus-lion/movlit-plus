package movlit.be.movie.domain.repository;

import java.util.List;
import movlit.be.movie.domain.Movie;
import movlit.be.movie.domain.entity.MovieEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface MovieRepository {

    Movie save(Movie movie);

    Movie findById(Long movieId);

    void deleteById(Long movieId);

    List<Movie> findAllOrderByReleaseDateDesc(Pageable pageable);      // 개봉순

    List<Movie> findByMovieGenreIdForEntity_GenreId(Long genreId, Pageable pageable);

    List<Movie> findByVoteCountGreaterThan500OrderByPopularityDesc(Long minVoteCount, Pageable pageable);

    // 리펙토링
    Page<MovieEntity> findMovieEntityOrderByReleaseDateDesc(Pageable pageable);

    Page<MovieEntity> findMovieEntityByVoteCountGreaterThanOrderByPopularityDesc(Long minVoteCount, Pageable pageable);

    Page<MovieEntity> findMovieEntityByMovieGenreIdForEntity_GenreId(Long genreId, Pageable pageable);

}
