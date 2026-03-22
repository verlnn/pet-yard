package io.pet.petyard.user.adapter.out.persistence;

import io.pet.petyard.user.domain.model.UserProfileSettings;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface UserProfileSettingsRepository extends JpaRepository<UserProfileSettings, Long> {
    Optional<UserProfileSettings> findByUserId(Long userId);
}
