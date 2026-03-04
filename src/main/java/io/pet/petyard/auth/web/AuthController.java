package io.pet.petyard.auth.web;

import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.auth.service.AuthService;
import io.pet.petyard.common.ErrorCode;

import java.util.Set;

import jakarta.validation.Valid;

import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public void signup(@Valid @RequestBody SignupRequest request) {
        authService.signup(request.email(), request.password());
    }

    @PostMapping("/verify-email")
    public void verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        authService.verifyEmail(request.email(), request.code());
    }

    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest request) {
        AuthService.TokenPair tokens = authService.login(request.email(), request.password());
        return new TokenResponse(tokens.accessToken(), tokens.refreshToken());
    }

    @PostMapping("/refresh")
    public TokenResponse refresh(@Valid @RequestBody RefreshRequest request) {
        AuthService.TokenPair tokens = authService.refresh(request.refreshToken());
        return new TokenResponse(tokens.accessToken(), tokens.refreshToken());
    }

    @PostMapping("/logout")
    public void logout(@Valid @RequestBody LogoutRequest request) {
        authService.logout(request.refreshToken());
    }

    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal AuthPrincipal principal) {
        if (principal == null) {
            throw new AuthenticationCredentialsNotFoundException(ErrorCode.UNAUTHORIZED.message());
        }
        Set<String> permissions = principal.permissions().stream()
            .map(Enum::name)
            .collect(java.util.stream.Collectors.toCollection(java.util.LinkedHashSet::new));
        return new MeResponse(principal.userId(), principal.tier().name(), permissions);
    }
}
