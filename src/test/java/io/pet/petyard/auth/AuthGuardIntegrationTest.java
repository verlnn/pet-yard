package io.pet.petyard.auth;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.jwt.JwtTokenProvider;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
class AuthGuardIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Test
    void tier0CannotAccessTier1Api() throws Exception {
        String token = tokenProvider.createAccessToken(1L, UserTier.TIER_0);

        mockMvc.perform(post("/api/feeds")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    @Test
    void tier1CannotApplyWalk() throws Exception {
        String token = tokenProvider.createAccessToken(2L, UserTier.TIER_1);

        mockMvc.perform(post("/api/walk/apply")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isForbidden());
    }

    @Test
    void tier2CanAccessLowerTierApis() throws Exception {
        String token = tokenProvider.createAccessToken(2L, UserTier.TIER_2);

        mockMvc.perform(get("/api/feeds")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());

        mockMvc.perform(post("/api/walk/apply")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk());
    }

    @Test
    void anonymousCannotAccessProtectedApi() throws Exception {
        mockMvc.perform(get("/api/feeds"))
            .andExpect(status().isUnauthorized());
    }
}
