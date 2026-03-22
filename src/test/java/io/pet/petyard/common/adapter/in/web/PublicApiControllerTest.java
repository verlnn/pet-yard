package io.pet.petyard.common.adapter.in.web;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.pet.petyard.common.application.service.ErrorLogService;
import io.pet.petyard.common.storage.FileStorageProperties;
import io.pet.petyard.pet.adapter.in.web.PetBreedController;
import io.pet.petyard.pet.adapter.out.persistence.PetBreedRepository;
import io.pet.petyard.pet.domain.model.PetBreed;
import io.pet.petyard.region.adapter.in.web.RegionQueryController;
import io.pet.petyard.region.adapter.out.persistence.RegionRepository;
import io.pet.petyard.region.domain.model.Region;
import io.pet.petyard.terms.adapter.in.web.TermsController;
import io.pet.petyard.terms.application.port.out.LoadTermsPort;
import io.pet.petyard.terms.domain.model.Terms;
import io.pet.petyard.support.WebMvcSliceTestConfig;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;

@WebMvcTest({HealthController.class, TermsController.class, RegionQueryController.class, PetBreedController.class})
@AutoConfigureMockMvc(addFilters = false)
@Import({GlobalExceptionHandler.class, WebMvcSliceTestConfig.class})
class PublicApiControllerTest {

    @org.springframework.beans.factory.annotation.Autowired
    private MockMvc mockMvc;

    @MockitoBean private LoadTermsPort loadTermsPort;
    @MockitoBean private RegionRepository regionRepository;
    @MockitoBean private PetBreedRepository petBreedRepository;
    @MockitoBean private ErrorLogService errorLogService;

    @Test
    @DisplayName("헬스 체크는 OK 상태를 반환한다")
    void healthReturnsOk() throws Exception {
        mockMvc.perform(get("/api/health"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("okkkkkk"));
    }

    @Test
    @DisplayName("약관 목록 조회는 약관 배열을 반환한다")
    void termsReturnsItems() throws Exception {
        Terms service = instantiate(Terms.class);
        ReflectionTestUtils.setField(service, "id", 1L);
        ReflectionTestUtils.setField(service, "code", "SERVICE");
        ReflectionTestUtils.setField(service, "version", 1);
        ReflectionTestUtils.setField(service, "title", "서비스 이용약관");
        ReflectionTestUtils.setField(service, "mandatory", true);
        ReflectionTestUtils.setField(service, "contentUrl", "https://terms/service");
        given(loadTermsPort.findAll()).willReturn(List.of(service));

        mockMvc.perform(get("/api/auth/terms"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.terms[0].code").value("SERVICE"));
    }

    @Test
    @DisplayName("지역 조회는 필터 조건에 맞는 지역을 반환한다")
    void regionsReturnsFilteredData() throws Exception {
        given(regionRepository.findByLevelOrderByNameAsc("DONG"))
            .willReturn(List.of(region("11010", "부암동", "DONG", "11000")));

        mockMvc.perform(get("/api/regions").param("level", "DONG"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].code").value("11010"));
    }

    @Test
    @DisplayName("품종 조회는 species를 대문자로 변환해 조회한다")
    void breedsReturnsSpeciesMatches() throws Exception {
        PetBreed breed = instantiate(PetBreed.class);
        ReflectionTestUtils.setField(breed, "id", 7L);
        ReflectionTestUtils.setField(breed, "species", "DOG");
        ReflectionTestUtils.setField(breed, "nameKo", "푸들");
        ReflectionTestUtils.setField(breed, "nameEn", "Poodle");
        given(petBreedRepository.findBySpeciesOrderByNameKoAsc("DOG")).willReturn(List.of(breed));

        mockMvc.perform(get("/api/pets/breeds").param("species", "dog"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].nameKo").value("푸들"));
    }

    private Region region(String code, String name, String level, String parentCode) {
        Region region = instantiate(Region.class);
        ReflectionTestUtils.setField(region, "code", code);
        ReflectionTestUtils.setField(region, "name", name);
        ReflectionTestUtils.setField(region, "level", level);
        ReflectionTestUtils.setField(region, "parentCode", parentCode);
        return region;
    }

    private <T> T instantiate(Class<T> type) {
        try {
            var constructor = type.getDeclaredConstructor();
            constructor.setAccessible(true);
            return constructor.newInstance();
        } catch (ReflectiveOperationException exception) {
            throw new IllegalStateException("테스트 픽스처 생성 실패: " + type.getSimpleName(), exception);
        }
    }
}
