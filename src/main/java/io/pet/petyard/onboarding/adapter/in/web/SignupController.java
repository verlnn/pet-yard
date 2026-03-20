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

import jakarta.validation.Valid;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth/signup")
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
    public SignupProgressResponse progress(@RequestHeader(SIGNUP_TOKEN_HEADER) String signupToken) {
        SignupProgressUseCase.SignupProgressResult result =
            signupProgressUseCase.progress(new SignupProgressUseCase.SignupProgressQuery(signupToken));
        return new SignupProgressResponse(
            result.step(),
            result.expiresAt(),
            result.hasPet(),
            result.nickname(),
            result.profileImageUrl()
        );
    }

    @PostMapping("/profile")
    public SignupStepResponse profile(@RequestHeader(SIGNUP_TOKEN_HEADER) String signupToken,
                                      @Valid @RequestBody SignupProfileRequest request) {
        SignupProfileUseCase.SignupProfileResult result = signupProfileUseCase.saveProfile(
            new SignupProfileUseCase.SignupProfileCommand(
                signupToken,
                request.nickname(),
                request.regionCode(),
                request.profileImageUrl(),
                request.marketingOptIn(),
                request.hasPet()
            )
        );
        return new SignupStepResponse(result.nextStep());
    }

    @PostMapping("/consents")
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
    public SignupCompleteResponse complete(@RequestHeader(SIGNUP_TOKEN_HEADER) String signupToken) {
        SignupCompleteUseCase.SignupCompleteResult result = signupCompleteUseCase
            .complete(new SignupCompleteUseCase.SignupCompleteCommand(signupToken));
        return new SignupCompleteResponse(result.accessToken(), result.refreshToken());
    }
}
