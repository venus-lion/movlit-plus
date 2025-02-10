package movlit.be.movie.presentation.dto.response;

import java.util.List;

// 메인 화면 - 장르별 영화
public record MovieMainGenreResponseDto(
        Long genreId,
        String genreName,
        List<MovieWithGenreDto> movieList,
        int currentPage,
        int totalPage,
        Long totalElements
) {
}
