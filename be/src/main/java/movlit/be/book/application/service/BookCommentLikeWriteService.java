package movlit.be.book.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.book.domain.BookCommentLikeCountVo;
import movlit.be.book.domain.BookCommentLikeVo;
import movlit.be.book.domain.BookCommentVo;
import movlit.be.book.domain.BookVo;
import movlit.be.book.domain.repository.BookCommentLikeCountRepository;
import movlit.be.book.domain.repository.BookCommentLikeRepository;
import movlit.be.common.util.ids.BookCommentId;
import movlit.be.common.util.ids.MemberId;
import movlit.be.member.application.service.MemberReadService;
import movlit.be.member.domain.Member;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookCommentLikeWriteService {

    private final BookCommentReadService bookCommentReadService;
    private final MemberReadService memberReadService;
    private final BookDetailReadService bookDetailReadService;

    private final BookCommentLikeRepository bookCommentLikeRepository;
    private final BookCommentLikeCountRepository bookCommentLikeCountRepository;

    // 해당 도서 리뷰에 대한 좋아요 추가
    @Transactional
    public BookCommentLikeVo addLike(MemberId memberId, BookCommentId bookCommentId) {
        Member member = memberReadService.fetchByMemberId(memberId);

        BookCommentVo comment = bookCommentReadService.fetchByBookCommentId(bookCommentId);
        BookVo bookVo = bookDetailReadService.fetchByBookId(comment.getBookVo().getBookId());

        BookCommentLikeVo existingLike = bookCommentLikeRepository.fetchByBookCommentAndMember(comment, member);

        log.info("::BookCommentLikeWriteService_addLike::");
        // 해당 리뷰 좋아요 기존 상태 정보 없다면 -> 새로 생성
        if (existingLike == null) {
            // Like 추가
            BookCommentLikeVo bookCommentLikeVo = BookCommentLikeVo.builder()
                    .bookCommentVo(comment)
                    .bookVo(bookVo)
                    .member(member)
                    .isLiked(true)
                    .build();
            BookCommentLikeVo savedLike = bookCommentLikeRepository.save(bookCommentLikeVo);
            log.info(">> savedLike : " + savedLike.toString());

            // bookCommentLikeCount  1 증가
            if (savedLike != null) {
                BookCommentLikeCountVo existingCount = bookCommentLikeCountRepository.fetchByBookComment(comment);
                if (existingCount == null) {
                    BookCommentLikeCountVo likeCount = BookCommentLikeCountVo.builder()
                            .bookCommentVo(comment)
                            .count(0)
                            .build();
                    existingCount = bookCommentLikeCountRepository.save(likeCount);
                }
                bookCommentLikeCountRepository.increaseLikeCount(comment);
            }
            return savedLike;
        } else {
            log.info(">> existingLike : " + existingLike.toString());
            return existingLike;
        }

    }

    // 해당 도서 리뷰에 대한 좋아요 삭제
    @Transactional
    public void removeLike(MemberId memberId, BookCommentId bookCommentId) throws Exception {
        BookCommentVo comment = bookCommentReadService.fetchByBookCommentId(bookCommentId);
        BookVo bookVo = bookDetailReadService.fetchByBookId(comment.getBookVo().getBookId());
        Member member = memberReadService.fetchByMemberId(memberId);

        BookCommentLikeVo existingLike = bookCommentLikeRepository.fetchByBookCommentAndMember(comment, member);
        if (existingLike != null) {
            log.info("::BookCommentLikeWriteService_removeLike::");
            log.info(">> delete Like: \nmember : " + member.toString() + "\nbook : " + bookVo.toString());
            // 리뷰에 대한 좋아요 삭제
            bookCommentLikeRepository.delete(existingLike);
            BookCommentLikeCountVo existingCount = bookCommentLikeCountRepository.fetchByBookComment(comment);
            // bookCommentLikeCount  1 증가
            if (existingCount != null && existingCount.getCount() > 0) {
                bookCommentLikeCountRepository.decreaseHeartCount(comment);
            }

        } else {
            throw new Exception("좋아요를 삭제할 수 없습니다.");
        }
    }

    // 해당 리뷰의 좋아요 0으로 초기화 (리뷰 삭제 전 관련 좋아요 삭제)
    public void removeLikeandCount(BookCommentId bookCommentId) {
        log.info("::BookCommentLikeWriteService_removeLikeAndCount::");
        log.info(">> BookCommentId : " + bookCommentId);

        bookCommentLikeCountRepository.deleteAllByCommentId(bookCommentId);
        bookCommentLikeRepository.deleteAllByCommentId(bookCommentId);
    }


}
