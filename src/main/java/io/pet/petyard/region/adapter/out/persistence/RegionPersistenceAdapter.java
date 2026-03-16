package io.pet.petyard.region.adapter.out.persistence;

import io.pet.petyard.region.application.port.out.LoadRegionPort;
import io.pet.petyard.region.domain.model.Region;

import java.util.Optional;

import org.springframework.stereotype.Component;

@Component
public class RegionPersistenceAdapter implements LoadRegionPort {

    private final RegionRepository repository;

    public RegionPersistenceAdapter(RegionRepository repository) {
        this.repository = repository;
    }

    @Override
    public Optional<Region> findByCode(String code) {
        return repository.findById(code);
    }
}
