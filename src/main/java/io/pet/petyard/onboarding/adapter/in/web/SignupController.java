package io.pet.petyard.onboarding.adapter.in.web;

import io.pet.petyard.onboarding.application.port.in.SignupCompleteUseCase;
import io.pet.petyard.onboarding.application.port.in.SignupConsentsUseCase;
import io.pet.petyard.onboarding.application.port.in.SignupPetUseCase;
import io.pet.petyard.onboarding.application.port.in.SignupProfileUseCase;
import io.pet.petyard.onboarding.application.port.in.SignupProgressUseCase;
import io.pet.petyard.pet.adapter.in.web.PetRegistrationRequest;
import io.pet.petyard.pet.adapter.in.web.PetRegistrationVerificationResponse;
import io.pet.petyard.pet.application.service.AnimalRegistrationResult;
import io.pet.petyard.pet.application.service.AnimalRegistrationService;
import io.pet.petyard.auth.security.ErrorResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/signup")
@Tag(name = "Signup", description = "온보딩 진행 상태 조회와 프로필/약관/반려동물 입력, 가입 완료 API")
public class SignupController {

    private static final String SIGNUP_TOKEN_HEADER = "X-Signup-Token";

    private final SignupProgressUseCase signupProgressUseCase;
    private final SignupProfileUseCase signupProfileUseCase;
    private final SignupConsentsUseCase signupConsentsUseCase;
    private final SignupPetUseCase signupPetUseCase;
    private final SignupCompleteUseCase signupCompleteUseCase;
    private final AnimalRegistrationService animalRegistrationService;

    public SignupController(SignupProgressUseCase signupProgressUseCase,
                            SignupProfileUseCase signupProfileUseCase,
                            SignupConsentsUseCase signupConsentsUseCase,
                            SignupPetUseCase signupPetUseCase,
                            SignupCompleteUseCase signupCompleteUseCase,
                            AnimalRegistrationService animalRegistrationService) {
        this.signupProgressUseCase = signupProgressUseCase;
        this.signupProfileUseCase = signupProfileUseCase;
        this.signupConsentsUseCase = signupConsentsUseCase;
        this.signupPetUseCase = signupPetUseCase;
        this.signupCompleteUseCase = signupCompleteUseCase;
        this.animalRegistrationService = animalRegistrationService;
    }

    @GetMapping("/progress")
    @Operation(summary = "온보딩 진행 상태 조회", description = "X-Signup-Token 기준으로 현재 회원가입 단계와 만료 시간을 조회합니다.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "조회 성공",
            content = @Content(schema = @Schema(implementation = SignupProgressResponse.class))),
        @ApiResponse(responseCode = "400", description = "세션 만료 또는 잘못된 토큰",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class)))
    })
    public SignupProgressResponse progress(@RequestHeader(SIGNUP_TOKEN_HEADER) String signupToken) {
        SignupProgressUseCase.SignupProgressResult result =
            signupProgressUseCase.progress(new SignupProgressUseCase.SignupProgressQuery(signupToken));
        return new SignupProgressResponse(
            result.step(),
            result.expiresAt(),
            result.hasPet(),
            result.nickname(),
            result.username(),
            result.profileImageUrl()
        );
    }

    @PostMapping("/profile")
    @Operation(summary = "온보딩 프로필 저장", description = "닉네임, 지역, 프로필 이미지, 반려동물 보유 여부를 저장합니다.")
    public SignupStepResponse profile(@RequestHeader(SIGNUP_TOKEN_HEADER) String signupToken,
                                      @Valid @RequestBody SignupProfileRequest request) {
        SignupProfileUseCase.SignupProfileResult result = signupProfileUseCase.saveProfile(
            new SignupProfileUseCase.SignupProfileCommand(
                signupToken,
                request.nickname(),
                request.username(),
                request.regionCode(),
                request.profileImageUrl(),
                request.marketingOptIn(),
                request.hasPet()
            )
        );
        return new SignupStepResponse(result.nextStep());
    }

    @PostMapping("/consents")
    @Operation(summary = "온보딩 약관 동의 저장", description = "약관 동의 상태를 저장하고 다음 단계로 진행합니다.")
    public SignupStepResponse consents(@RequestHeader(SIGNUP_TOKEN_HEADER) String signupToken,
                                       @Valid @RequestBody SignupConsentsRequest request) {
        SignupConsentsUseCase.SignupConsentsResult result = signupConsentsUseCase.saveConsents(
            new SignupConsentsUseCase.SignupConsentsCommand(
                signupToken,
                request.consents().stream()
                    .map(item -> new SignupConsentsUseCase.ConsentItem(item.code(), item.agreed()))
                    .toList()
            )
        );
        return new SignupStepResponse(result.nextStep());
    }

    @PostMapping("/pet/verify")
    @Operation(summary = "온보딩 반려동물 등록 검증", description = "가입 도중 반려동물 등록번호 정보를 검증합니다.")
    public PetRegistrationVerificationResponse verifyPet(@Valid @RequestBody PetRegistrationRequest request) {
        AnimalRegistrationResult result = animalRegistrationService.verify(
            request.dogRegNo(),
            request.rfidCd(),
            request.ownerNm(),
            request.ownerBirth()
        );

        return new PetRegistrationVerificationResponse(
            result.dogRegNo(),
            result.rfidCd(),
            result.name(),
            result.birthDate(),
            result.gender().name(),
            result.breed(),
            result.neutered(),
            result.orgName(),
            result.officeTel(),
            result.approvalStatus(),
            result.registeredAt(),
            result.approvedAt()
        );
    }

    @PostMapping("/pet")
    @Operation(summary = "온보딩 반려동물 저장", description = "검증된 반려동물 정보를 온보딩 세션에 저장합니다.")
    public SignupStepResponse pet(@RequestHeader(SIGNUP_TOKEN_HEADER) String signupToken,
                                  @Valid @RequestBody SignupPetRequest request) {
        SignupPetUseCase.SignupPetResult result = signupPetUseCase.savePet(
            new SignupPetUseCase.SignupPetCommand(
                signupToken,
                request.dogRegNo(),
                request.rfidCd(),
                request.ownerNm(),
                request.ownerBirth(),
                request.photoUrl(),
                request.weightKg(),
                request.vaccinationComplete(),
                request.walkSafetyChecked()
            )
        );
        return new SignupStepResponse(result.nextStep());
    }

    @PostMapping("/complete")
    @Operation(summary = "온보딩 완료", description = "온보딩을 완료하고 로그인 토큰을 발급합니다.")
    public SignupCompleteResponse complete(@RequestHeader(SIGNUP_TOKEN_HEADER) String signupToken) {
        SignupCompleteUseCase.SignupCompleteResult result = signupCompleteUseCase
            .complete(new SignupCompleteUseCase.SignupCompleteCommand(signupToken));
        return new SignupCompleteResponse(result.accessToken(), result.refreshToken());
    }
}
