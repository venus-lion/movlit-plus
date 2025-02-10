package movlit.be.follow.presentation;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import movlit.be.auth.application.service.MyMemberDetails;
import movlit.be.common.util.ids.MemberId;
import movlit.be.follow.application.service.FollowReadService;
import movlit.be.follow.application.service.FollowWriteService;
import movlit.be.follow.presentation.dto.FollowResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/follows")
@RequiredArgsConstructor
@Slf4j
public class FollowController {

    private final FollowWriteService followWriteService;
    private final FollowReadService followReadService;

    // 팔로우 기능
    // 로그인한 유저(@AuthenticationPrincipal)가, URL에 있던 memberId를 팔로우한다.
    @PostMapping("/{followeeId}/follow")
    public ResponseEntity<String> memberFollow(
            @AuthenticationPrincipal MyMemberDetails details, // 현재 로그인한 사용자 정보
            @PathVariable MemberId followeeId // 팔로우할 대상 사용자 ID

    ) {
        MemberId followerId = null;
        if (details != null) {
            followerId = details.getMemberId();
        }
        followWriteService.memberFollow(followerId, followeeId);

        return ResponseEntity.status(HttpStatus.OK).body("팔로우가 완료되었습니다.");
    }

    // 언팔로우 기능
    @DeleteMapping("/{followeeId}/follow")
    public ResponseEntity<String> memberUnFollow(
            @AuthenticationPrincipal MyMemberDetails details, // 현재 로그인한 사용자 정보
            @PathVariable MemberId followeeId // 언팔로우 대상 사용자 ID
    ) {
        MemberId followerId = null;
        if (details != null) {
            followerId = details.getMemberId();
        }
        followWriteService.memberUnFollow(followerId, followeeId);

        return ResponseEntity.status(HttpStatus.OK).body("언팔로우가 완료되었습니다.");
    }

    // 나를 팔로우하는 사람들, 내 팔로워 목록 조회
    @GetMapping("/my/follow/details")
    public ResponseEntity<List<FollowResponse>> getMyFollowerDetail(
            @AuthenticationPrincipal MyMemberDetails details // 현재 로그인한 사용자 정보
    ) {
        MemberId loginId = null;
        if (details != null) {
            loginId = details.getMemberId();
        }
        List<FollowResponse> followResponseList = followReadService.getMyFollowersDetails(loginId);

        return ResponseEntity.status(HttpStatus.OK).body(followResponseList);
    }

    // 내가 팔로우하는 사람들, 내 팔로우 목록 조회
    @GetMapping("/my/following/details")
    public ResponseEntity<List<FollowResponse>> getMyFollowingDetail(
            @AuthenticationPrincipal MyMemberDetails details // 현재 로그인한 사용자 정보
    ) {
        MemberId loginId = null;
        if (details != null) {
            loginId = details.getMemberId();
        }
        List<FollowResponse> followResponseList = followReadService.getMyFollowingDetail(loginId);

        return ResponseEntity.status(HttpStatus.OK).body(followResponseList);
    }

    // 나를 팔로우하는 사람들, 내 팔로워 목록 조회
    @GetMapping("/{memberId}/follow/details")
    public ResponseEntity<List<FollowResponse>> getFollowerDetail(
            @PathVariable MemberId memberId
    ) {
        List<FollowResponse> followResponseList = followReadService.getMyFollowersDetails(memberId);
        return ResponseEntity.status(HttpStatus.OK).body(followResponseList);
    }

    // 내가 팔로우하는 사람들, 내 팔로우 목록 조회
    @GetMapping("/{memberId}/following/details")
    public ResponseEntity<List<FollowResponse>> getFollowingDetail(
            @PathVariable MemberId memberId
    ) {
        List<FollowResponse> followResponseList = followReadService.getMyFollowingDetail(memberId);
        return ResponseEntity.status(HttpStatus.OK).body(followResponseList);
    }

    // 나를 팔로우하는 사람들(팔로워) 개수 조회 - 내 팔로워 개수
    @GetMapping("/{memberId}/followers/count")
    public ResponseEntity<Integer> getMyFollowerCount(
            @PathVariable MemberId memberId
    ) {
        Integer followerCount = followReadService.getFollowerCount(memberId);
        return ResponseEntity.status(HttpStatus.OK).body(followerCount);
    }

    // 내가 팔로우하는 사람들(팔로우) 개수 조회 - 내 팔로우 개수
    @GetMapping("/{memberId}/follows/count")
    public ResponseEntity<Integer> getMyFollowCount(
            @PathVariable MemberId memberId
    ) {
        int followCount = followReadService.getFollowCount(memberId);

        return ResponseEntity.status(HttpStatus.OK).body(followCount);
    }

    // 특정 사용자를 팔로우하고 있는지 여부 확인
    // 로그인한 유저(MyMemberDetails)가, 특정 사용자(pathvariable)를 팔로우하는지 여부 체크 api
    @GetMapping("/check/{otherMemberId}")
    public ResponseEntity<Map<String, Boolean>> checkFollowing(
            @AuthenticationPrincipal MyMemberDetails details,
            @PathVariable MemberId otherMemberId
    ) {
        MemberId loginId = null;
        if (details != null) {
            loginId = details.getMemberId();
        }
        boolean isFollowing = followReadService.isFollowing(loginId, otherMemberId);

        Map<String, Boolean> response = new HashMap<>();
        response.put("following", isFollowing);

        return ResponseEntity.status(HttpStatus.OK).body(response);
    }

}
