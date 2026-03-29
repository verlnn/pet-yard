package io.pet.petyard.user.application.port.in;

public interface UpdateAccountPrivacyUseCase {

    /**
     * 계정 공개/비공개 설정을 변경합니다.
     *
     * @param userId    설정을 변경할 사용자 ID
     * @param isPrivate true이면 비공개, false이면 공개
     */
    void updatePrivacy(Long userId, boolean isPrivate);
}
