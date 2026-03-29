package io.pet.petyard.user.application.port.in;

public interface GetPublicUserProfileUseCase {

    /**
     * 뷰어가 대상 사용자의 비공개 콘텐츠(집사 목록 등)를 볼 수 있는지 확인합니다.
     * <ul>
     *   <li>공개 계정이면 항상 true</li>
     *   <li>본인 계정이면 항상 true</li>
     *   <li>비공개 계정이면 ACCEPTED 집사 관계인 경우에만 true</li>
     * </ul>
     *
     * @param viewerId   조회 요청자의 userId (비로그인 시 null)
     * @param targetUserId 대상 사용자의 userId
     */
    boolean canViewContent(Long viewerId, Long targetUserId);
}
