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
import io.pet.petyard.auth.domain.model.User;
import io.pet.petyard.auth.security.AuthPrincipal;
import io.pet.petyard.common.ErrorCode;
import io.pet.petyard.auth.security.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

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
@Tag(name = "Auth", description = "이메일 회원가입, 로그인, 토큰 재발급, 현재 사용자 조회 API")
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
    @Operation(summary = "이메일 회원가입", description = "이메일과 비밀번호로 계정을 생성하고 이메일 인증 코드를 발송합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "회원가입 성공",
            content = @Content(schema = @Schema(implementation = SignupResponse.class))),
        @ApiResponse(responseCode = "400", description = "잘못된 요청 또는 이미 가입된 이메일",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "500", description = "서버 오류",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public SignupResponse signup(@Valid @RequestBody SignupRequest request) {
        SignUpUseCase.SignupResult result = signUpUseCase
            .signup(new SignUpUseCase.SignUpCommand(request.email(), request.password()));
        return new SignupResponse(result.email(), result.expiresAt());
    }

    @PostMapping("/verify-email")
    @Operation(summary = "이메일 인증 코드 확인", description = "이메일로 발송된 인증 코드를 확인해 계정을 활성화합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "인증 성공"),
        @ApiResponse(responseCode = "400", description = "인증 코드 오류 또는 만료",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "인증 시도 횟수 초과",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public void verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        verifyEmailUseCase.verifyEmail(new VerifyEmailUseCase.VerifyEmailCommand(request.email(), request.code()));
    }

    @PostMapping("/extend-email")
    @Operation(summary = "이메일 인증 만료 연장", description = "아직 만료되지 않은 이메일 인증의 만료 시간을 연장합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "연장 성공",
            content = @Content(schema = @Schema(implementation = VerificationExpiryResponse.class))),
        @ApiResponse(responseCode = "400", description = "연장할 수 없는 상태",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public VerificationExpiryResponse extendEmail(@Valid @RequestBody ExtendEmailRequest request) {
        ExtendEmailVerificationUseCase.ExtendResult result = extendEmailUseCase
            .extendEmail(new ExtendEmailVerificationUseCase.ExtendCommand(request.email()));
        return new VerificationExpiryResponse(result.expiresAt());
    }

    @PostMapping("/resend-email")
    @Operation(summary = "이메일 인증 코드 재발송", description = "만료된 이메일 인증 코드를 새로 발급해 다시 전송합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "재발송 성공",
            content = @Content(schema = @Schema(implementation = VerificationExpiryResponse.class))),
        @ApiResponse(responseCode = "400", description = "재발송할 수 없는 상태",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public VerificationExpiryResponse resendEmail(@Valid @RequestBody ResendEmailRequest request) {
        ResendEmailVerificationUseCase.ResendResult result = resendEmailUseCase
            .resendEmail(new ResendEmailVerificationUseCase.ResendCommand(request.email()));
        return new VerificationExpiryResponse(result.expiresAt());
    }

    @PostMapping("/login")
    @Operation(summary = "로그인", description = "이메일/비밀번호 인증 후 access token과 refresh token을 발급합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "로그인 성공",
            content = @Content(schema = @Schema(implementation = TokenResponse.class))),
        @ApiResponse(responseCode = "400", description = "요청 값 검증 실패",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "401", description = "이메일 또는 비밀번호 불일치",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))),
        @ApiResponse(responseCode = "403", description = "계정이 아직 활성화되지 않음",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public TokenResponse login(@Valid @RequestBody LoginRequest request, HttpServletRequest httpRequest) {
        try {
            AuthTokens tokens = loginUseCase.login(new LoginUseCase.LoginCommand(request.email(), request.password()));
            Long userId = userRepository.findByEmail(request.email())
                .map(User::getId)
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
    @Operation(summary = "토큰 재발급", description = "refresh token을 검증하고 access token과 refresh token을 회전 발급합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "재발급 성공",
            content = @Content(schema = @Schema(implementation = TokenResponse.class))),
        @ApiResponse(responseCode = "401", description = "유효하지 않은 refresh token",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public TokenResponse refresh(@Valid @RequestBody RefreshRequest request) {
        AuthTokens tokens = refreshTokenUseCase.refresh(new RefreshTokenUseCase.RefreshTokenCommand(request.refreshToken()));
        return new TokenResponse(tokens.accessToken(), tokens.refreshToken());
    }

    @PostMapping("/logout")
    @Operation(summary = "로그아웃", description = "refresh token을 폐기해 더 이상 재발급에 사용할 수 없도록 합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "로그아웃 성공"),
        @ApiResponse(responseCode = "401", description = "유효하지 않은 refresh token",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public void logout(@Valid @RequestBody LogoutRequest request) {
        logoutUseCase.logout(new LogoutUseCase.LogoutCommand(request.refreshToken()));
    }

    @GetMapping("/me")
    @Operation(summary = "현재 로그인 사용자 조회", description = "현재 access token의 사용자와 권한 정보를 반환합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(schema = @Schema(implementation = MeResponse.class))),
        @ApiResponse(responseCode = "401", description = "인증 필요",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public MeResponse me(@AuthenticationPrincipal AuthPrincipal principal) {
        if (principal == null) {
            throw new AuthenticationCredentialsNotFoundException(ErrorCode.UNAUTHORIZED.message());
        }
        GetCurrentUserUseCase.CurrentUserResult result = getCurrentUserUseCase
            .getCurrentUser(new GetCurrentUserUseCase.CurrentUserQuery(principal.userId(), principal.tier()));
        return new MeResponse(result.userId(), result.tier(), result.permissions());
    }
}
