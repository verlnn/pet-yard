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
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.user.application.port.in.GetPublicUserProfileUseCase;
import io.pet.petyard.user.application.port.out.LoadGuardianRegistrationPort;
import io.pet.petyard.user.application.port.out.LoadUserProfilePort;
import io.pet.petyard.user.application.port.out.LoadUserProfileSettingsPort;
import io.pet.petyard.user.application.service.GuardianRegistrationService;
import io.pet.petyard.user.domain.model.UserProfile;
import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.TestingAuthenticationToken;
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
    @MockitoBean private GuardianRegistrationService guardianRegistrationService;
    @MockitoBean private GetPublicUserProfileUseCase getPublicUserProfileUseCase;
    @MockitoBean private ErrorLogService errorLogService;

    @Test
    @DisplayName("username 기반 공개 프로필 조회가 가능하다")
    void profileReturnsUserByUsername() throws Exception {
        given(loadUserPort.findByUsername("owner.test")).willReturn(Optional.of(activeUser(11L, "owner.test")));
        given(loadUserProfilePort.findByUserId(11L)).willReturn(Optional.of(new UserProfile(11L, "멍냥집사", null, "/profile.jpg", false, true)));
        given(loadUserProfileSettingsPort.findByUserId(11L)).willReturn(Optional.empty());
        given(loadGuardianRegistrationPort.countConnectedByUserId(11L)).willReturn(3L);
        given(loadPetProfilePort.findByUserId(11L)).willReturn(List.of());

        mockMvc.perform(get("/api/users/Owner.Test/profile"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username").value("owner.test"))
            .andExpect(jsonPath("$.guardianCount").value(3))
            .andExpect(jsonPath("$.nickname").value("멍냥집사"));
    }

    @Test
    @DisplayName("집사 목록 조회는 연결된 양방향 관계를 기준으로 응답한다")
    void guardiansReturnsConnectedUsers() throws Exception {
        given(loadUserPort.findByUsername("owner.test")).willReturn(Optional.of(activeUser(11L, "owner.test")));
        given(getPublicUserProfileUseCase.canViewContent(null, 11L)).willReturn(true);
        given(loadGuardianRegistrationPort.findConnectedGuardianUserIds(11L)).willReturn(List.of(31L, 22L));
        given(loadUserPort.findByIds(List.of(31L, 22L))).willReturn(Set.of(
            activeUser(22L, "guardian.two"),
            activeUser(31L, "guardian.one")
        ));
        given(loadUserProfilePort.findByUserIds(List.of(31L, 22L))).willReturn(List.of(
            new UserProfile(22L, "둘째집사", null, "/guardian-2.jpg", false, true),
            new UserProfile(31L, "첫째집사", null, "/guardian-1.jpg", false, true)
        ));

        mockMvc.perform(get("/api/users/owner.test/guardians"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.guardians[0].userId").value(31))
            .andExpect(jsonPath("$.guardians[0].username").value("guardian.one"))
            .andExpect(jsonPath("$.guardians[1].userId").value(22))
            .andExpect(jsonPath("$.guardians[1].username").value("guardian.two"));
    }

    @Test
    @DisplayName("집사 목록 조회는 검색어로 username과 nickname을 필터링한다")
    void guardiansFiltersByQuery() throws Exception {
        given(loadUserPort.findByUsername("owner.test")).willReturn(Optional.of(activeUser(11L, "owner.test")));
        given(getPublicUserProfileUseCase.canViewContent(null, 11L)).willReturn(true);
        given(loadGuardianRegistrationPort.findConnectedGuardianUserIds(11L)).willReturn(List.of(31L, 22L));
        given(loadUserPort.findByIds(List.of(31L, 22L))).willReturn(Set.of(
            activeUser(22L, "guardian.two"),
            activeUser(31L, "guardian.one")
        ));
        given(loadUserProfilePort.findByUserIds(List.of(31L, 22L))).willReturn(List.of(
            new UserProfile(22L, "둘째집사", null, "/guardian-2.jpg", false, true),
            new UserProfile(31L, "첫째집사", null, "/guardian-1.jpg", false, true)
        ));

        mockMvc.perform(get("/api/users/owner.test/guardians").queryParam("query", "둘째"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.guardians.length()").value(1))
            .andExpect(jsonPath("$.guardians[0].userId").value(22))
            .andExpect(jsonPath("$.guardians[0].username").value("guardian.two"));
    }

    @Test
    @DisplayName("비공개 계정의 집사 목록은 비로그인 사용자에게 빈 리스트를 반환한다")
    void guardiansReturnsEmptyForUnauthenticatedOnPrivateProfile() throws Exception {
        given(loadUserPort.findByUsername("private.user")).willReturn(Optional.of(activeUser(20L, "private.user")));
        given(getPublicUserProfileUseCase.canViewContent(null, 20L)).willReturn(false);

        mockMvc.perform(get("/api/users/private.user/guardians"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.guardians").isEmpty());
    }

    @Test
    @DisplayName("비공개 계정의 집사 목록은 비집사 로그인 사용자에게 빈 리스트를 반환한다")
    void guardiansReturnsEmptyForNonGuardianOnPrivateProfile() throws Exception {
        given(loadUserPort.findByUsername("private.user")).willReturn(Optional.of(activeUser(20L, "private.user")));
        given(getPublicUserProfileUseCase.canViewContent(99L, 20L)).willReturn(false);

        mockMvc.perform(
                get("/api/users/private.user/guardians")
                    .principal(new TestingAuthenticationToken(new AuthPrincipal(99L, UserTier.TIER_1), null))
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.guardians").isEmpty());
    }

    @Test
    @DisplayName("비공개 계정의 집사 목록은 집사 관계인 사용자에게 정상 반환된다")
    void guardiansReturnsListForAcceptedGuardian() throws Exception {
        given(loadUserPort.findByUsername("private.user")).willReturn(Optional.of(activeUser(20L, "private.user")));
        given(getPublicUserProfileUseCase.canViewContent(31L, 20L)).willReturn(true);
        given(loadGuardianRegistrationPort.findConnectedGuardianUserIds(20L)).willReturn(List.of(31L));
        given(loadUserPort.findByIds(List.of(31L))).willReturn(Set.of(activeUser(31L, "guardian.one")));
        given(loadUserProfilePort.findByUserIds(List.of(31L))).willReturn(List.of(
            new UserProfile(31L, "첫째집사", null, "/guardian-1.jpg", false, true)
        ));

        mockMvc.perform(
                get("/api/users/private.user/guardians")
                    .principal(new TestingAuthenticationToken(new AuthPrincipal(31L, UserTier.TIER_1), null))
            )
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.guardians.length()").value(1))
            .andExpect(jsonPath("$.guardians[0].userId").value(31));
    }

    private User activeUser(long userId, String username) {
        User user = new User("owner@petyard.com", "hash", username, UserTier.TIER_1, AccountStatus.ACTIVE);
        ReflectionTestUtils.setField(user, "id", userId);
        ReflectionTestUtils.setField(user, "createdAt", Instant.parse("2026-03-01T00:00:00Z"));
        return user;
    }
}
