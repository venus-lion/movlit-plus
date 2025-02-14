package movlit.be.movie.domain.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.ToString;
import org.springframework.data.elasticsearch.annotations.Field;
import org.springframework.data.elasticsearch.annotations.FieldType;
import org.springframework.data.elasticsearch.annotations.InnerField;
import org.springframework.data.elasticsearch.annotations.MultiField;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class MovieGenreForDocument {

    @Field(type = FieldType.Keyword)
    private Long genreId; // 장르 ID

    @MultiField(mainField = @Field(type = FieldType.Keyword),
            otherFields = {
                    @InnerField(suffix = "ko", type = FieldType.Text, analyzer = "korean_analyzer", searchAnalyzer = "korean_analyzer"),
                    @InnerField(suffix = "ngram", type = FieldType.Text, analyzer = "my_ngram_analyzer", searchAnalyzer = "my_ngram_analyzer"),
                    @InnerField(suffix = "standard", type = FieldType.Text, analyzer = "standard", searchAnalyzer = "standard")
            })
    private String genreName; // 장르 이름

}
