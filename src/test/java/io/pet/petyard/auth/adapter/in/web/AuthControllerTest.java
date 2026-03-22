package io.pet.petyard.auth.adapter.in.web;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.pet.petyard.auth.adapter.out.persistence.UserRepository;
import io.pet.petyard.auth.application.port.in.AuthTokens;
import io.pet.petyard.auth.application.port.in.ExtendEmailVerificationUseCase;
import io.pet.petyard.auth.application.port.in.GetCurrentUserUseCase;
import io.pet.petyard.auth.application.port.in.LoginUseCase;
import io.pet.petyard.auth.application.port.in.LogoutUseCase;
import io.pet.petyard.auth.application.port.in.RefreshTokenUseCase;
import io.pet.petyard.auth.application.port.in.ResendEmailVerificationUseCase;
import io.pet.petyard.auth.application.port.in.SignUpUseCase;
import io.pet.petyard.auth.application.port.in.VerifyEmailUseCase;
import io.pet.petyard.auth.application.service.LoginLogService;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.auth.security.SecurityExceptionHandler;
import io.pet.petyard.common.application.service.ErrorLogService;
import io.pet.petyard.support.WebMvcSliceTestConfig;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import tools.jackson.databind.ObjectMapper;

import static org.mockito.BDDMockito.given;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({AuthApiExceptionHandler.class, SecurityExceptionHandler.class, WebMvcSliceTestConfig.class})
class AuthControllerTest {

    @org.springframework.beans.factory.annotation.Autowired
    private MockMvc mockMvc;

    @org.springframework.beans.factory.annotation.Autowired
    private ObjectMapper objectMapper;

    @MockitoBean private SignUpUseCase signUpUseCase;
    @MockitoBean private VerifyEmailUseCase verifyEmailUseCase;
    @MockitoBean private ExtendEmailVerificationUseCase extendEmailUseCase;
    @MockitoBean private ResendEmailVerificationUseCase resendEmailUseCase;
    @MockitoBean private LoginUseCase loginUseCase;
    @MockitoBean private RefreshTokenUseCase refreshTokenUseCase;
    @MockitoBean private LogoutUseCase logoutUseCase;
    @MockitoBean private GetCurrentUserUseCase getCurrentUserUseCase;
    @MockitoBean private LoginLogService loginLogService;
    @MockitoBean private UserRepository userRepository;
    @MockitoBean private ErrorLogService errorLogService;

    @Test
    @DisplayName("회원가입 성공 시 이메일과 만료 시각을 반환한다")
    void signupReturnsExpiry() throws Exception {
        given(signUpUseCase.signup(any()))
            .willReturn(new SignUpUseCase.SignupResult(11L, "owner@petyard.com", java.time.Instant.parse("2026-03-23T03:44:00Z")));

        mockMvc.perform(post("/api/auth/signup")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new SignupRequest("owner@petyard.com", "pass1234"))))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.email").value("owner@petyard.com"))
            .andExpect(jsonPath("$.expiresAt").value("2026-03-23T03:44:00Z"));
    }

    @Test
    @DisplayName("회원가입 요청 검증 실패 시 400을 반환한다")
    void signupValidationFailureReturns400() throws Exception {
        mockMvc.perform(post("/api/auth/signup")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new SignupRequest("", ""))))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
    }

    @Test
    @DisplayName("로그인 실패 시 401을 반환한다")
    void loginFailureReturns401() throws Exception {
        given(loginUseCase.login(any()))
            .willThrow(new AuthenticationCredentialsNotFoundException("invalid"));

        mockMvc.perform(post("/api/auth/login")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(new LoginRequest("owner@petyard.com", "wrong"))))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("현재 사용자 조회는 인증 주체가 없으면 401을 반환한다")
    void meRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.code").value("UNAUTHORIZED"));
    }

    @Test
    @DisplayName("현재 사용자 조회는 principal이 있으면 사용자 요약을 반환한다")
    void meReturnsCurrentUser() throws Exception {
        given(getCurrentUserUseCase.getCurrentUser(any()))
            .willReturn(new GetCurrentUserUseCase.CurrentUserResult(11L, "TIER_1", new java.util.LinkedHashSet<>(java.util.List.of("FEED_READ", "FEED_CREATE"))));

        mockMvc.perform(get("/api/auth/me").with(authPrincipalRequest(11L, UserTier.TIER_1)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.userId").value(11))
            .andExpect(jsonPath("$.tier").value("TIER_1"))
            .andExpect(jsonPath("$.permissions[0]").value("FEED_READ"));
    }

    private Authentication authPrincipal(long userId, UserTier tier) {
        TestingAuthenticationToken authentication = new TestingAuthenticationToken(new AuthPrincipal(userId, tier), null, "ROLE_USER");
        authentication.setAuthenticated(true);
        return authentication;
    }

    private RequestPostProcessor authPrincipalRequest(long userId, UserTier tier) {
        Authentication authentication = authPrincipal(userId, tier);
        return request -> {
            request.setUserPrincipal(authentication);
            return request;
        };
    }
}
