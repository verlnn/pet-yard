package io.pet.petyard.user.adapter.in.web;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.pet.petyard.auth.adapter.in.web.AuthApiExceptionHandler;
import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.domain.AccountStatus;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.auth.security.SecurityExceptionHandler;
import io.pet.petyard.common.adapter.in.web.GlobalExceptionHandler;
import io.pet.petyard.common.application.service.ErrorLogService;
import io.pet.petyard.pet.application.port.out.LoadPetProfilePort;
import io.pet.petyard.region.application.port.out.LoadRegionPort;
import io.pet.petyard.support.WebMvcSliceTestConfig;
import io.pet.petyard.user.application.port.out.LoadGuardianRegistrationPort;
import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.application.port.out.LoadUserProfileSettingsPort;
import io.pet.petyard.user.domain.model.UserProfile;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.util.ReflectionTestUtils;

@WebMvcTest(PublicUserProfileController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({AuthApiExceptionHandler.class, SecurityExceptionHandler.class, GlobalExceptionHandler.class, WebMvcSliceTestConfig.class})
class PublicUserProfileControllerTest {

    @org.springframework.beans.factory.annotation.Autowired
    private MockMvc mockMvc;

    @MockitoBean private LoadUserPort loadUserPort;
    @MockitoBean private LoadUserProfilePort loadUserProfilePort;
    @MockitoBean private LoadGuardianRegistrationPort loadGuardianRegistrationPort;
    @MockitoBean private LoadUserProfileSettingsPort loadUserProfileSettingsPort;
    @MockitoBean private LoadRegionPort loadRegionPort;
    @MockitoBean private LoadPetProfilePort loadPetProfilePort;
    @MockitoBean private ErrorLogService errorLogService;

    @Test
    @DisplayName("username 기반 공개 프로필 조회가 가능하다")
    void profileReturnsUserByUsername() throws Exception {
        given(loadUserPort.findByUsername("owner.test")).willReturn(Optional.of(activeUser(11L, "owner.test")));
        given(loadUserProfilePort.findByUserId(11L)).willReturn(Optional.of(new UserProfile(11L, "멍냥집사", null, "/profile.jpg", false, true)));
        given(loadUserProfileSettingsPort.findByUserId(11L)).willReturn(Optional.empty());
        given(loadGuardianRegistrationPort.countByTargetUserId(11L)).willReturn(3L);
        given(loadPetProfilePort.findByUserId(11L)).willReturn(List.of());

        mockMvc.perform(get("/api/users/Owner.Test/profile"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("owner.test"))
            .andExpect(jsonPath("$.guardianCount").value(3))
            .andExpect(jsonPath("$.nickname").value("멍냥집사"));
    }

    private User activeUser(long userId, String username) {
        User user = new User("owner@petyard.com", "hash", username, UserTier.TIER_1, AccountStatus.ACTIVE);
        ReflectionTestUtils.setField(user, "id", userId);
        ReflectionTestUtils.setField(user, "createdAt", Instant.parse("2026-03-01T00:00:00Z"));
        return user;
    }
}
