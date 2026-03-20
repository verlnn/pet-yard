package io.pet.petyard.onboarding;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.BDDMockito.given;

import io.pet.petyard.pet.application.service.AnimalRegistrationResult;
import io.pet.petyard.pet.application.service.AnimalRegistrationService;
import io.pet.petyard.pet.domain.PetGender;
import tools.jackson.databind.ObjectMapper;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.context.bean.override.mockito.MockitoBean;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestOAuthConfig.class)
class OnboardingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private AnimalRegistrationService animalRegistrationService;

    @Test
    void kakaoCallbackCreatesOnboardingSession() throws Exception {
        String start = mockMvc.perform(post("/api/auth/oauth/kakao/start"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authorizeUrl").exists())
            .andReturn()
            .getResponse()
            .getContentAsString();

        String state = objectMapper.readTree(start).get("state").asText();

        mockMvc.perform(get("/api/auth/oauth/kakao/callback")
                .param("code", "test-code")
                .param("state", state)
                .param("redirectUri", "http://localhost:3000/auth/callback"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.status").value("ONBOARDING"))
            .andExpect(jsonPath("$.signupToken").exists())
            .andExpect(jsonPath("$.nextStep").value("PROFILE"));
    }

    @Test
    void stateMismatchFails() throws Exception {
        mockMvc.perform(get("/api/auth/oauth/kakao/callback")
                .param("code", "test-code")
                .param("state", "invalid")
                .param("redirectUri", "http://localhost:3000/auth/callback"))
            .andExpect(status().isBadRequest());
    }

    @Test
    void requiredTermsMissingFails() throws Exception {
        String signupToken = beginOnboarding();

        mockMvc.perform(post("/api/auth/signup/profile")
                .header("X-Signup-Token", signupToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Profile("닉네임", null, null, false, false))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nextStep").value("CONSENTS"));

        mockMvc.perform(post("/api/auth/signup/consents")
                .header("X-Signup-Token", signupToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Consents(List.of(new Consent("MARKETING", true))))))
            .andExpect(status().isBadRequest());
    }

    @Test
    void completeWithoutPet() throws Exception {
        String signupToken = beginOnboarding();

        mockMvc.perform(post("/api/auth/signup/profile")
                .header("X-Signup-Token", signupToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Profile("닉네임2", null, null, false, false))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nextStep").value("CONSENTS"));

        mockMvc.perform(post("/api/auth/signup/consents")
                .header("X-Signup-Token", signupToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Consents(List.of(
                    new Consent("SERVICE", true),
                    new Consent("PRIVACY", true)
                )))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nextStep").value("COMPLETE"));

        mockMvc.perform(post("/api/auth/signup/complete")
                .header("X-Signup-Token", signupToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").exists())
            .andExpect(jsonPath("$.refreshToken").exists());
    }

    @Test
    void completeWithPetGrantsFeedCreatePermission() throws Exception {
        String signupToken = beginOnboarding();

        given(animalRegistrationService.verify("DOG-123", "RFID-123", "홍길동", "19900101"))
            .willReturn(new AnimalRegistrationResult(
                "DOG-123",
                "RFID-123",
                "멍이",
                LocalDate.of(2021, 5, 1),
                PetGender.MALE,
                "푸들",
                true,
                "테스트기관",
                "02-0000-0000",
                "승인",
                "2024-01-01",
                "2024-01-02"
            ));

        mockMvc.perform(post("/api/auth/signup/profile")
                .header("X-Signup-Token", signupToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Profile("닉네임3", null, null, false, true))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nextStep").value("PET"));

        mockMvc.perform(post("/api/auth/signup/pet")
                .header("X-Signup-Token", signupToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Pet(
                    "DOG-123",
                    "RFID-123",
                    "홍길동",
                    "19900101",
                    null,
                    4.2,
                    true,
                    true
                ))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nextStep").value("CONSENTS"));

        mockMvc.perform(post("/api/auth/signup/consents")
                .header("X-Signup-Token", signupToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Consents(List.of(
                    new Consent("SERVICE", true),
                    new Consent("PRIVACY", true)
                )))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nextStep").value("COMPLETE"));

        String complete = mockMvc.perform(post("/api/auth/signup/complete")
                .header("X-Signup-Token", signupToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").exists())
            .andReturn()
            .getResponse()
            .getContentAsString();

        String accessToken = objectMapper.readTree(complete).get("accessToken").asText();

        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + accessToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tier").value("TIER_1"))
            .andExpect(jsonPath("$.permissions").isArray())
            .andExpect(jsonPath("$.permissions[?(@ == 'FEED_CREATE')]").exists());
    }

    @Test
    void nicknameDuplicateFails() throws Exception {
        String firstToken = beginOnboarding();

        mockMvc.perform(post("/api/auth/signup/profile")
                .header("X-Signup-Token", firstToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Profile("중복닉", null, null, false, false))))
            .andExpect(status().isOk());

        String secondToken = beginOnboarding();

        mockMvc.perform(post("/api/auth/signup/profile")
                .header("X-Signup-Token", secondToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Profile("중복닉", null, null, false, false))))
            .andExpect(status().isBadRequest());
    }

    private String beginOnboarding() throws Exception {
        String start = mockMvc.perform(post("/api/auth/oauth/kakao/start"))
            .andReturn()
            .getResponse()
            .getContentAsString();
        String state = objectMapper.readTree(start).get("state").asText();
        String callback = mockMvc.perform(get("/api/auth/oauth/kakao/callback")
                .param("code", "test-code")
                .param("state", state)
                .param("redirectUri", "http://localhost:3000/auth/callback"))
            .andReturn()
            .getResponse()
            .getContentAsString();
        return objectMapper.readTree(callback).get("signupToken").asText();
    }

    private record Profile(String nickname, String regionCode, String profileImageUrl, boolean marketingOptIn, boolean hasPet) {
    }

    private record Consents(List<Consent> consents) {
    }

    private record Consent(String code, boolean agreed) {
    }

    private record Pet(
        String dogRegNo,
        String rfidCd,
        String ownerNm,
        String ownerBirth,
        String photoUrl,
        Double weightKg,
        Boolean vaccinationComplete,
        Boolean walkSafetyChecked
    ) {
    }
}
