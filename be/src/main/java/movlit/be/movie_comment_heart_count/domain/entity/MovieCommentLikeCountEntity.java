package movlit.be.movie_comment_heart_count.domain.entity;

import jakarta.persistence.AttributeOverride;
import jakarta.persistence.Column;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import movlit.be.common.util.ids.MovieCommentId;
import movlit.be.common.util.ids.MovieCommentLikeCountId;

@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Entity
@Getter
@Table(name = "movie_comment_like_count")
public class MovieCommentLikeCountEntity {

    @EmbeddedId
    private MovieCommentLikeCountId movieCommentLikeCountId;

    @AttributeOverride(name = "value", column = @Column(name = "movie_comment_id"))
    private MovieCommentId movieCommentId;

    private Long count;

    @Version
    private Long version;

    @Builder
    public MovieCommentLikeCountEntity(MovieCommentLikeCountId movieCommentLikeCountId, MovieCommentId movieCommentId,
                                       Long count) {
        this.movieCommentLikeCountId = movieCommentLikeCountId;
        this.movieCommentId = movieCommentId;
        this.count = count;
    }

}
