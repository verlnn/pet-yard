package io.pet.petyard.onboarding.adapter.in.web;

import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.pet.petyard.auth.adapter.in.web.AuthApiExceptionHandler;
import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.application.service.LoginLogService;
import io.pet.petyard.auth.jwt.JwtTokenProvider;
import io.pet.petyard.auth.security.SecurityExceptionHandler;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.common.application.service.ErrorLogService;
import io.pet.petyard.onboarding.application.port.in.OAuthCallbackUseCase;
import io.pet.petyard.onboarding.application.port.in.OAuthStartUseCase;
import io.pet.petyard.support.WebMvcSliceTestConfig;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.BDDMockito.given;

@WebMvcTest(OAuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({AuthApiExceptionHandler.class, SecurityExceptionHandler.class, WebMvcSliceTestConfig.class})
class OAuthControllerTest {

    @org.springframework.beans.factory.annotation.Autowired
    private MockMvc mockMvc;

    @MockitoBean private OAuthStartUseCase oAuthStartUseCase;
    @MockitoBean private OAuthCallbackUseCase oAuthCallbackUseCase;
    @MockitoBean private JwtTokenProvider tokenProvider;
    @MockitoBean private LoadUserPort loadUserPort;
    @MockitoBean private LoginLogService loginLogService;
    @MockitoBean private ErrorLogService errorLogService;

    @Test
    @DisplayName("OAuth 시작은 authorize URL과 state를 반환한다")
    void startReturnsAuthorizeUrl() throws Exception {
        given(oAuthStartUseCase.start(any()))
            .willReturn(new OAuthStartUseCase.OAuthStartResult("https://kakao.test/authorize", "state-1", "2026-03-23T03:50:00Z"));

        mockMvc.perform(post("/api/auth/oauth/kakao/start"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.authorizeUrl").value("https://kakao.test/authorize"))
            .andExpect(jsonPath("$.state").value("state-1"));
    }

    @Test
    @DisplayName("OAuth 콜백 state mismatch는 400을 반환한다")
    void callbackStateMismatchReturnsBadRequest() throws Exception {
        given(oAuthCallbackUseCase.handle(any()))
            .willThrow(new ApiException(ErrorCode.OAUTH_STATE_MISMATCH));

        mockMvc.perform(get("/api/auth/oauth/kakao/callback")
                .param("code", "oauth-code")
                .param("state", "wrong")
                .param("redirectUri", "http://localhost:3000/callback"))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("BAD_REQUEST"));
    }
}
