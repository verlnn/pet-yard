package io.pet.petyard.user.application.port.out;

public interface DeleteGuardianRegistrationPort {
    void delete(Long guardianUserId, Long targetUserId);
}
