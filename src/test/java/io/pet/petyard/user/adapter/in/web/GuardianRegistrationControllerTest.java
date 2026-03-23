package io.pet.petyard.user.adapter.in.web;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.pet.petyard.auth.adapter.in.web.AuthApiExceptionHandler;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.auth.security.SecurityExceptionHandler;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.common.adapter.in.web.GlobalExceptionHandler;
import io.pet.petyard.common.application.service.ErrorLogService;
import io.pet.petyard.support.WebMvcSliceTestConfig;
import io.pet.petyard.user.application.service.GuardianRegistrationService;
import io.pet.petyard.user.domain.GuardianRelationStatus;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;

@WebMvcTest(GuardianRegistrationController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({AuthApiExceptionHandler.class, SecurityExceptionHandler.class, GlobalExceptionHandler.class, WebMvcSliceTestConfig.class})
class GuardianRegistrationControllerTest {

    @org.springframework.beans.factory.annotation.Autowired
    private MockMvc mockMvc;

    @MockitoBean private GuardianRegistrationService guardianRegistrationService;
    @MockitoBean private ErrorLogService errorLogService;

    @Test
    @DisplayName("집사 요청은 현재 관계 상태를 반환한다")
    void requestReturnsRelationStatus() throws Exception {
        given(guardianRegistrationService.requestOrAccept(11L, 22L))
            .willReturn(GuardianRelationStatus.OUTGOING_REQUESTED);

        mockMvc.perform(post("/api/users/22/guardians").with(authPrincipalRequest(11L)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.targetUserId").value(22))
            .andExpect(jsonPath("$.guardianRelationStatus").value("OUTGOING_REQUESTED"))
            .andExpect(jsonPath("$.guardianRegisteredByMe").value(false));
    }

    @Test
    @DisplayName("짧은 시간에 과도한 요청은 비인가적 활동 오류로 내려간다")
    void requestReturnsRateLimitError() throws Exception {
        given(guardianRegistrationService.requestOrAccept(11L, 22L))
            .willThrow(new ApiException(ErrorCode.GUARDIAN_REQUEST_RATE_LIMIT));

        mockMvc.perform(post("/api/users/22/guardians").with(authPrincipalRequest(11L)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.code").value("BAD_REQUEST"))
            .andExpect(jsonPath("$.message").value("비인가적인 활동이 감지되었습니다"));
    }

    @Test
    @DisplayName("집사 관계 제거는 NONE 상태를 반환한다")
    void removeReturnsNoneStatus() throws Exception {
        given(guardianRegistrationService.remove(11L, 22L))
            .willReturn(GuardianRelationStatus.NONE);

        mockMvc.perform(delete("/api/users/22/guardians").with(authPrincipalRequest(11L)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.guardianRelationStatus").value("NONE"))
            .andExpect(jsonPath("$.guardianRegisteredByMe").value(false));
    }

    private RequestPostProcessor authPrincipalRequest(long userId) {
        Authentication authentication = new TestingAuthenticationToken(new AuthPrincipal(userId, UserTier.TIER_1), null, "ROLE_USER");
        authentication.setAuthenticated(true);
        return request -> {
            request.setUserPrincipal(authentication);
            return request;
        };
    }
}
