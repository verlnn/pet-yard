package io.pet.petyard.pet.adapter.out.persistence;

import io.pet.petyard.pet.domain.model.PetProfile;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

public interface PetProfileRepository extends JpaRepository<PetProfile, Long> {
    List<PetProfile> findByUserId(Long userId);
    Optional<PetProfile> findByIdAndUserId(Long id, Long userId);
    void deleteByUserIdIn(Collection<Long> userIds);
}
