package io.pet.petyard.onboarding.adapter.in.web;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.pet.petyard.auth.application.port.out.LoadUserPort;
import io.pet.petyard.auth.application.service.LoginLogService;
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.auth.jwt.AccessClaims;
import io.pet.petyard.auth.jwt.JwtTokenProvider;
import io.pet.petyard.common.ApiException;
import io.pet.petyard.onboarding.application.port.in.OAuthCallbackUseCase;
import io.pet.petyard.onboarding.application.port.in.OAuthStartUseCase;
import io.pet.petyard.auth.security.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/oauth")
@Tag(name = "OAuth", description = "소셜 로그인 시작 및 콜백 처리 API")
public class OAuthController {

    private static final Logger log = LoggerFactory.getLogger(OAuthController.class);

    private final OAuthStartUseCase oAuthStartUseCase;
    private final OAuthCallbackUseCase oAuthCallbackUseCase;
    private final JwtTokenProvider tokenProvider;
    private final LoadUserPort loadUserPort;
    private final LoginLogService loginLogService;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public OAuthController(OAuthStartUseCase oAuthStartUseCase,
                           OAuthCallbackUseCase oAuthCallbackUseCase,
                           JwtTokenProvider tokenProvider,
                           LoadUserPort loadUserPort,
                           LoginLogService loginLogService) {
        this.oAuthStartUseCase = oAuthStartUseCase;
        this.oAuthCallbackUseCase = oAuthCallbackUseCase;
        this.tokenProvider = tokenProvider;
        this.loadUserPort = loadUserPort;
        this.loginLogService = loginLogService;
    }

    @PostMapping("/{provider}/start")
    @Operation(summary = "소셜 로그인 시작", description = "소셜 로그인 인가 URL과 state를 발급합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "인가 URL 발급 성공",
            content = @Content(schema = @Schema(implementation = OAuthStartResponse.class))),
        @ApiResponse(responseCode = "400", description = "지원하지 않는 provider",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public OAuthStartResponse start(@PathVariable String provider,
                                    @RequestParam(required = false) String prompt) {
        OAuthStartUseCase.OAuthStartResult result = oAuthStartUseCase
            .start(new OAuthStartUseCase.OAuthStartCommand(provider, prompt));
        log.info("OAuth start provider={}, state={}, prompt={}, expiresAt={}, authorizeUrl={}",
            provider, result.state(), prompt, result.expiresAt(), result.authorizeUrl());
        return new OAuthStartResponse(result.authorizeUrl(), result.state(), result.expiresAt());
    }

    @GetMapping("/{provider}/callback")
    @Operation(summary = "소셜 로그인 콜백", description = "인가 코드를 처리하고 로그인 완료 또는 온보딩 세션 정보를 반환합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "처리 성공",
            content = @Content(schema = @Schema(implementation = OAuthCallbackResponse.class))),
        @ApiResponse(responseCode = "400", description = "state 불일치 또는 OAuth 처리 실패",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public ResponseEntity<?> callback(@PathVariable String provider,
                                      @Parameter(description = "OAuth 인가 코드", example = "kakao-auth-code")
                                      @RequestParam String code,
                                      @Parameter(description = "start 단계에서 발급된 state 값")
                                      @RequestParam String state,
                                      @Parameter(description = "프론트 redirect URI", required = false)
                                      @RequestParam(required = false) String redirectUri,
                                      @RequestHeader(value = "Accept", required = false) String accept,
                                      HttpServletRequest httpRequest) {
        boolean wantsHtml = redirectUri == null || (accept != null && accept.contains(MediaType.TEXT_HTML_VALUE));
        log.info("OAuth callback provider={}, state={}, redirectUri={}, accept={}, wantsHtml={}, codePrefix={}",
            provider, state, redirectUri, accept, wantsHtml, safePrefix(code, 10));
        try {
            OAuthCallbackUseCase.OAuthCallbackResult result = oAuthCallbackUseCase
                .handle(new OAuthCallbackUseCase.OAuthCallbackCommand(provider, code, state, redirectUri));
            OAuthCallbackResponse response = new OAuthCallbackResponse(result.status(), result.signupToken(),
                result.nextStep(), result.accessToken(), result.refreshToken());
            recordSocialLoginIfNeeded(httpRequest, response);
            log.info("OAuth callback success provider={}, status={}, nextStep={}",
                provider, result.status(), result.nextStep());
            if (wantsHtml) {
                return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(buildPopupSuccess(provider, response));
            }
            return ResponseEntity.ok(response);
        } catch (ApiException ex) {
            log.warn("OAuth callback failed provider={}, message={}", provider, ex.getMessage());
            if (wantsHtml) {
                return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(buildPopupError(provider, ex.getMessage()));
            }
            throw ex;
        }
    }

    private String buildPopupSuccess(String provider, OAuthCallbackResponse response) {
        String payload = toJson(response);
        return """
            <!doctype html>
            <html>
              <body>
                <script>
                  (function () {
                    var payload = %s;
                    if (window.opener && window.opener !== window) {
                      window.opener.postMessage({ type: "oauth:success", provider: "%s", payload: payload }, "*");
                    }
                    window.close();
                  })();
                </script>
              </body>
            </html>
            """.formatted(payload, provider);
    }

    private String buildPopupError(String provider, String message) {
        String safeMessage = message == null ? "소셜 로그인을 완료하지 못했습니다." : message;
        return """
            <!doctype html>
            <html>
              <body>
                <script>
                  (function () {
                    if (window.opener && window.opener !== window) {
                      window.opener.postMessage(
                        { type: "oauth:error", provider: "%s", error: "%s" },
                        "*"
                      );
                    }
                    window.close();
                  })();
                </script>
              </body>
            </html>
            """.formatted(provider, safeMessage.replace("\"", "\\\""));
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Failed to serialize OAuth response", ex);
        }
    }

    private String safePrefix(String value, int max) {
        if (value == null || value.isBlank()) {
            return "null";
        }
        int end = Math.min(value.length(), max);
        return value.substring(0, end);
    }

    private void recordSocialLoginIfNeeded(HttpServletRequest request, OAuthCallbackResponse response) {
        if (!"LOGIN".equals(response.status()) || response.accessToken() == null) {
            return;
        }
        try {
            AccessClaims claims = tokenProvider.validateAndParseAccessToken(response.accessToken());
            User user = loadUserPort.findById(claims.userId()).orElse(null);
            if (user == null) {
                return;
            }
            loginLogService.recordSuccess(request, user.getEmail(), user.getId());
        } catch (Exception ex) {
            log.warn("Failed to record oauth login log", ex);
        }
    }
}
