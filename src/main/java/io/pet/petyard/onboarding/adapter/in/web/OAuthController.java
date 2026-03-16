package io.pet.petyard.onboarding.adapter.in.web;

import io.pet.petyard.onboarding.application.port.in.OAuthCallbackUseCase;
import io.pet.petyard.onboarding.application.port.in.OAuthStartUseCase;

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

    public OAuthController(OAuthStartUseCase oAuthStartUseCase, OAuthCallbackUseCase oAuthCallbackUseCase) {
        this.oAuthStartUseCase = oAuthStartUseCase;
        this.oAuthCallbackUseCase = oAuthCallbackUseCase;
    }

    @PostMapping("/{provider}/start")
    public OAuthStartResponse start(@PathVariable String provider) {
        OAuthStartUseCase.OAuthStartResult result = oAuthStartUseCase
            .start(new OAuthStartUseCase.OAuthStartCommand(provider));
        return new OAuthStartResponse(result.authorizeUrl(), result.state(), result.expiresAt());
    }

    @GetMapping("/{provider}/callback")
    public OAuthCallbackResponse callback(@PathVariable String provider,
                                          @RequestParam String code,
                                          @RequestParam String state,
                                          @RequestParam(required = false) String redirectUri) {
        OAuthCallbackUseCase.OAuthCallbackResult result = oAuthCallbackUseCase
            .handle(new OAuthCallbackUseCase.OAuthCallbackCommand(provider, code, state, redirectUri));
        return new OAuthCallbackResponse(result.status(), result.signupToken(), result.nextStep(),
            result.accessToken(), result.refreshToken());
    }
}
