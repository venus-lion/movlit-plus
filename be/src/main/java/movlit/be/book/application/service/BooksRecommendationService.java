package movlit.be.book.application.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import movlit.be.book.presentation.dto.BookRecommendDto;
import movlit.be.bookES.BookES;
import movlit.be.bookES.BookESService;
import movlit.be.common.util.Genre;
import movlit.be.common.util.ids.MemberId;
import movlit.be.member.application.service.MemberGenreService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BooksRecommendationService {

    private final BookSearchService bookSearchService;
    private final MemberGenreService memberGenreService;
    private final BookHeartReadService bookHeartReadService;
    private final BookESService bookESService;

    public List<BookRecommendDto> fetchBookUserInterestByGenre(MemberId memberId) {
        // 1. 유저의 취향장르 가져오기
        List<Genre> bookGenreList = memberGenreService.fetchUserInterestGenreList(memberId);

        // 2. 장르 기반 추천 검색 실행
        return bookSearchService.searchBooksByGenres(bookGenreList);
    }

    public List<BookRecommendDto> fetchRecommendedBooksByUserRecentHeart(MemberId memberId) {
        // 1. 사용자가 최근에 찜한 도서id 4개 가져오기
        List<String> bookIds = bookHeartReadService.fetchRecentLikedBookIdsByMemberId(memberId, 4);

        if (bookIds != null) {
            // 2. JPA를 사용해, 도서 정보 조회 -> BookES Repository 사용
            List<BookES> bookESList = bookESService.fetchAllBookESByBookIds(bookIds);

            // 3. 최근 찜기반 도서 추천
            Pageable pageable = PageRequest.of(0, 30);

            return bookSearchService.fetchRecommendedBooksByUserRecentHeart(bookIds, bookESList, pageable);
        }

        return null;
    }

}
