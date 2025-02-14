package movlit.be.book.getBookApi;

import lombok.RequiredArgsConstructor;
import movlit.be.book.domain.entity.BookEntity;
import movlit.be.book.domain.entity.BookGenreEntity;
import movlit.be.book.domain.entity.BookGenreIdEntity;
import movlit.be.book.infra.persistence.jpa.BookGenreJpaRepository;
import movlit.be.common.util.Genre;
import movlit.be.common.util.ids.BookId;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookCategory {
    // private final Object serviceObject;

    private final BookGenreJpaRepository bookGenreJpaRepository;

    public void classifyAndSaveBooks(String bookCode, BookEntity savedBookEntity) {

//        if (serviceObject instanceof GetBookBestService){
//            GetBookBestService service = (GetBookBestService ) serviceObject;
//        }

        // Save the category if applicable
        if (isActionCategory(bookCode)) {
            saveBookToDatabase(Genre.ACTION, savedBookEntity);
        }
        if (isAnimationCategory(bookCode)) {
            // GetBookBestService.saveBookToDatabase(bookCode, Genre.ANIMATION);
            saveBookToDatabase(Genre.ANIMATION, savedBookEntity);
        }
        if (isComedyCategory(bookCode)) {
            saveBookToDatabase(Genre.COMEDY, savedBookEntity);
        }
        if (isCrimeCategory(bookCode)) {
            saveBookToDatabase(Genre.CRIME, savedBookEntity);
        }
        //ㅁ완
        if (isCrimeCategory(bookCode)) {
            saveBookToDatabase(Genre.CRIME, savedBookEntity);
        }
        if (isDocumentaryCategory(bookCode)) {
            saveBookToDatabase(Genre.DOCUMENTARY, savedBookEntity);
        }
        if (isDramaCategory(bookCode)) {
            saveBookToDatabase(Genre.DRAMA, savedBookEntity);
        }
        if (isFantasyCategory(bookCode)) {
            saveBookToDatabase(Genre.FANTASY, savedBookEntity);
        }
        if (isHistoryCategory(bookCode)) {
            saveBookToDatabase(Genre.HISTORY, savedBookEntity);
        }
        if (isMusicCategory(bookCode)) {
            saveBookToDatabase(Genre.MUSIC, savedBookEntity);
        }
        if (isMysteryCategory(bookCode)) {
            saveBookToDatabase(Genre.MYSTERY, savedBookEntity);
        }
        if (isRomanceCategory(bookCode)) {
            saveBookToDatabase(Genre.ROMANCE, savedBookEntity);
        }
        if (isSFCategory(bookCode)) {
            saveBookToDatabase(Genre.SCIENCE_FICTION, savedBookEntity);
        }
        if (isTV_MOVIECategory(bookCode)) {
            saveBookToDatabase(Genre.TV_MOVIE, savedBookEntity);
        }
        if (isTHRILLERCategory(bookCode)) {
            saveBookToDatabase(Genre.THRILLER, savedBookEntity);
        }
        if (isWARCategory(bookCode)) {
            saveBookToDatabase(Genre.WAR, savedBookEntity);
        }
        if (isUNKNOWNCategory(bookCode)) {
            saveBookToDatabase(Genre.ETC, savedBookEntity);
        }
    }

    //  ACTION(1, "액션"), // + 모험
    private boolean isActionCategory(String bookCode) {
        return
                "50933".equals(bookCode) ||
                        "3724".equals(bookCode) ||
                        "4133".equals(bookCode);
    }

    // ANIMATION(2, "애니메이션")
    private boolean isAnimationCategory(String bookCode) {
        return "4298".equals(bookCode) ||
                "4302".equals(bookCode) ||
                "4301".equals(bookCode) ||
                "4303".equals(bookCode) ||
                "2924".equals(bookCode);

    }

    // COMEDY(3, "코미디")
    private boolean isComedyCategory(String bookCode) {
        return "2552".equals(bookCode) ||
                "4302".equals(bookCode);
    }

    // CRIME(4, "범죄")
    private boolean isCrimeCategory(String bookCode) {
        return "2556".equals(bookCode) ||
                "50926".equals(bookCode) ||
                "51067".equals(bookCode) ||
                "51062".equals(bookCode) ||
                "51058".equals(bookCode) ||
                "51065".equals(bookCode);
    }

    // DOCUMENTARY(5, "다큐멘터리")
    private boolean isDocumentaryCategory(String bookCode) {
        return "48899".equals(bookCode) ||
                "48901".equals(bookCode) ||
                "48902".equals(bookCode) ||
                "51377".equals(bookCode) ||
                "51423".equals(bookCode) ||
                "51425".equals(bookCode) ||
                "51842".equals(bookCode) ||
                "51843".equals(bookCode) ||
                "51844".equals(bookCode) ||
                "51845".equals(bookCode) ||
                "51373".equals(bookCode) ||
                "51394".equals(bookCode) ||
                "50827".equals(bookCode) ||
                "51381".equals(bookCode) ||
                "51416".equals(bookCode) ||
                "52906".equals(bookCode) ||
                "52904".equals(bookCode);
    }

    //  DRAMA(6, "드라마")
    private boolean isDramaCategory(String bookCode) {
        return "51242".equals(bookCode) ||
                "50919".equals(bookCode) ||
                "50918".equals(bookCode) ||
                "50996".equals(bookCode) ||
                "50998".equals(bookCode) ||
                "51242".equals(bookCode) ||
                "51239".equals(bookCode) ||
                "50917".equals(bookCode) ||
                "50994".equals(bookCode) ||
                "50993".equals(bookCode);
    }

    // FANTASY(7, "판타지")
    private boolean isFantasyCategory(String bookCode) {
        return "50928".equals(bookCode) ||
                "51120".equals(bookCode) ||
                "51122".equals(bookCode) ||
                "4133".equals(bookCode) ||
                "4134".equals(bookCode) ||
                "4135".equals(bookCode) ||
                "4132".equals(bookCode);
    }

    // HISTORY(8, "역사")
    private boolean isHistoryCategory(String bookCode) {
        return "4670".equals(bookCode) ||
                "50929".equals(bookCode) ||
                "49220".equals(bookCode) ||
                "48813".equals(bookCode) ||
                "50883".equals(bookCode) ||
                "74".equals(bookCode);
    }

    // MUSIC(9, "음악")
    private boolean isMusicCategory(String bookCode) {
        return "50966".equals(bookCode) ||
                "51012".equals(bookCode) ||
                "51214".equals(bookCode) ||
                "51000".equals(bookCode);
    }

    // MYSTERY(10, "미스터리")
    private boolean isMysteryCategory(String bookCode) {
        return "2556".equals(bookCode) ||
                "50926".equals(bookCode) ||
                "51067".equals(bookCode) ||
                "51062".equals(bookCode) ||
                "51058".equals(bookCode) ||
                "51065".equals(bookCode);
    }

    // ROMANCE(11, "로맨스")
    private boolean isRomanceCategory(String bookCode) {
        return "51107".equals(bookCode) ||
                "50935".equals(bookCode) ||
                "51126".equals(bookCode) ||
                "51107".equals(bookCode) ||
                "50935".equals(bookCode) ||
                "51126".equals(bookCode) ||
                "51125".equals(bookCode);
    }

    // SCIENCE_FICTION(12, "SF")
    private boolean isSFCategory(String bookCode) {
        return "2553".equals(bookCode) ||
                "50930".equals(bookCode);
    }

    // TV_MOVIE(13, "TV 영화")
    private boolean isTV_MOVIECategory(String bookCode) {
        return "48949".equals(bookCode) ||
                "50967".equals(bookCode) ||
                "4301".equals(bookCode) ||
                "51051".equals(bookCode); // TV 영화 완료
    }

    // THRILLER(14, "공포, 스릴러")
    private boolean isTHRILLERCategory(String bookCode) {
        return "3723".equals(bookCode) ||
                "50933".equals(bookCode) ||
                "50931".equals(bookCode); // 스릴러 완료
    }

    // WAR(15, "전쟁")
    private boolean isWARCategory(String bookCode) {
        return "51407".equals(bookCode) ||
                "51253".equals(bookCode) ||
                "48908".equals(bookCode) ||
                "52610".equals(bookCode) ||
                "52617".equals(bookCode) ||
                "3826".equals(bookCode) ||
                "1961".equals(bookCode) ||
                "84".equals(bookCode) ||
                "52591".equals(bookCode) ||
                "1753".equals(bookCode); // 전쟁 완료
    }

    //  UNKNOWN(20, "기타") -> 장르 위 장르에 전부 속하지 않을 때 ( || 아닌 &&으로 바꿈)
    private boolean isUNKNOWNCategory(String bookCode) {
        return !isActionCategory(bookCode) &&
                !isAnimationCategory(bookCode) &&
                !isComedyCategory(bookCode) &&
                !isCrimeCategory(bookCode) &&
                !isDocumentaryCategory(bookCode) &&
                !isDramaCategory(bookCode) &&
                !isFantasyCategory(bookCode) &&
                !isHistoryCategory(bookCode) &&
                !isMusicCategory(bookCode) &&
                !isMysteryCategory(bookCode) &&
                !isRomanceCategory(bookCode) &&
                !isSFCategory(bookCode) &&
                !isTV_MOVIECategory(bookCode) &&
                !isTHRILLERCategory(bookCode) &&
                !isWARCategory(bookCode);
    }

    private void saveBookToDatabase(Genre genre, BookEntity savedBookEntity) {

        Long genreId = genre.getId();
        BookId bookId = savedBookEntity.getBookId();

        String genreName = genre.getName();
        System.out.println("&&&&&&&&&&&&&&&&원래분류" + savedBookEntity.getCategoryName() +
                "\n\n%%%%%%%%%장르 ID : " + genreId + "\n%%%%%%%%%장르명 :" + genreName);

        BookGenreIdEntity bookGenreIdEntity = new BookGenreIdEntity(genreId, bookId);
        BookGenreEntity bookGenreEntity = BookGenreEntity.builder()
                .bookEntity(savedBookEntity)
                .bookGenreIdEntity(bookGenreIdEntity)
                .build();

        System.out.println("*******장르엔티티" + bookGenreEntity);
        bookGenreJpaRepository.save(bookGenreEntity);


    }

}