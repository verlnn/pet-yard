package io.pet.petyard.pet.adapter.in.web;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.pet.petyard.auth.adapter.in.web.AuthApiExceptionHandler;
import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.application.port.out.SaveUserPort;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.auth.security.SecurityExceptionHandler;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.common.adapter.in.web.GlobalExceptionHandler;
import io.pet.petyard.common.application.service.ErrorLogService;
import io.pet.petyard.common.storage.LocalFileStorage;
import io.pet.petyard.pet.application.port.out.LoadPetProfilePort;
import io.pet.petyard.pet.application.port.out.SavePetProfilePort;
import io.pet.petyard.pet.application.service.AnimalRegistrationResult;
import io.pet.petyard.pet.application.service.AnimalRegistrationService;
import io.pet.petyard.pet.domain.PetGender;
import io.pet.petyard.pet.domain.PetSpecies;
import io.pet.petyard.pet.domain.model.PetProfile;
import io.pet.petyard.support.WebMvcSliceTestConfig;
import io.pet.petyard.user.application.port.out.LoadUserProfileSettingsPort;
import io.pet.petyard.user.application.port.out.SaveUserProfileSettingsPort;

import java.time.LocalDate;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.MockMvc;

import tools.jackson.databind.ObjectMapper;

import static org.mockito.BDDMockito.given;

@WebMvcTest(PetProfileController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({AuthApiExceptionHandler.class, SecurityExceptionHandler.class, GlobalExceptionHandler.class, WebMvcSliceTestConfig.class})
class PetProfileControllerTest {

    @org.springframework.beans.factory.annotation.Autowired
    private MockMvc mockMvc;

    @org.springframework.beans.factory.annotation.Autowired
    private ObjectMapper objectMapper;

    @MockitoBean private LoadPetProfilePort loadPetProfilePort;
    @MockitoBean private SavePetProfilePort savePetProfilePort;
    @MockitoBean private AnimalRegistrationService registrationService;
    @MockitoBean private LoadUserPort loadUserPort;
    @MockitoBean private SaveUserPort saveUserPort;
    @MockitoBean private LoadUserProfileSettingsPort loadUserProfileSettingsPort;
    @MockitoBean private SaveUserProfileSettingsPort saveUserProfileSettingsPort;
    @MockitoBean private LocalFileStorage localFileStorage;
    @MockitoBean private ErrorLogService errorLogService;

    @Test
    @DisplayName("반려동물 등록 검증은 외부 검증 결과를 그대로 반환한다")
    void verifyReturnsRegistrationInfo() throws Exception {
        given(registrationService.verify(any(), any(), any(), any()))
            .willReturn(new AnimalRegistrationResult(
                "DOG-123", "RFID-123", "보리", LocalDate.of(2021, 5, 1), PetGender.MALE,
                "푸들", true, "기관", "02-0000-0000", "승인", "2024-01-01", "2024-01-02"
            ));

        mockMvc.perform(post("/api/pets/verify")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new PetRegistrationRequest("DOG-123", "RFID-123", "홍길동", "19900101", null, null, null, true, true))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("보리"))
            .andExpect(jsonPath("$.gender").value("MALE"));
    }

    @Test
    @DisplayName("반려동물 수정 대상이 없으면 400을 반환한다")
    void updateMissingPetReturnsBadRequest() throws Exception {
        given(loadPetProfilePort.findByIdAndUserId(7L, 11L)).willReturn(Optional.empty());

        mockMvc.perform(patch("/api/pets/7")
                .with(authPrincipalRequest())
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new PetProfileRequest("보리", "DOG", "푸들", null, null, "MALE", true, null, null, null, true, true))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
    }

    private Authentication authPrincipal() {
        TestingAuthenticationToken authentication = new TestingAuthenticationToken(new AuthPrincipal(11L, UserTier.TIER_1), null, "ROLE_USER");
        authentication.setAuthenticated(true);
        return authentication;
    }

    private RequestPostProcessor authPrincipalRequest() {
        Authentication authentication = authPrincipal();
        return request -> {
            request.setUserPrincipal(authentication);
            return request;
        };
    }
}
