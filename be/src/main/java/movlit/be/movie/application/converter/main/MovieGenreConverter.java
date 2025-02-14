package movlit.be.movie.application.converter.main;

import movlit.be.common.util.Genre;
import movlit.be.movie.domain.MovieGenre;
import movlit.be.movie.domain.entity.MovieGenreEntity;

public class MovieGenreConverter {

    // Entity -> Domain
    public static MovieGenre toDomain(MovieGenreEntity movieGenreEntity) {
        Long genreId = movieGenreEntity.getMovieGenreIdForEntity().getGenreId();
        return MovieGenre.builder()
                .genreId(genreId)
                .genreName(Genre.of(genreId).getName())
                .build();
    }

}
