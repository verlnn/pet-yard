package io.pet.petyard.auth.web;

import io.pet.petyard.auth.domain.UserTier;
import io.pet.petyard.auth.jwt.JwtTokenProvider;
import io.pet.petyard.auth.security.AuthPrincipal;

import java.util.LinkedHashMap;
import java.util.Map;

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

    private final JwtTokenProvider tokenProvider;
    private final AuthUserStore userStore;

    public AuthController(JwtTokenProvider tokenProvider, AuthUserStore userStore) {
        this.tokenProvider = tokenProvider;
        this.userStore = userStore;
    }

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody LoginRequest request) {
        UserTier tier = userStore.findTier(request.userId())
            .orElseThrow(() -> new AuthenticationCredentialsNotFoundException("Invalid credentials"));

        String token = tokenProvider.createAccessToken(request.userId(), tier);

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("accessToken", token);
        return body;
    }

    @GetMapping("/me")
    public Map<String, Object> me(@AuthenticationPrincipal AuthPrincipal principal) {
        if (principal == null) {
            throw new AuthenticationCredentialsNotFoundException("Authentication required");
        }

        Map<String, Object> body = new LinkedHashMap<>();
        body.put("userId", principal.userId());
        body.put("tier", principal.tier().name());
        body.put("permissions", principal.permissions());
        return body;
    }
}
