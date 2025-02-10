package movlit.be.book.application.service;

import java.util.List;
import lombok.RequiredArgsConstructor;
import movlit.be.book.domain.repository.BookHeartRepository;
import movlit.be.book.infra.persistence.recommend_jpa.BookHeartRecommendRepository;
import movlit.be.common.util.ids.BookId;
import movlit.be.common.util.ids.MemberId;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookHeartReadService {

    private final BookHeartRecommendRepository bookHeartRecommendRepository;
    private final BookHeartRepository bookHeartRepository;

    public List<String> fetchRecentLikedBookIdsByMemberId(MemberId memberId, int count) {
        List<String> bookIds = bookHeartRecommendRepository.findRecentLikedBookIdsByMemberId(
                memberId, count);

        if (bookIds.isEmpty()) {
            // 해당 유저가 찜한 도서가 존재하지 않는다.
            //throw new BookHeartNotFoundException();
            System.out.println("BookHeartReadService >>> 회원님이 찜한 도서가 없습니다.");
            return null;
        }
        return bookIds;
    }

    // 해당 책을 찜한 멤버 리스트 가져오기
    public List<MemberId> fetchHeartingMemberIdsByBookId(BookId bookId) {
        List<MemberId> heartingMemberIds = bookHeartRepository.fetchHeartingMembersByBookId(bookId);

        return heartingMemberIds;
    }

}
