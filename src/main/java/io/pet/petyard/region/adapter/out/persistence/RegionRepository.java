package io.pet.petyard.region.adapter.out.persistence;

import io.pet.petyard.region.domain.model.Region;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RegionRepository extends JpaRepository<Region, String> {
    List<Region> findByLevelOrderByNameAsc(String level);
    List<Region> findByParentCodeOrderByNameAsc(String parentCode);
    List<Region> findByParentCodeAndLevelOrderByNameAsc(String parentCode, String level);
}
