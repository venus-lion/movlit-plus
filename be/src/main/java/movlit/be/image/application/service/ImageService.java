package movlit.be.image.application.service;

import lombok.RequiredArgsConstructor;
import movlit.be.chatRoom.application.service.dto.ProfileImageUpdatedEvent;
import movlit.be.common.util.ids.MemberId;
import movlit.be.image.application.convertor.ImageConvertor;
import movlit.be.image.domain.entity.ImageEntity;
import movlit.be.image.domain.repository.ImageRepository;
import movlit.be.image.presentation.dto.response.ImageResponse;
import movlit.be.member.domain.entity.MemberEntity;
import movlit.be.member.domain.repository.MemberRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
@Transactional
public class ImageService {

    private final ImageRepository imageRepository;
    private final S3Service s3Service;
    private final MemberRepository memberRepository;

    private final ApplicationEventPublisher eventPublisher;

    @Value("${aws.s3.bucket.folderName}")
    private String folderName;

    public ImageResponse uploadProfileImage(MemberId memberId, MultipartFile file) {
        ImageEntity imageEntity = ImageConvertor.toImageEntity(s3Service.uploadImage(file, folderName), memberId);
        validateMemberExistsInImage(memberId);
        ImageEntity savedImageEntity = imageRepository.upload(imageEntity);
        // 멤버 정보 update
        MemberEntity member = memberRepository.findEntityById(memberId);
        member.updateProfileImgUrl(savedImageEntity.getUrl());
        memberRepository.saveEntity(member);

        // 프로필 업데이트 이후, 업데이트 이벤트 발행
        eventPublisher.publishEvent(new ProfileImageUpdatedEvent(memberId));
        return new ImageResponse(savedImageEntity.getImageId(), savedImageEntity.getUrl());
    }

    private void validateMemberExistsInImage(MemberId memberId) {
        if (imageRepository.existsByMemberId(memberId)) {
            imageRepository.deleteByMemberId(memberId);
        }
    }

    public ImageResponse fetchProfileImage(MemberId memberId) {
        return imageRepository.fetchProfileImageByMemberId(memberId);
    }

}
