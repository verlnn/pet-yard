package io.pet.petyard.user.application.port.out;

public interface DeleteGuardianRegistrationPort {
    void delete(Long userId, Long otherUserId);
}
