package movlit.be.book.getBookApi;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/testBook")
public class GetBookController {

    private final GetBookBestService getBookBestService;
    private final GetBookNewService getBookNewService;
    private final GetBookNewSpecialService getBookNewSpecialService;

    // BookBestseller 저장 api
    @GetMapping("/saveBooks/bestseller")
    public void BestsellersApiToDb() {
        getBookBestService.repeatGet(10); // 한번에 최대 50개씩, 20번 실행
    }

    // BookNew 저장 api
    @GetMapping("/saveBooks/bookNew")
    public void BookNewApiToDb() {
        getBookNewService.repeatGet(2); // 한번에 최대 50개씩, 20번 실행
    }

    // BookNewSpecial 저장 api
    @GetMapping("/saveBooks/bookNewSpecial")
    public void BookNewSpecialApiToDb() {
        getBookNewSpecialService.repeatGet(5); // 한번에 최대 50개씩, 20번 실행
    }


}