package movlit.be.common.config;

import io.lettuce.core.RedisException;
import jakarta.annotation.PreDestroy;
import java.time.Duration;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.RedisSystemException;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.connection.stream.MapRecord;
import org.springframework.data.redis.stream.StreamMessageListenerContainer;
import org.springframework.data.redis.stream.StreamMessageListenerContainer.StreamMessageListenerContainerOptions;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class RedisStreamConfig {

    // 종료 상태 플래그 (shutdown 중인지 여부)
    private volatile boolean shuttingDown = false;

    @Bean
    public StreamMessageListenerContainer<String, MapRecord<String, String, String>> streamMessageListenerContainer(
            @Qualifier("redisConnectionFactory") RedisConnectionFactory redisConnectionFactory
    ) {
        log.info("redisconnectfactory {}", redisConnectionFactory);
        ThreadPoolTaskExecutor taskExecutor = new ThreadPoolTaskExecutor();
        taskExecutor.setCorePoolSize(8);
        taskExecutor.setMaxPoolSize(16);
        taskExecutor.setThreadNamePrefix("redis-stream-");
        taskExecutor.initialize();
        log.info("==== StreamMessageListenerContainer threadPoolExecutor : {} ", taskExecutor);

        StreamMessageListenerContainerOptions<String, MapRecord<String, String, String>> options = StreamMessageListenerContainerOptions
                .builder()
                .executor(taskExecutor)
                .batchSize(10)
                .pollTimeout(Duration.ofSeconds(1))
                .errorHandler(
                        e -> {
                            if (e instanceof RedisSystemException || e instanceof RedisException) {
                                log.debug("Ignored connection closed exception during shutdown: {}", e.getMessage());
                            } else {
                                log.error("Unexpected error in stream polling task", e);
                            }
                        })
                .build();

        StreamMessageListenerContainer<String, MapRecord<String, String, String>> container = StreamMessageListenerContainer.create(
                redisConnectionFactory, options);
        container.start();
        log.info("==== StreamMessageListenerContainer 빈 등록 : {}", container);
        return container;
    }

    @PreDestroy
    public void preDestroy() {
        // 애플리케이션 컨텍스트 종료 전에 shutdown 플래그를 true로 설정
        shuttingDown = true;
        log.info("RedisStreamConfig is shutting down. Setting shutdown flag to true.");
    }

}
