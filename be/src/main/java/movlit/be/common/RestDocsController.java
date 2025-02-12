package movlit.be.common;

import java.io.IOException;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class RestDocsController {

    @GetMapping("/api/docs")
    public ResponseEntity<Resource> getDocs() {
        // 정적 리소스 로드
        Resource resource = new ClassPathResource("static/docs/index.html");

        if (!resource.exists()) {
            return new ResponseEntity<>(HttpStatus.BAD_REQUEST);
        }

        // Content-Type 설정 (HTML 파일) 및 리소스 반환.
        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_HTML)
                .body(resource);
    }

}