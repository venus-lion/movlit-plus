package movlit.be.movie.domain.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;

@Entity
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Getter
@ToString
@Table(
        name = "movie_genre",
        indexes = {
                @Index(name = "idx_movie_genre_movie_id", columnList = "movie_id"),
                @Index(name = "idx_movie_genre_genre_id", columnList = "genre_id")
        }
)
public class MovieGenreEntity {

    @EmbeddedId
    private MovieGenreIdForEntity movieGenreIdForEntity;

    @ManyToOne(fetch = FetchType.LAZY)
    @MapsId("movieId")
    @JoinColumn(name = "movie_id", referencedColumnName = "id", updatable = false, insertable = false)
    private MovieEntity movieEntity;

}
