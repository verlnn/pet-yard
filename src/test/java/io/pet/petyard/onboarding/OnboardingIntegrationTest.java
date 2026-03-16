package io.pet.petyard.onboarding;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import tools.jackson.databind.ObjectMapper;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestOAuthConfig.class)
class OnboardingIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

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
}
