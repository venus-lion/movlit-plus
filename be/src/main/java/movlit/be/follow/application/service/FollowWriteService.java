package movlit.be.follow.application.service;

import lombok.RequiredArgsConstructor;
import movlit.be.common.exception.FollowSelfNotAllowedException;
import movlit.be.common.util.IdFactory;
import movlit.be.common.util.ids.MemberId;
import movlit.be.follow.domain.Follow;
import movlit.be.follow.infra.persistence.FollowRepository;
import movlit.be.member.application.service.MemberReadService;
import movlit.be.member.domain.entity.MemberEntity;
import movlit.be.pub_sub.RedisNotificationPublisher;
import movlit.be.pub_sub.notification.NotificationDto;
import movlit.be.pub_sub.notification.NotificationMessage;
import movlit.be.pub_sub.notification.NotificationService;
import movlit.be.pub_sub.notification.NotificationType;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class FollowWriteService {

    private final FollowRepository followRepository;
    private final MemberReadService memberReadService;
    private final RedisNotificationPublisher redisNotificationPublisher;
    private final NotificationService notificationService;

    @Value("${share.url}")
    private String basicUrl;

    @Transactional
    public Follow memberFollow(
            MemberId followerId,
            MemberId followeeId
    ) {
        if (followerId.equals(followeeId)) {
            throw new FollowSelfNotAllowedException();
        }

        // 이미 팔로우한 경우 예외처리
        followRepository.existsByFollowerIdAndFolloweeId(followerId, followeeId);

        Follow savedFollow = register(followerId, followeeId);

        // 팔로우 알림 발행
        publishFollowNotification(savedFollow.getFollower(), savedFollow.getFollowee());

        return savedFollow;
    }

    @Transactional
    public void memberUnFollow(
            MemberId followerId,
            MemberId followeeId
    ) {
        // 언팔로우를 시도했는데, 팔로우 관계가 존재하지 않는다면 예외 처리
        Follow follow = followRepository.findByFollowerIdAndFolloweeId(followerId, followeeId);

        followRepository.delete(follow);
    }

    public Follow register(
            MemberId followerId,
            MemberId followeeId
    ) {
        MemberEntity follower = memberReadService.findEntityById(followerId);
        MemberEntity followee = memberReadService.findEntityById(followeeId);

        Follow follow = Follow.builder()
                .followId(IdFactory.createFollowId())
                .follower(follower)
                .followee(followee)
                .build();

        return followRepository.save(follow);
    }

    // 팔로우 알림 생성 및 발행
    public void publishFollowNotification(MemberEntity follower, MemberEntity followee) {
        // 알림 메세지 생성 : 'A'님이 'B'님을 팔로우합니다.
        String message = NotificationMessage.generateFollowingMessage(follower.getNickname(), followee.getNickname());
        String memberId = followee.getMemberId().getValue();
        // 나를 팔로우한 사람(상대방)의 '마이페이지'로 이동
        String url = basicUrl + "/members/" + follower.getMemberId().getValue();

        // 알림 DTO 생성
        NotificationDto notificationDto = new NotificationDto(
                memberId, // 알림을 받는 대상은, 팔로잉을 당한 사람 ('B')
                message,
                NotificationType.FOLLOW,
                url
        );

        // Redis를 통해 알림 발행
        redisNotificationPublisher.publishNotification(notificationDto);
        // Notification MongoDB에 저장
        notificationService.saveNotification(notificationDto);
    }

}
