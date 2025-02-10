package movlit.be.chat_room.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Duration;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.chat_room.application.convertor.ChatroomConvertor;
import movlit.be.chat_room.domain.MemberROneononeChatroom;
import movlit.be.chat_room.domain.OneononeChatroom;
import movlit.be.chat_room.domain.repository.OneononeChatroomRepository;
import movlit.be.chat_room.presentation.dto.OneononeChatroomCreatePubDto;
import movlit.be.chat_room.presentation.dto.OneononeChatroomCreatePubRequest;
import movlit.be.chat_room.presentation.dto.OneononeChatroomRequest;
import movlit.be.chat_room.presentation.dto.OneononeChatroomResponse;
import movlit.be.common.config.RedisMessagePublisher;
import movlit.be.common.exception.FailedDeserializeException;
import movlit.be.common.exception.MemberNotFoundException;
import movlit.be.common.exception.OneOnOneChatroomAlreadyExistsException;
import movlit.be.common.util.IdFactory;
import movlit.be.common.util.ids.MemberId;
import movlit.be.common.util.ids.OneononeChatroomId;
import movlit.be.member.application.service.MemberReadService;
import movlit.be.member.domain.entity.MemberEntity;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class OneononeChatroomService {

    private final MemberReadService memberReadService;
    private final OneononeChatroomRepository oneOnOneChatroomRepository;
    private final RedisTemplate<String, String> redisTemplate;
    private final ObjectMapper objectMapper;
    private final RedisMessagePublisher messagePublisher;

    @Transactional
    public OneononeChatroomResponse createOneOnOneChatroom(MemberId memberId,
                                                           OneononeChatroomRequest request) {
        MemberEntity sender = memberReadService.findEntityByMemberId(memberId);
        MemberEntity receiver = memberReadService.findEntityByMemberId(request.getReceiverId());

        validateAlreadyExist(sender, receiver);

        OneononeChatroom oneononeChatroom = new OneononeChatroom(IdFactory.createOneOnOneChatroomId());
        injectOneOnOneChatroom(oneononeChatroom, sender);
        injectOneOnOneChatroom(oneononeChatroom, receiver);

        OneononeChatroom savedOneononeChatroom = oneOnOneChatroomRepository.create(oneononeChatroom);
        OneononeChatroomResponse senderResponse = makeOneOnOneChatroomResponse(savedOneononeChatroom, receiver);
        OneononeChatroomResponse receiverResponse = makeOneOnOneChatroomResponse(savedOneononeChatroom, sender);

        // Redis에 채팅방 추가
        this.addOneOnOneChatroomToRedis(sender, senderResponse);
        this.addOneOnOneChatroomToRedis(receiver, receiverResponse);

        return senderResponse;
    }

    public void publishOneOnOneChatroomCreate(MemberId topicSenderId, OneononeChatroomCreatePubRequest request) {
        MemberEntity topicSender = memberReadService.findEntityByMemberId(topicSenderId);
        OneononeChatroomCreatePubDto oneononeChatroomCreatePubDto = ChatroomConvertor.makeOneononeChatroomCreatePubDto(
                topicSenderId, request, topicSender
        );
        messagePublisher.createOneononeChatroom(oneononeChatroomCreatePubDto);
    }

    private void validateAlreadyExist(MemberEntity sender, MemberEntity receiver) {
        if (oneOnOneChatroomRepository.existsOneOnOneChatroomBySenderAndReceiver(
                sender.getMemberId(),
                receiver.getMemberId())
        ) {
            throw new OneOnOneChatroomAlreadyExistsException();
        }
    }

    private static OneononeChatroomResponse makeOneOnOneChatroomResponse(OneononeChatroom savedOneononeChatroom,
                                                                         MemberEntity receiver) {
        return new OneononeChatroomResponse(
                savedOneononeChatroom.getOneononeChatroomId(),
                receiver.getMemberId(),
                receiver.getNickname(),
                receiver.getProfileImgUrl()
        );
    }

    private static void injectOneOnOneChatroom(OneononeChatroom oneononeChatroom, MemberEntity sender) {
        MemberROneononeChatroom senderChatroom =
                new MemberROneononeChatroom(IdFactory.createMemberROneOnOneChatroomId());
        senderChatroom.updateOneononeChatroom(oneononeChatroom);
        senderChatroom.updateMember(sender);
        oneononeChatroom.updateMemberROneononeChatroom(senderChatroom);
    }

    public OneononeChatroomResponse fetchChatroomInfo(OneononeChatroomId roomId, MemberId currentMemberId) {
        MemberEntity otherMember = oneOnOneChatroomRepository.findWithMembersById(roomId)
                .stream()
                .filter(mro -> !mro.getMember().getMemberId().equals(currentMemberId))
                .findFirst()
                .orElseThrow(MemberNotFoundException::new)
                .getMember();
        return new OneononeChatroomResponse(
                roomId,
                otherMember.getMemberId(),
                otherMember.getNickname(),
                otherMember.getProfileImgUrl()
        );
    }

    public List<OneononeChatroomResponse> fetchMyOneOnOneChatList(MemberId memberId) {

        String redisKey = "oneononeChatList:" + memberId.getValue();

        // Redis에서 채팅방 목록 조회
        List<String> cachedData = redisTemplate.opsForList().range(redisKey, 0, -1);

        if (!Objects.requireNonNull(cachedData).isEmpty()) {
            return makeOneOnOneChatroomResponseList(cachedData);
        }

        // Redis에 데이터가 없으면 DB에서 조회 후 캐싱
        List<OneononeChatroomResponse> response = oneOnOneChatroomRepository.fetchOneOnOneChatList(memberId);

        // Redis에 채팅방 목록 캐시
        cacheOneOnOneChatroomList(response, redisKey);

        return response;
    }

    private void cacheOneOnOneChatroomList(List<OneononeChatroomResponse> response, String redisKey) {
        response.forEach(chatroom -> {
            String serializedChatroom = this.serializeChatroomResponse(chatroom);
            redisTemplate.opsForList().rightPush(redisKey, serializedChatroom);
        });
    }

    private List<OneononeChatroomResponse> makeOneOnOneChatroomResponseList(List<String> cachedData) {
        List<OneononeChatroomResponse> list = cachedData.stream()
                .map(this::deserializeChatroomResponse)
                .toList();
        log.info("=== cash Hit : {}", list);
        return list;
    }

    private void addOneOnOneChatroomToRedis(MemberEntity memberEntity, OneononeChatroomResponse response) {
        String redisKey = "oneOnOneChatList:" + memberEntity.getMemberId().getValue();
        String serializedChatroom = this.serializeChatroomResponse(response);

        // Redis 리스트에 채팅방 추가
        redisTemplate.opsForList().rightPush(redisKey, serializedChatroom);
        // TTL 설정 (1시간)
        redisTemplate.expire(redisKey, Duration.ofHours(1));
    }

    // OneononeChatroomResponse 직렬화
    private String serializeChatroomResponse(OneononeChatroomResponse response) {
        try {
            return objectMapper.writeValueAsString(response);
        } catch (JsonProcessingException e) {
            throw new RuntimeException("Failed to serialize chatroom response", e);
        }
    }

    // OneononeChatroomResponse 역직렬화
    private OneononeChatroomResponse deserializeChatroomResponse(String data) {
        try {
            return objectMapper.readValue(data, OneononeChatroomResponse.class);
        } catch (JsonProcessingException e) {
            throw new FailedDeserializeException();
        }
    }

}