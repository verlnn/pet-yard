package io.pet.petyard.user.adapter.in.web;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.pet.petyard.auth.adapter.in.web.AuthApiExceptionHandler;
import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.domain.AccountStatus;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.auth.security.SecurityExceptionHandler;
import io.pet.petyard.common.adapter.in.web.GlobalExceptionHandler;
import io.pet.petyard.common.application.service.ErrorLogService;
import io.pet.petyard.support.WebMvcSliceTestConfig;
import io.pet.petyard.pet.application.port.out.LoadPetProfilePort;
import io.pet.petyard.pet.domain.PetGender;
import io.pet.petyard.pet.domain.PetSpecies;
import io.pet.petyard.pet.domain.model.PetProfile;
import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.application.port.out.LoadUserProfileSettingsPort;
import io.pet.petyard.user.application.port.out.SaveUserProfileSettingsPort;
import io.pet.petyard.user.domain.UserProfileGender;
import io.pet.petyard.user.domain.model.UserProfile;
import io.pet.petyard.user.domain.model.UserProfileSettings;
import io.pet.petyard.region.application.port.out.LoadRegionPort;
import io.pet.petyard.region.domain.model.Region;

import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.web.servlet.MockMvc;

import tools.jackson.databind.ObjectMapper;

import static org.mockito.BDDMockito.given;

@WebMvcTest(UserProfileController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({AuthApiExceptionHandler.class, SecurityExceptionHandler.class, GlobalExceptionHandler.class, WebMvcSliceTestConfig.class})
class UserProfileControllerTest {

    @org.springframework.beans.factory.annotation.Autowired
    private MockMvc mockMvc;

    @org.springframework.beans.factory.annotation.Autowired
    private ObjectMapper objectMapper;

    @MockitoBean private LoadUserPort loadUserPort;
    @MockitoBean private LoadUserProfilePort loadUserProfilePort;
    @MockitoBean private LoadUserProfileSettingsPort loadUserProfileSettingsPort;
    @MockitoBean private SaveUserProfileSettingsPort saveUserProfileSettingsPort;
    @MockitoBean private LoadRegionPort loadRegionPort;
    @MockitoBean private LoadPetProfilePort loadPetProfilePort;
    @MockitoBean private ErrorLogService errorLogService;

    @Test
    @DisplayName("내 프로필 조회는 사용자, 설정, 반려동물 목록을 조합해 반환한다")
    void profileReturnsComposedResponse() throws Exception {
        given(loadUserPort.findById(11L)).willReturn(Optional.of(activeUser(11L)));
        given(loadUserProfilePort.findByUserId(11L)).willReturn(Optional.of(new UserProfile(11L, "멍냥집사", "11010", "/profile.jpg", false, true)));
        UserProfileSettings settings = new UserProfileSettings(11L, "산책 좋아함");
        settings.updateGender(UserProfileGender.UNSPECIFIED);
        settings.updatePrimaryPetId(7L);
        given(loadUserProfileSettingsPort.findByUserId(11L)).willReturn(Optional.of(settings));
        given(loadRegionPort.findByCode("11010")).willReturn(Optional.of(region("11010", "부암동", "DONG", "11000")));
        given(loadPetProfilePort.findByUserId(11L)).willReturn(List.of(new PetProfile(
            11L, "보리", PetSpecies.DOG, "푸들", LocalDate.of(2021, 5, 1), null, PetGender.MALE,
            true, "활발함", "/pet.jpg", null, true, true
        )));

        mockMvc.perform(get("/api/users/me/profile").with(authPrincipalRequest()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.nickname").value("멍냥집사"))
            .andExpect(jsonPath("$.regionName").value("부암동"))
            .andExpect(jsonPath("$.primaryPetId").value(7))
            .andExpect(jsonPath("$.pets[0].name").value("보리"));
    }

    @Test
    @DisplayName("소개가 150자를 넘으면 400을 반환한다")
    void updateProfileRejectsOversizedBio() throws Exception {
        String bio = "a".repeat(151);

        mockMvc.perform(patch("/api/users/me/profile")
                .with(authPrincipalRequest())
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new UserProfileSettingsRequest(bio, "UNSPECIFIED", null))))
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

    private User activeUser(long userId) {
        User user = new User("owner@petyard.com", "hash", UserTier.TIER_1, AccountStatus.ACTIVE);
        org.springframework.test.util.ReflectionTestUtils.setField(user, "id", userId);
        org.springframework.test.util.ReflectionTestUtils.setField(user, "createdAt", Instant.parse("2026-03-01T00:00:00Z"));
        org.springframework.test.util.ReflectionTestUtils.setField(user, "lastLoginAt", Instant.parse("2026-03-23T03:00:00Z"));
        return user;
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
