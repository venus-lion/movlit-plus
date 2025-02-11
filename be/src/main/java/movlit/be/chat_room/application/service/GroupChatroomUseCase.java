package movlit.be.chat_room.application.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.TimeUnit;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.book.application.service.BookDetailReadService;
import movlit.be.book.application.service.BookHeartReadService;
import movlit.be.chat_room.application.convertor.ChatroomConvertor;
import movlit.be.chat_room.application.service.dto.GroupChatroomJoinedEvent;
import movlit.be.chat_room.application.service.dto.GroupChatroomLeftEvent;
import movlit.be.chat_room.application.service.dto.RequestDataForCreationWorker;
import movlit.be.chat_room.domain.GroupChatroom;
import movlit.be.chat_room.domain.MemberRChatroom;
import movlit.be.chat_room.domain.repository.GroupChatRepository;
import movlit.be.chat_room.presentation.dto.CheckJoinGroupChatroomRequest;
import movlit.be.chat_room.presentation.dto.GroupChatroomMemberResponse;
import movlit.be.chat_room.presentation.dto.GroupChatroomRequest;
import movlit.be.chat_room.presentation.dto.GroupChatroomResponse;
import movlit.be.chat_room.presentation.dto.GroupChatroomResponseDto;
import movlit.be.common.aspect.ExecutionTime;
import movlit.be.common.config.RedisNotificationPublisher;
import movlit.be.common.exception.ChatroomAccessDenied;
import movlit.be.common.exception.ChatroomNotFoundException;
import movlit.be.common.exception.GroupChatroomAlreadyExistsException;
import movlit.be.common.exception.GroupChatroomAlreadyJoinedException;
import movlit.be.common.exception.GroupChatroomNotFoundException;
import movlit.be.common.util.IdFactory;
import movlit.be.common.util.ids.BookId;
import movlit.be.common.util.ids.GroupChatroomId;
import movlit.be.common.util.ids.MemberId;
import movlit.be.member.application.service.MemberReadService;
import movlit.be.member.domain.entity.MemberEntity;
import movlit.be.movie.application.service.MovieReadService;
import movlit.be.movie_heart.application.service.MovieHeartService;
import movlit.be.pub_sub.notification.application.dto.NotificationDto;
import movlit.be.pub_sub.notification.application.service.NotificationService;
import movlit.be.pub_sub.notification.domain.NotificationMessage;
import movlit.be.pub_sub.notification.domain.NotificationType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class GroupChatroomUseCase {

    private final GroupChatRepository groupChatRepository;
    private final MemberReadService memberReadService;
    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private final GroupChatroomCreationWorker worker;
    private final ApplicationEventPublisher eventPublisher;
    private final MovieReadService movieReadService;
    private final MovieHeartService movieHeartService;
    private final BookDetailReadService bookDetailReadService;
    private final BookHeartReadService bookHeartReadService;

    private final RedisNotificationPublisher redisNotificationPublisher;
    private final NotificationService notificationService;

    // TODO: Const 분리
    private static final String CHATROOM_MEMBERS_KEY_PREFIX = "chatroom:";
    private static final String CHATROOM_MEMBERS_KEY_SUFFIX = ":members";
    private static final String GROUP_CHATROOM_QUEUE_KEY_PREFIX = "groupChatroomQueue:";
    private static final long CHATROOM_MEMBERS_CACHE_TTL = 60 * 60; // 1시간

    @Value("${share.url}")
    private String basicUrl;

    /**
     * 비동기적으로 최초 그룹 채팅 생성 로직을 요청한다.
     */
    @Transactional
    public GroupChatroomResponse requestCreateGroupChatroom(GroupChatroomRequest request, MemberId memberId) {
        String contentId = ChatroomConvertor.generateContentId(request.getContentType(),
                request.getContentId()); // MV_LongContentId 형태
        validateExistByContentId(contentId);

        // Redis Queue에 memberId를 value로 저장 (LPUSH)
        String queueKey = GROUP_CHATROOM_QUEUE_KEY_PREFIX + contentId;
        redisTemplate.opsForList().leftPush(queueKey, memberId.getValue());

        // Worker 스레드에게 작업 요청 및 결과 수신
        // 만약, 늦게 요청한 멤버들이라면 response는 null 데이터를 담고 있게 되는 거임
        Optional<Map<String, String>> responseOpt = worker.requestChatroomCreation(contentId);
        Map<String, String> response = getPureResponse(responseOpt);

        // Worker 스레드로부터 받은 contentId와 memberId로 채팅방 생성
        String workerContentId = response.keySet().iterator().next();
        MemberId workerMemberId = IdFactory.createMemberId(response.get(workerContentId));

        // 그룹 채팅방 생성
        GroupChatroomResponse createdChatroom = createGroupChatroom(
                RequestDataForCreationWorker.from(request.getRoomName(), workerContentId, workerMemberId));

        log.info("::GroupChatroomService_requestCreateGroupChatroom::");

//        // 트랜잭션 완료 후 알림 발송
//        TransactionSynchronizationManager.registerSynchronization(new CustomTransactionSynchronization() {
//            @Override
//            public void afterCommit() {
//                publishNewGroupChatroomNoti(contentId, request.getRoomName(), createdChatroom);
//            }
//        });

        publishNewGroupChatroomNoti(contentId, request.getRoomName(), createdChatroom);

        return createdChatroom;
    }

    /**
     * 찜한 콘텐츠에 대해 새로운 채팅방 생성됨을 알림
     */
    private void publishNewGroupChatroomNoti(String contentId, String roomName,
                                             GroupChatroomResponse createdChatroom) {
        log.info("::GroupChatroomService_publishNewGroupChatroomNoti::");

        // ContentId : MV_pureContentId 또는 BK_pureContentId -> 책과 영화 구분 필요
        String contentType = contentId.substring(0, 2);
        String pureContentId = contentId.substring(3);

        // 찜한 멤버 리스트
        List<MemberId> heartingMemberIds = new ArrayList<>();
        // 콘텐츠명 (영화 이름, 책 이름)
        String contentName = "";
        // 해당 콘텐츠의 상세페이지 url (채팅방 가입 유도)
        String url = basicUrl;

        if (contentType.equals("MV")) {
            Long movieId = Long.parseLong(pureContentId);
            contentName = movieReadService.fetchByMovieId(movieId).getTitle();
            heartingMemberIds = movieHeartService.fetchHeartingMemberIdsByMovieId(movieId);
            url += "/movie/" + pureContentId;
        } else if (contentType.equals("BK")) {
            BookId bookId = new BookId(pureContentId);
            String bookName = bookDetailReadService.fetchByBookId(bookId).getTitle();
            int index = bookName.indexOf(" -");
            if (index != -1) {
                contentName = bookName.substring(0, index); // "-"가 있으면 앞부분만 사용
            } else {
                contentName = bookName; // "-"가 없으면 전체 문자열 사용
            }
            heartingMemberIds =
                    bookHeartReadService.fetchHeartingMemberIdsByBookId(bookId);
            url += "/book/" + pureContentId;
        }

        // 멤버들에게 알림 발송
        if (!heartingMemberIds.isEmpty()) {
            for (MemberId heartigMemberId : heartingMemberIds) {
                log.info(">> 알림발송할 멤버 " + heartigMemberId.getValue());
                NotificationDto notification = new NotificationDto(
                        heartigMemberId.getValue(),
                        NotificationMessage.generateNewGroupChatroomNotiMessage(contentType, contentName, roomName),
                        NotificationType.CONTENT_HEART_CHATROOM,
                        url);
                // Notification Redis Publish (SSE 알림)
                redisNotificationPublisher.publishNotification(notification);
                // Notification MongoDB에 저장
                notificationService.saveNotification(notification);
            }
        }
    }

    private Map<String, String> getPureResponse(Optional<Map<String, String>> responseOpt) {
        if (responseOpt.isEmpty()) {
            throw new GroupChatroomAlreadyExistsException();
        }

        return responseOpt.get();
    }

    private void validateExistByContentId(String contentId) {
        if (groupChatRepository.existsByContentId(contentId)) {
            throw new GroupChatroomAlreadyExistsException();
        }
    }

    /**
     * 최초 그룹 채팅 생성 후 참여한다
     */
    @Transactional
    public GroupChatroomResponse createGroupChatroom(RequestDataForCreationWorker data) {
        GroupChatroom groupChatroom = ChatroomConvertor.makeNonReGroupChatroom(data);
        MemberRChatroom memberRChatroom = ChatroomConvertor.makeNonReMemberRChatroom();

        MemberEntity member = memberReadService.fetchEntityByMemberId(data.getWorkerMemberId());

        memberRChatroom.updateGroupChatRoom(groupChatroom);
        memberRChatroom.updateMember(member);
        groupChatroom.updateMemberRChatroom(memberRChatroom); // 그룹 채팅방에 멤버를 참여시킨다

        return groupChatRepository.create(groupChatroom);
    }

    // 존재하는 그룹채팅방 가입
    @Transactional
    public GroupChatroomResponse joinGroupChatroom(GroupChatroomId groupChatroomId, MemberId memberId)
            throws ChatroomAccessDenied {
        GroupChatroom existingGroupChatroom = groupChatRepository.findByChatroomId(groupChatroomId);
        validateAlreadyJoined(memberId, existingGroupChatroom);
        MemberEntity member = memberReadService.fetchEntityByMemberId(memberId);

        log.info("::GroupChatroomService_joinGroupChatroom::");
        log.info(">> member : " + member.toString());
        log.info(">> groupChat to join : " + existingGroupChatroom.toString());

        if (existingGroupChatroom != null && member != null) {
            // 관계테이블 row 생성 (row id 및 regDt생성)
            MemberRChatroom newMemberRChatroom = ChatroomConvertor.makeNonReMemberRChatroom();

            // 만든 관계 row에 member 정보 update
            newMemberRChatroom.updateMember(member);
            // 만든 관계 row에 chatroom 정보 update
            newMemberRChatroom.updateGroupChatRoom(existingGroupChatroom);
            log.info(">> newMemberRChatroom : " + newMemberRChatroom.toString());

            // 기존 채팅방에 새롭게 생성된 관계정보(memberRChatroom : 멤버-채팅방 관계) update
            existingGroupChatroom.updateMemberRChatroom(newMemberRChatroom);
            log.info(">> updated groupChat : " + existingGroupChatroom.toString());

        } else if (existingGroupChatroom == null && member != null) {
            throw new ChatroomNotFoundException();

        } else {
            throw new ChatroomAccessDenied();
        }

        // 바뀐 정보 업데이트
        GroupChatroomResponse response = groupChatRepository.create(existingGroupChatroom);

        // 그룹채팅방 가입 이벤트 발행
        log.info("GroupChatroomService :: GroupChatroomJoinedEvent 발행...");
        eventPublisher.publishEvent(new GroupChatroomJoinedEvent(groupChatroomId, memberId));

        return response;
    }

    private void validateAlreadyJoined(MemberId memberId, GroupChatroom existingGroupChatroom) {
        if (existingGroupChatroom.getMemberRChatroom().stream()
                .anyMatch(rChatroom -> rChatroom.getMember().getMemberId().equals(memberId))) {
            throw new GroupChatroomAlreadyJoinedException();
        }
    }

    // 특정 그룹채팅 안 멤버 정보 update (멤버 정보 redis 1차 캐시)
    @ExecutionTime
    public List<GroupChatroomMemberResponse> fetchMembersInGroupChatroom(GroupChatroomId groupChatroomId,
                                                                         boolean useCache) {
        // 파라미터 추가 (캐싱 on/off)
        String cacheKey = CHATROOM_MEMBERS_KEY_PREFIX + groupChatroomId + CHATROOM_MEMBERS_KEY_SUFFIX;

        try {
            if (useCache) { // 캐시 사용
                // Redis에서 캐시된 데이터 조회 (JSON 문자열)
                String cachedJson = (String) redisTemplate.opsForValue().get(cacheKey);
                List<GroupChatroomMemberResponse> response;

                if (cachedJson != null) {
                    log.info("Cache hit for chatroom: {}", groupChatroomId);

                    // JSON 문자열을 List<GroupChatroomMemberResponse>로 역직렬화
                    response = objectMapper.readValue(cachedJson, new TypeReference<>() {
                    });
                    return response;
                }
            }

            log.info("Cache miss for chatroom: {}", groupChatroomId);

            // 캐시에 데이터가 없으면 DB에서 조회
            // 채팅방 존재 여부 확인
            groupChatRepository.findByChatroomId(groupChatroomId);

            // 멤버 정보 조회
            List<GroupChatroomMemberResponse> response = groupChatRepository.findMembersByChatroomId(groupChatroomId);

            // 조회 결과를 JSON 문자열로 변환하여 Redis에 캐싱
            updateCachedMembers(groupChatroomId, response);

            return response;
        } catch (Exception e) {
            log.error("Error while fetching members from chatroom: {}", groupChatroomId, e);
            // 예외 처리 로직 추가 (예: 빈 리스트 반환 또는 예외 다시 던지기)
            return new ArrayList<>();
        }
    }

    // 캐시 업데이트 메서드 추가
    public void updateCachedMembers(GroupChatroomId groupChatroomId, List<GroupChatroomMemberResponse> members) {
        String cacheKey = CHATROOM_MEMBERS_KEY_PREFIX + groupChatroomId + CHATROOM_MEMBERS_KEY_SUFFIX;

        try {
            String json = objectMapper.writeValueAsString(members);
            redisTemplate.opsForValue().set(cacheKey, json, CHATROOM_MEMBERS_CACHE_TTL, TimeUnit.SECONDS);
            log.info("Cache updated for chatroom: {}", groupChatroomId);
        } catch (JsonProcessingException e) {
            log.error("Error while updating cache for chatroom: {}", groupChatroomId, e);
        }
    }

    // 그룹채팅방 나가기
    @Transactional
    public void leaveGroupChatroom(GroupChatroomId groupchatroomId, MemberId memberId) {
        GroupChatroom groupChatroom = groupChatRepository.findByChatroomId(groupchatroomId);
        //  MemberEntity member = memberReadService.findEntityById(memberId);

        // 그룹채팅방에 참여중인 멤버목록에서 해당 멤버를 찾아 제거하기
        // memberRChatroom에서 memberId와 groupChatroomId가 모두 일치하는 row를 찾아 제거
        groupChatroom.getMemberRChatroom().removeIf(memberRChatroom ->
                memberRChatroom.getMember().getMemberId().equals(memberId) &&
                        memberRChatroom.getGroupChatroom().getGroupChatroomId().equals(groupchatroomId)
        );

        // 변경사항을 저장할 것
        groupChatRepository.create(groupChatroom); // 변경 사항 저장

        // 그룹채팅방 나가기 이벤트 발행
        log.info("GrouopChatroomService >>> GroupChatroomLeftEvent 발행 ...");
        eventPublisher.publishEvent(new GroupChatroomLeftEvent(groupchatroomId, memberId));

    }

}