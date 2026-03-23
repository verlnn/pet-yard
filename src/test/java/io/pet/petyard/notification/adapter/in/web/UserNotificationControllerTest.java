package io.pet.petyard.notification.adapter.in.web;

import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.pet.petyard.auth.adapter.in.web.AuthApiExceptionHandler;
import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.auth.security.SecurityExceptionHandler;
import io.pet.petyard.common.adapter.in.web.GlobalExceptionHandler;
import io.pet.petyard.common.application.service.ErrorLogService;
import io.pet.petyard.notification.application.service.NotificationApplicationService;
import io.pet.petyard.support.WebMvcSliceTestConfig;
import io.pet.petyard.user.application.service.GuardianRegistrationService;
import io.pet.petyard.user.domain.GuardianRelationStatus;
import java.time.Instant;
import java.util.List;
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

@WebMvcTest(UserNotificationController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({AuthApiExceptionHandler.class, SecurityExceptionHandler.class, GlobalExceptionHandler.class, WebMvcSliceTestConfig.class})
class UserNotificationControllerTest {

    @org.springframework.beans.factory.annotation.Autowired
    private MockMvc mockMvc;

    @MockitoBean private NotificationApplicationService notificationApplicationService;
    @MockitoBean private GuardianRegistrationService guardianRegistrationService;
    @MockitoBean private ErrorLogService errorLogService;

    @Test
    @DisplayName("알림 목록 조회는 집사 요청 알림을 반환한다")
    void listReturnsNotifications() throws Exception {
        given(notificationApplicationService.listNotifications(11L)).willReturn(List.of(
            new UserNotificationResponse(
                101L,
                "GUARDIAN_REQUEST",
                "UNREAD",
                22L,
                "guardian.two",
                "보리집사",
                "/profile.jpg",
                "보리집사님이 집사 요청을 보냈어요",
                Instant.parse("2026-03-23T12:00:00Z"),
                true,
                "수락",
                "거절"
            )
        ));

        mockMvc.perform(get("/api/notifications").with(authPrincipalRequest(11L)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].type").value("GUARDIAN_REQUEST"))
            .andExpect(jsonPath("$[0].actionable").value(true))
            .andExpect(jsonPath("$[0].primaryActionLabel").value("수락"));
    }

    @Test
    @DisplayName("알림에서 집사 요청 수락이 가능하다")
    void acceptGuardianRequest() throws Exception {
        given(guardianRegistrationService.acceptFromNotification(11L, 101L))
            .willReturn(GuardianRelationStatus.CONNECTED);

        mockMvc.perform(post("/api/notifications/101/guardians/accept").with(authPrincipalRequest(11L)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.notificationId").value(101))
            .andExpect(jsonPath("$.guardianRelationStatus").value("CONNECTED"));
    }

    @Test
    @DisplayName("알림에서 집사 요청 거절이 가능하다")
    void rejectGuardianRequest() throws Exception {
        given(guardianRegistrationService.rejectFromNotification(11L, 101L))
            .willReturn(GuardianRelationStatus.NONE);

        mockMvc.perform(post("/api/notifications/101/guardians/reject").with(authPrincipalRequest(11L)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.guardianRelationStatus").value("NONE"));
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
