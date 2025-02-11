package movlit.be.movie.presentation.dto.response;

import movlit.be.common.util.Genre;

public record GenreDto(
        Long genreId,
        String genreName
) {

    public GenreDto(Long genreId) {
        this(genreId, Genre.of(genreId).getName());
    }

}
