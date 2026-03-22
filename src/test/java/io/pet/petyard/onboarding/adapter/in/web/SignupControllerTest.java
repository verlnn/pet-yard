package io.pet.petyard.onboarding.adapter.in.web;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.pet.petyard.auth.adapter.in.web.AuthApiExceptionHandler;
import io.pet.petyard.auth.security.SecurityExceptionHandler;
import io.pet.petyard.common.application.service.ErrorLogService;
import io.pet.petyard.onboarding.application.port.in.SignupCompleteUseCase;
import io.pet.petyard.onboarding.application.port.in.SignupConsentsUseCase;
import io.pet.petyard.onboarding.application.port.in.SignupPetUseCase;
import io.pet.petyard.onboarding.application.port.in.SignupProfileUseCase;
import io.pet.petyard.onboarding.application.port.in.SignupProgressUseCase;
import io.pet.petyard.pet.application.service.AnimalRegistrationResult;
import io.pet.petyard.pet.application.service.AnimalRegistrationService;
import io.pet.petyard.pet.domain.PetGender;
import io.pet.petyard.support.WebMvcSliceTestConfig;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import tools.jackson.databind.ObjectMapper;

import static org.mockito.BDDMockito.given;

@WebMvcTest(SignupController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({AuthApiExceptionHandler.class, SecurityExceptionHandler.class, WebMvcSliceTestConfig.class})
class SignupControllerTest {

    @org.springframework.beans.factory.annotation.Autowired
    private MockMvc mockMvc;

    @org.springframework.beans.factory.annotation.Autowired
    private ObjectMapper objectMapper;

    @MockitoBean private SignupProgressUseCase signupProgressUseCase;
    @MockitoBean private SignupProfileUseCase signupProfileUseCase;
    @MockitoBean private SignupConsentsUseCase signupConsentsUseCase;
    @MockitoBean private SignupPetUseCase signupPetUseCase;
    @MockitoBean private SignupCompleteUseCase signupCompleteUseCase;
    @MockitoBean private AnimalRegistrationService animalRegistrationService;
    @MockitoBean private ErrorLogService errorLogService;

    @Test
    @DisplayName("온보딩 진행 상태 조회는 현재 step을 반환한다")
    void progressReturnsStep() throws Exception {
        given(signupProgressUseCase.progress(any()))
            .willReturn(new SignupProgressUseCase.SignupProgressResult("PROFILE", "2026-03-23T03:55:00Z", false, null, null));

        mockMvc.perform(get("/api/auth/signup/progress").header("X-Signup-Token", "signup-token"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.step").value("PROFILE"));
    }

    @Test
    @DisplayName("약관 동의 요청은 비어 있으면 validation 400을 반환한다")
    void consentsValidationFailureReturns400() throws Exception {
        mockMvc.perform(post("/api/auth/signup/consents")
                .header("X-Signup-Token", "signup-token")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new SignupConsentsRequest(List.of()))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
    }

    @Test
    @DisplayName("반려동물 검증은 검증 결과를 응답한다")
    void verifyPetReturnsRegistrationData() throws Exception {
        given(animalRegistrationService.verify(any(), any(), any(), any()))
            .willReturn(new AnimalRegistrationResult(
                "DOG-123", "RFID-123", "보리", LocalDate.of(2021, 5, 1), PetGender.MALE,
                "푸들", true, "기관", "02-0000-0000", "승인", "2024-01-01", "2024-01-02"
            ));

        mockMvc.perform(post("/api/auth/signup/pet/verify")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new io.pet.petyard.pet.adapter.in.web.PetRegistrationRequest(
                    "DOG-123", "RFID-123", "홍길동", "19900101", null, null, null, true, true
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.name").value("보리"));
    }
}
