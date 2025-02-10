package movlit.be.movie.application.service;

import java.util.List;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.common.util.Genre;
import movlit.be.movie.domain.Movie;
import movlit.be.movie.domain.entity.MovieEntity;
import movlit.be.movie.domain.repository.MovieRepository;
import movlit.be.movie.presentation.dto.response.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class MovieReadService {

    private final MovieRepository movieRepository;

    @Transactional(readOnly = true)
    public MovieListResponseDto getMovieLatest(int page, int pageSize) {
        Pageable pageable = Pageable.ofSize(pageSize).withPage(page - 1);

        return new MovieListResponseDto(movieRepository.findAllOrderByReleaseDateDesc(pageable));
    }

    // 최신 영화 리펙토링
    @Transactional(readOnly = true)
    public MovieMainResponseDto getRecentMovieList(int page, int pageSize) {
        Pageable pageable = Pageable.ofSize(pageSize).withPage(page - 1);

        Page<MovieEntity> moviePage = movieRepository.findMovieEntityOrderByReleaseDateDesc(pageable);

        return toResponse(moviePage);
    }

    @Transactional(readOnly = true)
    public MovieListResponseDto getMoviePopular(int page, int pageSize) {
        Long MIN_VOTE_COUNT = 500L;     // 인기순위 최소 vote_count

        Pageable pageable = Pageable.ofSize(pageSize).withPage(page - 1);
        List<Movie> movieList = movieRepository.findByVoteCountGreaterThan500OrderByPopularityDesc(MIN_VOTE_COUNT,
                pageable);

        return new MovieListResponseDto(movieList);
    }

    // 인기 영화 리펙토링
    @Transactional(readOnly = true)
    public MovieMainResponseDto getPopularMovieList(int page, int pageSize) {
        Long MIN_VOTE_COUNT = 500L;     // 인기순위 최소 vote_count

        Pageable pageable = Pageable.ofSize(pageSize).withPage(page - 1);
        Page<MovieEntity> moviePage = movieRepository.findMovieEntityByVoteCountGreaterThanOrderByPopularityDesc(MIN_VOTE_COUNT,
                pageable);

        return toResponse(moviePage);
    }

    @Transactional(readOnly = true)
    public MovieListByGenreResponseDto getMovieGroupbyGenre(Long genreId, int page, int pageSize) {
        // genreId -> Genre Enum객체
        Genre genre = Genre.of(genreId);
        Pageable pageable = Pageable.ofSize(pageSize).withPage(page - 1);

        List<Movie> movieList = movieRepository.findByMovieGenreIdForEntity_GenreId(genre.getId(), pageable);

        return new MovieListByGenreResponseDto(genreId, genre.getName(), movieList);
    }

    // 장르별 영화 리팩토링
    @Transactional(readOnly = true)
    public MovieMainGenreResponseDto getMovieListByGenre(Long genreId, int page, int pageSize) {
        // genreId -> Genre Enum객체
        Genre genre = Genre.of(genreId);
        Pageable pageable = Pageable.ofSize(pageSize).withPage(page - 1);

        Page<MovieEntity> moviePage = movieRepository.findMovieEntityByMovieGenreIdForEntity_GenreId(genreId, pageable);

        return toResponse(genre, moviePage);
    }


    public Movie fetchByMovieId(Long movieId) {
        return movieRepository.findById(movieId);
    }

    // 메인화면 영화 리스트 Response DTO로 변환
    private MovieMainResponseDto toResponse(Page<MovieEntity> moviePage) {
        List<MovieWithGenreDto> movieList = toDto(moviePage);

        return new MovieMainResponseDto(
                movieList,
                moviePage.getNumber() + 1,
                moviePage.getTotalPages(),
                moviePage.getTotalElements()
        );
    }

    // 메인화면 장르별 리스트 Response DTO로 변환
    private MovieMainGenreResponseDto toResponse(Genre genre, Page<MovieEntity> moviePage) {
        List<MovieWithGenreDto> movieList = toDto(moviePage);

        return new MovieMainGenreResponseDto(
                genre.getId(), genre.getName(),
                movieList,
                moviePage.getNumber() + 1,
                moviePage.getTotalPages(),
                moviePage.getTotalElements()
        );
    }

    // Entity를 DTO 리스트로 변환
    private List<MovieWithGenreDto> toDto(Page<MovieEntity> moviePage) {
        return moviePage.getContent().stream()
                .map(movie -> {
                    List<GenreDto> genres = movie.getMovieGenreEntityList().stream()
                            .map(genre -> new GenreDto(genre.getMovieGenreIdForEntity().getGenreId()))
                            .toList();

                    return new MovieWithGenreDto(
                            movie.getMovieId(),
                            movie.getTitle(),
                            movie.getPosterPath(),
                            movie.getVoteAverage(),
                            genres
                    );
                })
                .toList();
    }

}
