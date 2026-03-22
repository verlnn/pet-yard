package io.pet.petyard.pet.adapter.in.web;

import io.pet.petyard.pet.adapter.out.persistence.PetBreedRepository;
import io.pet.petyard.pet.domain.model.PetBreed;
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
@RequestMapping("/api/pets/breeds")
@Tag(name = "Pets", description = "반려동물 품종 조회 API")
public class PetBreedController {

    private final PetBreedRepository petBreedRepository;

    public PetBreedController(PetBreedRepository petBreedRepository) {
        this.petBreedRepository = petBreedRepository;
    }

    @GetMapping
    @Operation(summary = "품종 목록 조회", description = "종(species)에 해당하는 품종 목록을 이름순으로 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(array = @ArraySchema(schema = @Schema(implementation = PetBreedResponse.class)))),
        @ApiResponse(responseCode = "400", description = "잘못된 species 값")
    })
    public List<PetBreedResponse> list(
        @Parameter(description = "반려동물 종", example = "DOG")
        @RequestParam String species
    ) {
        List<PetBreed> breeds = petBreedRepository.findBySpeciesOrderByNameKoAsc(species.toUpperCase());
        return breeds.stream()
            .map(breed -> new PetBreedResponse(breed.getId(), breed.getNameKo(), breed.getNameEn()))
            .toList();
    }
}
