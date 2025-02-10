package movlit.be.movie.presentation.dto.response;

import java.util.List;

public record MovieWithGenreDto(
        Long movieId,
        String title,
        String posterPath,
        Double voteAverage,
        List<GenreDto> movieGenreList
) {
}
