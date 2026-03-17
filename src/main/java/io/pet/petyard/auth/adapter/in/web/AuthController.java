package io.pet.petyard.auth.adapter.in.web;

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
import io.pet.petyard.auth.adapter.out.persistence.UserRepository;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.common.ErrorCode;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final SignUpUseCase signUpUseCase;
    private final VerifyEmailUseCase verifyEmailUseCase;
    private final ExtendEmailVerificationUseCase extendEmailUseCase;
    private final ResendEmailVerificationUseCase resendEmailUseCase;
    private final LoginUseCase loginUseCase;
    private final RefreshTokenUseCase refreshTokenUseCase;
    private final LogoutUseCase logoutUseCase;
    private final GetCurrentUserUseCase getCurrentUserUseCase;
    private final LoginLogService loginLogService;
    private final UserRepository userRepository;

    public AuthController(SignUpUseCase signUpUseCase,
                          VerifyEmailUseCase verifyEmailUseCase,
                          ExtendEmailVerificationUseCase extendEmailUseCase,
                          ResendEmailVerificationUseCase resendEmailUseCase,
                          LoginUseCase loginUseCase,
                          RefreshTokenUseCase refreshTokenUseCase,
                          LogoutUseCase logoutUseCase,
                          GetCurrentUserUseCase getCurrentUserUseCase,
                          LoginLogService loginLogService,
                          UserRepository userRepository) {
        this.signUpUseCase = signUpUseCase;
        this.verifyEmailUseCase = verifyEmailUseCase;
        this.extendEmailUseCase = extendEmailUseCase;
        this.resendEmailUseCase = resendEmailUseCase;
        this.loginUseCase = loginUseCase;
        this.refreshTokenUseCase = refreshTokenUseCase;
        this.logoutUseCase = logoutUseCase;
        this.getCurrentUserUseCase = getCurrentUserUseCase;
        this.loginLogService = loginLogService;
        this.userRepository = userRepository;
    }

    @PostMapping("/signup")
    public SignupResponse signup(@Valid @RequestBody SignupRequest request) {
        SignUpUseCase.SignupResult result = signUpUseCase
            .signup(new SignUpUseCase.SignUpCommand(request.email(), request.password()));
        return new SignupResponse(result.email(), result.expiresAt());
    }

    @PostMapping("/verify-email")
    public void verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        verifyEmailUseCase.verifyEmail(new VerifyEmailUseCase.VerifyEmailCommand(request.email(), request.code()));
    }

    @PostMapping("/extend-email")
    public VerificationExpiryResponse extendEmail(@Valid @RequestBody ExtendEmailRequest request) {
        ExtendEmailVerificationUseCase.ExtendResult result = extendEmailUseCase
            .extendEmail(new ExtendEmailVerificationUseCase.ExtendCommand(request.email()));
        return new VerificationExpiryResponse(result.expiresAt());
    }

    @PostMapping("/resend-email")
    public VerificationExpiryResponse resendEmail(@Valid @RequestBody ResendEmailRequest request) {
        ResendEmailVerificationUseCase.ResendResult result = resendEmailUseCase
            .resendEmail(new ResendEmailVerificationUseCase.ResendCommand(request.email()));
        return new VerificationExpiryResponse(result.expiresAt());
    }

    @PostMapping("/login")
    public TokenResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            AuthTokens tokens = loginUseCase.login(new LoginUseCase.LoginCommand(request.email(), request.password()));
            Long userId = userRepository.findByEmail(request.email())
                .map(user -> user.getId())
                .orElse(null);
            loginLogService.recordSuccess(httpRequest, request.email(), userId);
            return new TokenResponse(tokens.accessToken(), tokens.refreshToken());
        } catch (AuthenticationException ex) {
            loginLogService.recordFailure(httpRequest, request.email(), "UNAUTHORIZED", ex.getMessage());
            throw ex;
        } catch (AccessDeniedException ex) {
            loginLogService.recordFailure(httpRequest, request.email(), "FORBIDDEN", ex.getMessage());
            throw ex;
        } catch (RuntimeException ex) {
            loginLogService.recordFailure(httpRequest, request.email(), "INTERNAL_ERROR", ex.getMessage());
            throw ex;
        }
    }

    @PostMapping("/refresh")
    public TokenResponse refresh(@Valid @RequestBody RefreshRequest request) {
        AuthTokens tokens = refreshTokenUseCase.refresh(new RefreshTokenUseCase.RefreshTokenCommand(request.refreshToken()));
        return new TokenResponse(tokens.accessToken(), tokens.refreshToken());
    }

    @PostMapping("/logout")
    public void logout(@Valid @RequestBody LogoutRequest request) {
        logoutUseCase.logout(new LogoutUseCase.LogoutCommand(request.refreshToken()));
    }

    @GetMapping("/me")
    public MeResponse me(@AuthenticationPrincipal AuthPrincipal principal) {
        if (principal == null) {
            throw new AuthenticationCredentialsNotFoundException(ErrorCode.UNAUTHORIZED.message());
        }
        GetCurrentUserUseCase.CurrentUserResult result = getCurrentUserUseCase
            .getCurrentUser(new GetCurrentUserUseCase.CurrentUserQuery(principal.userId(), principal.tier()));
        return new MeResponse(result.userId(), result.tier(), result.permissions());
    }
}
