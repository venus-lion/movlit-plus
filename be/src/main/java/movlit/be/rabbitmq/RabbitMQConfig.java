package movlit.be.rabbitmq;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {
    public static final String EXCHANGE_NAME = "chat.exchange";
    public static final String QUEUE_NAME = "chat.queue";
    public static final String ROUTING_KEY = "chat.message";

    /**
     * RabbitMQ 연결, 교환기(exchange), 큐(queue), 바인딩(binding)을 설정
     * Exchange : 메시지를 라우팅할 토대. 여기서는 토픽 교환기 (topic exchange)를 사용
     * Queue : 메시지가 소비될 대기열
     * Binding : 교환기와 큐를 연결하고, 라우팅 키를 설정.
     */
    @Bean
    public Exchange chatExchange() {
        return ExchangeBuilder.topicExchange(EXCHANGE_NAME).durable(true).build();
    }

    @Bean
    public Queue chatQueue() {
        return QueueBuilder.durable(QUEUE_NAME).build();
    }

    @Bean
    public Binding chatBinding(Queue chatQueue, Exchange chatExchange) {
        return BindingBuilder.bind(chatQueue).to(chatExchange).with(ROUTING_KEY).noargs();
    }

    @Bean
    public MessageConverter jacksonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory, MessageConverter jacksonMessageConverter) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jacksonMessageConverter);
        return template;
    }
}
