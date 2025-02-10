package movlit.be.movie.presentation.dto.response;

import java.util.List;

// 메인 화면 - 영화 리스트
public record MovieMainResponseDto(
        List<MovieWithGenreDto> movieList,
        int currentPage,
        int totalPage,
        Long totalElements
) {

}
