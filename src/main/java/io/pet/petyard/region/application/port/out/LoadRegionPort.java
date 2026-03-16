package io.pet.petyard.region.application.port.out;

import io.pet.petyard.region.domain.model.Region;

import java.util.Optional;

public interface LoadRegionPort {
    Optional<Region> findByCode(String code);
}
