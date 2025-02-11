package movlit.be.ChatMessage.application.service;

import static org.assertj.core.api.Assertions.assertThatCode;
import static org.mockito.Mockito.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.LocalDateTime;
import java.util.Map;
import movlit.be.acceptance.AcceptanceTest;
import movlit.be.pub_sub.chat_message.application.service.ChatMessageService;
import movlit.be.pub_sub.chat_message.infra.persistence.ChatMessageRepository;
import movlit.be.pub_sub.chat_message.presentation.dto.response.ChatMessageDto;
import movlit.be.pub_sub.chat_message.presentation.dto.response.MessageType;
import movlit.be.chat_room.application.service.GroupChatroomUseCase;
import movlit.be.chat_room.application.service.OneononeChatroomService;
import movlit.be.chat_room.presentation.dto.OneononeChatroomResponse;
import movlit.be.common.config.RedisMessagePublisher;
import movlit.be.common.config.RedisNotificationPublisher;
import movlit.be.common.util.ids.MemberId;
import movlit.be.common.util.ids.OneononeChatroomId;
import movlit.be.member.application.service.MemberReadService;
import movlit.be.member.domain.Member;
import movlit.be.pub_sub.notification.application.dto.NotificationDto;
import movlit.be.pub_sub.notification.application.service.NotificationService;
import movlit.be.pub_sub.notification.application.service.NotificationUseCase;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.springframework.data.redis.connection.stream.RecordId;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.StreamOperations;

public class ChatMessageServiceTest extends AcceptanceTest {

    @InjectMocks
    private ChatMessageService chatMessageService;

    @Mock
    private ChatMessageRepository chatMessageRepository;

    @Mock
    private RedisTemplate<String, Object> redisTemplate;

    @Mock
    private StreamOperations<String, Object, Object> streamOperations;

    @Mock
    private RedisMessagePublisher messagePublisher;

    @Mock
    private NotificationUseCase notificationUsecase;

    @Mock
    private NotificationService notificationService;

    @Mock
    private RedisNotificationPublisher redisNotificationPublisher;

    @Mock
    private OneononeChatroomService oneononeChatroomService;

    @Mock
    private MemberReadService memberReadService;

    @Mock
    private GroupChatroomUseCase groupChatroomUseCase;

    private ChatMessageDto testMessageDto;
    private ChatMessageDto testMessageDto2;

    @BeforeEach
    void setup() {
        // ChatMessageDto Mock
        testMessageDto = new ChatMessageDto(
                "roomId",
                new MemberId("member1"),
                "Hello world",
                LocalDateTime.now().toString()
        );

        testMessageDto2 = new ChatMessageDto(
                "roomId2",
                new MemberId("member2"),
                "Hello world",
                LocalDateTime.now().toString()
        );

        when(redisTemplate.opsForStream()).thenReturn(streamOperations);

        // Redis Stream Mock
        RecordId mockRecordId = mock(RecordId.class);
        when(streamOperations.add(any(), any(Map.class))).thenReturn(mockRecordId);

        //
        OneononeChatroomResponse mockRoomInfo = new OneononeChatroomResponse(
                new OneononeChatroomId("roomId2"),
                new MemberId("member1"),
                "테스터1",
                null
        );
        when(oneononeChatroomService.fetchChatroomInfo(mockRoomInfo.getRoomId(),
                testMessageDto2.getSenderId())).thenReturn(mockRoomInfo);
        Member mockMember = mock(Member.class);
        when(memberReadService.fetchByMemberId(testMessageDto2.getSenderId())).thenReturn(mockMember);
        when(mockMember.getNickname()).thenReturn("테스터2");
    }

    @Test
    @DisplayName("sendMessageForGroup 실행 시 메시지가 정상 처리된다.")
    void sendMessageForGroupTest() {
        // Given
        testMessageDto.setMessageType(MessageType.GROUP);

        // When
        chatMessageService.sendMessageForGroup(testMessageDto);

        // Then
        // Redis Stream에 정상적으로 메시지가 추가된다.
        verify(streamOperations, times(1)).add(any(), any(Map.class));

        // Redis Pub/Sub을 통해 메시지가 정상적으로 발행된다.
        verify(messagePublisher, times(1)).sendMessage(testMessageDto);

        // 알림 서비스가 정상적으로 호출된다.
        verify(notificationUsecase, times(1)).groupChatroomMessageNotification(testMessageDto);
    }

    @Test
    @DisplayName("sendMessageForOneOnOne 실행 시 메시지가 정상 처리된다.")
    void sendMessageForOneOnOneTest() {
        // Given
        testMessageDto2.setMessageType(MessageType.ONE_ON_ONE);

        // When
        chatMessageService.sendMessageForOneOnOne(testMessageDto2);

        // Then
        verify(streamOperations, times(1)).add(any(), any(Map.class)); // Redis Stream 추가 확인
        verify(messagePublisher, times(1)).sendMessage(testMessageDto2); // 메시지 발행 확인
        verify(notificationService, times(1)).saveNotification(any(NotificationDto.class)); // 알림 저장 확인
    }

    @Test
    @DisplayName("produceChatMessage 실행 시 Redis Stream에 메시지가 추가되고 예외 발생하지 않는다.")
    void produceChatMessageTest() {
        // Given
        RecordId mockRecordId = mock(RecordId.class);
        when(streamOperations.add(any(), any(Map.class))).thenReturn(mockRecordId);

        // When,Then 예외가 발생하지 않는지 확인
        assertThatCode(() -> chatMessageService.sendMessageForGroup(testMessageDto))
                .doesNotThrowAnyException();

        // Redis Stream에 메시지가 정상적으로 추가되었는지 검증
        verify(streamOperations, times(1)).add(any(), any(Map.class));
    }

}
