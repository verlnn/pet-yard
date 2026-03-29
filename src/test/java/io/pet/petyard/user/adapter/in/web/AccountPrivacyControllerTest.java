package io.pet.petyard.user.adapter.in.web;

import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.pet.petyard.auth.adapter.in.web.AuthApiExceptionHandler;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.auth.security.SecurityExceptionHandler;
import io.pet.petyard.common.adapter.in.web.GlobalExceptionHandler;
import io.pet.petyard.common.application.service.ErrorLogService;
import io.pet.petyard.support.WebMvcSliceTestConfig;
import io.pet.petyard.user.application.port.in.UpdateAccountPrivacyUseCase;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.TestingAuthenticationToken;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AccountPrivacyController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({AuthApiExceptionHandler.class, SecurityExceptionHandler.class, GlobalExceptionHandler.class, WebMvcSliceTestConfig.class})
class AccountPrivacyControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean private UpdateAccountPrivacyUseCase updateAccountPrivacyUseCase;
    @MockitoBean private ErrorLogService errorLogService;

    @Test
    @DisplayName("비공개 설정으로 변경하면 useCase가 isPrivate=true로 호출된다")
    void patchPrivacyToPrivateCallsUseCaseWithTrue() throws Exception {
        mockMvc.perform(
                patch("/api/v1/users/me/privacy")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"isPrivate\": true}")
                    .principal(new TestingAuthenticationToken(new AuthPrincipal(11L, UserTier.TIER_0), null))
            )
            .andExpect(status().isNoContent());

        verify(updateAccountPrivacyUseCase).updatePrivacy(eq(11L), eq(true));
    }

    @Test
    @DisplayName("공개 설정으로 변경하면 useCase가 isPrivate=false로 호출된다")
    void patchPrivacyToPublicCallsUseCaseWithFalse() throws Exception {
        mockMvc.perform(
                patch("/api/v1/users/me/privacy")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"isPrivate\": false}")
                    .principal(new TestingAuthenticationToken(new AuthPrincipal(11L, UserTier.TIER_0), null))
            )
            .andExpect(status().isNoContent());

        verify(updateAccountPrivacyUseCase).updatePrivacy(eq(11L), eq(false));
    }

    @Test
    @DisplayName("isPrivate 필드가 null이면 400을 반환한다")
    void patchPrivacyWithNullIsPrivateReturns400() throws Exception {
        mockMvc.perform(
                patch("/api/v1/users/me/privacy")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content("{\"isPrivate\": null}")
                    .principal(new TestingAuthenticationToken(new AuthPrincipal(11L, UserTier.TIER_0), null))
            )
            .andExpect(status().isBadRequest());
    }
}
