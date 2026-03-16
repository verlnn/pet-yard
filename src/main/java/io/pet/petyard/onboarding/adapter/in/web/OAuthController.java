package io.pet.petyard.onboarding.adapter.in.web;

import io.pet.petyard.common.ApiException;
import io.pet.petyard.onboarding.application.port.in.OAuthCallbackUseCase;
import io.pet.petyard.onboarding.application.port.in.OAuthStartUseCase;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

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
public class OAuthController {

    private final OAuthStartUseCase oAuthStartUseCase;
    private final OAuthCallbackUseCase oAuthCallbackUseCase;
    private final ObjectMapper objectMapper;

    public OAuthController(OAuthStartUseCase oAuthStartUseCase,
                           OAuthCallbackUseCase oAuthCallbackUseCase,
                           ObjectMapper objectMapper) {
        this.oAuthStartUseCase = oAuthStartUseCase;
        this.oAuthCallbackUseCase = oAuthCallbackUseCase;
        this.objectMapper = objectMapper;
    }

    @PostMapping("/{provider}/start")
    public OAuthStartResponse start(@PathVariable String provider) {
        OAuthStartUseCase.OAuthStartResult result = oAuthStartUseCase
            .start(new OAuthStartUseCase.OAuthStartCommand(provider));
        return new OAuthStartResponse(result.authorizeUrl(), result.state(), result.expiresAt());
    }

    @GetMapping("/{provider}/callback")
    public ResponseEntity<?> callback(@PathVariable String provider,
                                      @RequestParam String code,
                                      @RequestParam String state,
                                      @RequestParam(required = false) String redirectUri,
                                      @RequestHeader(value = "Accept", required = false) String accept) {
        boolean wantsHtml = redirectUri == null || (accept != null && accept.contains(MediaType.TEXT_HTML_VALUE));
        try {
            OAuthCallbackUseCase.OAuthCallbackResult result = oAuthCallbackUseCase
                .handle(new OAuthCallbackUseCase.OAuthCallbackCommand(provider, code, state, redirectUri));
            OAuthCallbackResponse response = new OAuthCallbackResponse(result.status(), result.signupToken(),
                result.nextStep(), result.accessToken(), result.refreshToken());
            if (wantsHtml) {
                return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_HTML)
                    .body(buildPopupSuccess(provider, response));
            }
            return ResponseEntity.ok(response);
        } catch (ApiException ex) {
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
}
