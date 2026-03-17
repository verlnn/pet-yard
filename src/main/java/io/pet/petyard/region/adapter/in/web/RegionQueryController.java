package io.pet.petyard.region.adapter.in.web;

import io.pet.petyard.region.adapter.out.persistence.RegionRepository;
import io.pet.petyard.region.domain.model.Region;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/regions")
public class RegionQueryController {

    private final RegionRepository regionRepository;

    public RegionQueryController(RegionRepository regionRepository) {
        this.regionRepository = regionRepository;
    }

    @GetMapping
    public List<RegionResponse> list(@RequestParam(required = false) String level,
                                     @RequestParam(required = false) String parentCode) {
        List<Region> regions;
        if (parentCode != null && !parentCode.isBlank() && level != null && !level.isBlank()) {
            regions = regionRepository.findByParentCodeAndLevelOrderByNameAsc(parentCode, level);
        } else if (parentCode != null && !parentCode.isBlank()) {
            regions = regionRepository.findByParentCodeOrderByNameAsc(parentCode);
        } else if (level != null && !level.isBlank()) {
            regions = regionRepository.findByLevelOrderByNameAsc(level);
        } else {
            regions = regionRepository.findAll();
        }
        return regions.stream()
            .map(region -> new RegionResponse(region.getCode(), region.getName()))
            .toList();
    }

    public record RegionResponse(String code, String name) {
    }
}
