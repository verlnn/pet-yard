package io.pet.petyard.user.adapter.out.persistence;

import io.pet.petyard.user.domain.model.UserProfile;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    boolean existsByNickname(String nickname);
    Optional<UserProfile> findByUserId(Long userId);
}
