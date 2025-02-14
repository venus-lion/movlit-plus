package movlit.be.book.presentation;

import java.util.List;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.auth.application.service.MyMemberDetails;
import movlit.be.book.application.service.BookDetailReadService;
import movlit.be.book.application.service.BookDetailWriteService;
import movlit.be.book.application.service.BookHeartWriteService;
import movlit.be.book.domain.BookHeartVo;
import movlit.be.book.domain.BookVo;
import movlit.be.book.presentation.dto.BookDetailResponseDto;
import movlit.be.bookES.BookESVo;
import movlit.be.common.util.ids.BookId;
import movlit.be.common.util.ids.MemberId;
import movlit.be.member.application.service.MemberReadService;
import movlit.be.member.domain.Member;
import movlit.be.movie.domain.document.MovieDocument;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
@Slf4j
public class BookDetailController {

    private final BookDetailReadService bookDetailReadService;
    private final BookDetailWriteService bookDetailWriteService;
    private final BookHeartWriteService bookHeartWriteService;

    private final MemberReadService memberReadService;

    // 해당 도서 상세 내역
    @GetMapping("{bookId}/detail")
    public BookDetailResponseDto fetchBookDetail(@PathVariable BookId bookId,
                                                 @AuthenticationPrincipal MyMemberDetails details) {
        Member member = null;
        MemberId memberId = null;
        if (details != null) {
            memberId = details.getMemberId();
            member = memberReadService.fetchByMemberId(memberId);
        }

        BookDetailResponseDto detailResponse = bookDetailReadService.fetchBookDetail(bookId, memberId);
        log.info("::BookDetailController_fetchBookDetail::");
        log.info(">> BookDetailResponse : " + detailResponse.toString());
        return detailResponse;
    }

    // 도서 찜(heart)하기
    @PostMapping("{bookId}/hearts")
    public ResponseEntity addHearts(@PathVariable BookId bookId, @AuthenticationPrincipal MyMemberDetails details) {
        if (details != null) {
            MemberId memberId = details.getMemberId();
            Member member = memberReadService.fetchByMemberId(memberId);
            BookVo bookVo = bookDetailReadService.fetchByBookId(bookId);

            BookHeartVo savedHeart = bookHeartWriteService.addHeart(member, bookVo);

            log.info("::BookDetailController_addHearts::");
            log.info(">> BookHeartResponse : " + savedHeart.toString());

            return ResponseEntity.ok(savedHeart);
        } else {
            return ResponseEntity.badRequest().build();
        }
    }

    // 도서 찜(heart) 삭제
    @DeleteMapping("{bookId}/hearts")
    public ResponseEntity removeHearts(@PathVariable BookId bookId, @AuthenticationPrincipal MyMemberDetails details
    ) throws Exception {
        if (details != null) {
            MemberId memberId = details.getMemberId();
            Member member = memberReadService.fetchByMemberId(memberId);
            BookVo bookVo = bookDetailReadService.fetchByBookId(bookId);

            bookHeartWriteService.removeHeart(member, bookVo);

            log.info("::BookDetailController_removeHearts::");
            log.info(">> RemovedBookHeart : \nmember : " + member + "\nbook : " + bookVo.toString());

            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.badRequest().build();
        }


    }

    @GetMapping("{bookId}/recommendedBooks")
    public ResponseEntity<List<BookESVo>> fetchRecommendedBooks(@PathVariable BookId bookId) {
        List<BookESVo> recommendedBookList = bookDetailReadService.fetchRecommendedBooks(bookId);
        log.info("::BookDetailController_fetchRecommendedBooks::");

        for (BookESVo recBook : recommendedBookList) {
            // 각 BookCommentResponseDto의 내용 출력
            log.info(">> 해당 도서 관련 추천 도서 : " + recBook.toString());

        }
        return ResponseEntity.ok(recommendedBookList);
    }

    @GetMapping("{bookId}/recommendedMovies")
    public ResponseEntity<List<MovieDocument>> fetchRecommendedMovies(@PathVariable BookId bookId) {
        List<MovieDocument> recommendedMovieList = bookDetailReadService.fetchRecommendedMovies(bookId);
        log.info("::BookDetailController_fetchRecommendedBooks::");

        for (MovieDocument recMovie : recommendedMovieList) {
            // 각 MovieDocument의 내용 출력
            log.info(">> 해당 도서 관련 추천 영화 : " + recommendedMovieList.toString());
        }
        return ResponseEntity.ok(recommendedMovieList);
    }

    @GetMapping("recommend/books/{movieId}")
    public ResponseEntity<List<BookESVo>> fetchRecommendedMBooksByMovieId(@PathVariable Long movieId) {
        List<BookESVo> recommendedMovieList = bookDetailReadService.fetchRecommendedBooksByMovieId(movieId);
        return ResponseEntity.ok(recommendedMovieList);
    }


}