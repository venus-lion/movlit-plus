package movlit.be.common.exception;

import static movlit.be.common.exception.ErrorMessage.INVALID_INPUT_VALUE;
import static org.springframework.http.HttpStatus.BAD_REQUEST;
import static org.springframework.http.HttpStatus.CONFLICT;
import static org.springframework.http.HttpStatus.NOT_FOUND;
import static org.springframework.http.HttpStatus.UNAUTHORIZED;

import java.util.Map;
import java.util.stream.Collectors;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.validation.ObjectError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestValueException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MultipartException;

@Slf4j
@RestControllerAdvice
public class CustomExceptionHandler {

    @ExceptionHandler(OneOnOneChatroomAlreadyExistsException.class)
    public ResponseEntity<ErrorResponse> handleOneOnOneChatroomAlreadyExists(
            OneOnOneChatroomAlreadyExistsException ex) {
        ErrorResponse errorResponse = new ErrorResponse(ErrorMessage.ONEONONE_CHATROOM_ALREADY_EXISTS.getMessage(),
                ErrorMessage.ONEONONE_CHATROOM_ALREADY_EXISTS.getCode());
        return new ResponseEntity<>(errorResponse, CONFLICT);
    }


    private static Map<String, String> getErrors(MethodArgumentNotValidException e) {
        return e.getBindingResult()
                .getAllErrors()
                .stream()
                .filter(ObjectError.class::isInstance)
                .collect(Collectors.toMap(
                        error -> error instanceof FieldError ? ((FieldError) error).getField() : error.getObjectName(),
                        ObjectError::getDefaultMessage,
                        (msg1, msg2) -> msg1 + ";" + msg2
                ));
    }

}
