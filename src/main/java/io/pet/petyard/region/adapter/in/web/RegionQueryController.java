package io.pet.petyard.region.adapter.in.web;

import io.pet.petyard.region.adapter.out.persistence.RegionRepository;
import io.pet.petyard.region.domain.model.Region;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/regions")
@Tag(name = "Regions", description = "지역 코드 및 이름 조회 API")
public class RegionQueryController {

    private final RegionRepository regionRepository;

    public RegionQueryController(RegionRepository regionRepository) {
        this.regionRepository = regionRepository;
    }

    @GetMapping
    @Operation(summary = "지역 목록 조회", description = "레벨과 부모 코드를 기준으로 지역 목록을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = RegionResponse.class))))
    })
    public List<RegionResponse> list(
        @Parameter(description = "지역 레벨", example = "DONG")
        @RequestParam(required = false) String level,
        @Parameter(description = "상위 지역 코드", example = "11000")
        @RequestParam(required = false) String parentCode
    ) {
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

    @Schema(description = "지역 응답")
    public record RegionResponse(
        @Schema(description = "지역 코드", example = "11010") String code,
        @Schema(description = "지역 이름", example = "부암동") String name
    ) {
    }
}
