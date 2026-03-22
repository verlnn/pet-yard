package io.pet.petyard.user.application.port.out;

public interface SaveGuardianRegistrationPort {
    void save(Long guardianUserId, Long targetUserId);
}
