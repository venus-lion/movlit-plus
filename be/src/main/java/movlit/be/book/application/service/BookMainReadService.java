package movlit.be.book.application.service;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import movlit.be.book.domain.BookBestsellerVo;
import movlit.be.book.domain.BookNewSpecialVo;
import movlit.be.book.domain.BookNewVo;
import movlit.be.book.domain.BookVo;
import movlit.be.book.domain.repository.BookBestsellerRepository;
import movlit.be.book.domain.repository.BookNewRepository;
import movlit.be.book.domain.repository.BookNewSpecialRepository;
import movlit.be.book.presentation.dto.BooksResponse.BookItemDto;
import movlit.be.book.presentation.dto.BooksResponse.BookItemDto.WriterDto;
import movlit.be.common.exception.BookIllegalArgumentException;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BookMainReadService {

    private final BookBestsellerRepository bookBestsellerRepository;
    private final BookNewRepository bookNewRepository;
    private final BookNewSpecialRepository bookNewSpecialRepository;

    public List<BookItemDto> fetchBestsellers(int limit) {
        Pageable pageable = PageRequest.of(0, limit); // 0페이지 ~ limit 개수만큼 가져옴
        List<BookBestsellerVo> bookbestsellers = bookBestsellerRepository.findAllBestsellers(pageable);

        return bookbestsellers.stream()
                .map(bookbestseller -> convertToDto(bookbestseller))
                .collect(Collectors.toList());
    }

    public List<BookItemDto> fetchBookNews(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<BookNewVo> bookNewVos = bookNewRepository.findAllBookNew(pageable);

        return bookNewVos.stream()
                .map(bookNewVo -> convertToDto(bookNewVo))
                .collect(Collectors.toList());
    }

    public List<BookItemDto> fetchBookNewSpecials(int limit) {
        Pageable pageable = PageRequest.of(0, limit);
        List<BookNewSpecialVo> bookNewSpecialVos = bookNewSpecialRepository.findAllBookNewSpecial(pageable);

        return bookNewSpecialVos.stream()
                .map(bookNewSpecial -> convertToDto(bookNewSpecial))
                .collect(Collectors.toList());
    }

    // 공통된 Book -> BookItemDto 변환 로직
    private BookItemDto convertToDto(Object bookObject) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd");

        // BookBestseller, BookNew, BookNewSpecial 일 때에 따라 다른 타입으로 변환
        BookVo bookVo = getBookFromEntity(bookObject);

        List<WriterDto> writers = bookVo.getBookRCrewVos().stream()
                .map(rc -> WriterDto.builder()
                        .name(rc.getBookcrewVo().getName())
                        .role(rc.getBookcrewVo().getRole().name())
                        .build())
                .collect(Collectors.toList());

        return BookItemDto.builder()
                .bookId(bookVo.getBookId().getValue())
                .title(bookVo.getTitle())
                .writers(writers)
                .pubDate(bookVo.getPubDate().format(formatter))
                .bookImgUrl(bookVo.getBookImgUrl())
                .build();

    }

    // Entity에 맞는 Book 객체를 가져옴
    private BookVo getBookFromEntity(Object bookEntity) {
        if (bookEntity instanceof BookBestsellerVo) {
            return ((BookBestsellerVo) bookEntity).getBookVo();
        } else if (bookEntity instanceof BookNewVo) {
            return ((BookNewVo) bookEntity).getBookVo();
        } else if (bookEntity instanceof BookNewSpecialVo) {
            return ((BookNewSpecialVo) bookEntity).getBookVo();
        } else {
            throw new BookIllegalArgumentException();
        }
    }

}
