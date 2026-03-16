package io.pet.petyard.region.adapter.out.persistence;

import io.pet.petyard.region.domain.model.Region;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RegionRepository extends JpaRepository<Region, String> {
}
