package io.pet.petyard.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import tools.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@Import(TestOtpConfig.class)
class AuthTier0IntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private CapturingOtpGenerator otpGenerator;

    @Test
    void signupVerifyLoginSuccess() throws Exception {
        String email = "user1@test.com";

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Signup(email, "pass1234"))))
            .andExpect(status().isOk());

        String code = otpGenerator.lastCodeFor(email);

        mockMvc.perform(post("/api/auth/verify-email")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Verify(email, code))))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Login(email, "pass1234"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.accessToken").exists())
            .andExpect(jsonPath("$.refreshToken").exists());
    }

    @Test
    void loginBeforeVerifyReturns403() throws Exception {
        String email = "user2@test.com";

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Signup(email, "pass1234"))))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Login(email, "pass1234"))))
            .andExpect(status().isForbidden());
    }

    @Test
    void meRequiresAuthAndReturnsPermissions() throws Exception {
        String email = "user3@test.com";

        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Signup(email, "pass1234"))))
            .andExpect(status().isOk());

        String code = otpGenerator.lastCodeFor(email);

        mockMvc.perform(post("/api/auth/verify-email")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Verify(email, code))))
            .andExpect(status().isOk());

        String tokenResponse = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Login(email, "pass1234"))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

        String accessToken = objectMapper.readTree(tokenResponse).get("accessToken").asText();

        mockMvc.perform(get("/api/auth/me")
                .header("Authorization", "Bearer " + accessToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.userId").exists())
            .andExpect(jsonPath("$.tier").value("TIER_0"))
            .andExpect(jsonPath("$.permissions").isArray());
    }

    @Test
    void refreshRotatesToken() throws Exception {
        String email = "user4@test.com";

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Signup(email, "pass1234"))))
            .andExpect(status().isOk());

        String code = otpGenerator.lastCodeFor(email);

        mockMvc.perform(post("/api/auth/verify-email")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Verify(email, code))))
            .andExpect(status().isOk());

        String tokenResponse = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Login(email, "pass1234"))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

        String refreshToken = objectMapper.readTree(tokenResponse).get("refreshToken").asText();

        String refreshed = mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Refresh(refreshToken))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

        String newRefresh = objectMapper.readTree(refreshed).get("refreshToken").asText();

        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Refresh(refreshToken))))
            .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Refresh(newRefresh))))
            .andExpect(status().isOk());
    }

    @Test
    void logoutRevokesRefreshToken() throws Exception {
        String email = "user5@test.com";

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Signup(email, "pass1234"))))
            .andExpect(status().isOk());

        String code = otpGenerator.lastCodeFor(email);

        mockMvc.perform(post("/api/auth/verify-email")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Verify(email, code))))
            .andExpect(status().isOk());

        String tokenResponse = mockMvc.perform(post("/api/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Login(email, "pass1234"))))
            .andExpect(status().isOk())
            .andReturn()
            .getResponse()
            .getContentAsString();

        String refreshToken = objectMapper.readTree(tokenResponse).get("refreshToken").asText();

        mockMvc.perform(post("/api/auth/logout")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Refresh(refreshToken))))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/refresh")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Refresh(refreshToken))))
            .andExpect(status().isUnauthorized());
    }

    @Test
    void verifyEmailAttemptsExceededReturns403() throws Exception {
        String email = "user6@test.com";

        mockMvc.perform(post("/api/auth/signup")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Signup(email, "pass1234"))))
            .andExpect(status().isOk());

        String wrongCode = "000000";

        for (int i = 0; i < 5; i++) {
            mockMvc.perform(post("/api/auth/verify-email")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(objectMapper.writeValueAsString(new Verify(email, wrongCode))))
                .andExpect(status().isBadRequest());
        }

        mockMvc.perform(post("/api/auth/verify-email")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new Verify(email, wrongCode))))
            .andExpect(status().isForbidden());
    }

    private record Signup(String email, String password) {
    }

    private record Verify(String email, String code) {
    }

    private record Login(String email, String password) {
    }

    private record Refresh(String refreshToken) {
    }
}
