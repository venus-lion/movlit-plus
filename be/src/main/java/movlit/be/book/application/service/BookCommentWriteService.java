package movlit.be.book.application.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.book.domain.BookCommentVo;
import movlit.be.book.domain.BookVo;
import movlit.be.book.domain.entity.GenerateUUID;
import movlit.be.book.domain.repository.BookCommentRepository;
import movlit.be.book.presentation.dto.BookCommentRequestDto;
import movlit.be.book.presentation.dto.BookCommentResponseDto;
import movlit.be.common.exception.BookCommentAccessDenied;
import movlit.be.common.util.ids.BookCommentId;
import movlit.be.common.util.ids.BookId;
import movlit.be.common.util.ids.MemberId;
import movlit.be.member.application.service.MemberReadService;
import movlit.be.member.domain.Member;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class BookCommentWriteService {

    private final BookCommentReadService bookCommentReadService;
    private final MemberReadService memberReadService;
    private final BookDetailReadService bookDetailReadService;
    private final BookCommentLikeWriteService bookCommentLikeWriteService;

    private final BookCommentRepository bookCommentRepository;

    // 도서 리뷰 등록
    public BookCommentVo registerBookComment(MemberId memberId, BookId bookId, BookCommentRequestDto commentDto)
            throws BookCommentAccessDenied {
        // 한 사용자는 하나의 도서에 관해 1개의 리뷰만 등록 가능
        BookCommentResponseDto savedComment = bookCommentRepository.fetchCommentByMemberAndBook(memberId, bookId);
        Member member = memberReadService.fetchByMemberId(memberId);
        BookVo bookVo = bookDetailReadService.fetchByBookId(bookId);

        // 첫 리뷰라면 -> 리뷰 저장
        if (savedComment == null) {
            BookCommentVo bookCommentVo = BookCommentVo.builder()
                    .bookCommentId(new BookCommentId(GenerateUUID.generateUUID()))
                    .bookVo(bookVo)
                    .member(member)
                    .comment(commentDto.getComment())
                    .score(commentDto.getScore())
                    .build();
            return bookCommentRepository.save(bookCommentVo);
        } else {
            // 등록된 리뷰가 이미 있다면 -> update
            return updateBookComment(memberId, bookId, savedComment.getBookCommentId(), commentDto);
        }


    }

    // 도서 리뷰 수정
    public BookCommentVo updateBookComment(MemberId memberId, BookId bookId, BookCommentId bookCommentId,
                                           BookCommentRequestDto commentDto)
            throws BookCommentAccessDenied {
        // 기존 리뷰 가져오기
        BookCommentVo bookCommentVo = bookCommentReadService.fetchByBookCommentId(bookCommentId);

        if (bookCommentVo != null) {
            if (bookCommentVo.getMember().getMemberId().equals(memberId)
                    && bookCommentVo.getBookVo().getBookId().equals(bookId)) {
                // 기존 리뷰에서 코멘트 및 평점 update
                bookCommentVo.setComment(commentDto.getComment());
                if (commentDto.getScore() != null) {
                    bookCommentVo.setScore(commentDto.getScore());
                }


            } else {
                throw new BookCommentAccessDenied();
            }

        }

        return bookCommentRepository.save(bookCommentVo);
    }

    // 도서 리뷰 삭제
    @Transactional
    public void deleteBookComment(MemberId memberId, BookId bookId, BookCommentId bookCommentId)
            throws BookCommentAccessDenied {
        BookCommentVo bookCommentVo = bookCommentReadService.fetchByBookCommentId(bookCommentId);
        Member member = memberReadService.fetchByMemberId(memberId);
        BookVo bookVo = bookDetailReadService.fetchByBookId(bookId);

        if (bookCommentVo != null) {
            if (bookCommentVo.getMember().getMemberId().equals(memberId)
                    && bookCommentVo.getBookVo().getBookId().equals(bookId)) {
                try {
                    // 하드 삭제
                    log.info("::BookCommentWriteService_deleteBookComment::");
                    log.info(
                            ">> deleteBookComment : \nmember : " + member.toString() + "\nbook : " + bookVo.toString());
                    // 해당 리뷰의 좋아요 및 좋아요 카운트 선 리셋(삭제)
                    bookCommentLikeWriteService.removeLikeandCount(bookCommentId);
                    // 이후 리뷰 삭제
                    bookCommentRepository.deleteById(bookCommentId);

                    log.info(">> Successfully deleted comment and likes.");

                } catch (Exception e) {
                    e.getMessage();
                    log.error("Error during deletion: ", e);
                    throw new RuntimeException("Failed to delete comment or likes");
                }
            } else {
                throw new BookCommentAccessDenied();
            }
        } else {
            throw new BookCommentAccessDenied();
        }

    }


}