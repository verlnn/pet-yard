package io.pet.petyard.onboarding.adapter.in.web;

import io.pet.petyard.onboarding.application.port.in.SignupCompleteUseCase;
import io.pet.petyard.onboarding.application.port.in.SignupConsentsUseCase;
import io.pet.petyard.onboarding.application.port.in.SignupPetUseCase;
import io.pet.petyard.onboarding.application.port.in.SignupProfileUseCase;
import io.pet.petyard.onboarding.application.port.in.SignupProgressUseCase;

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

    public SignupController(SignupProgressUseCase signupProgressUseCase,
                            SignupProfileUseCase signupProfileUseCase,
                            SignupConsentsUseCase signupConsentsUseCase,
                            SignupPetUseCase signupPetUseCase,
                            SignupCompleteUseCase signupCompleteUseCase) {
        this.signupProgressUseCase = signupProgressUseCase;
        this.signupProfileUseCase = signupProfileUseCase;
        this.signupConsentsUseCase = signupConsentsUseCase;
        this.signupPetUseCase = signupPetUseCase;
        this.signupCompleteUseCase = signupCompleteUseCase;
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

    @PostMapping("/pet")
    public SignupStepResponse pet(@RequestHeader(SIGNUP_TOKEN_HEADER) String signupToken,
                                  @Valid @RequestBody SignupPetRequest request) {
        SignupPetUseCase.SignupPetResult result = signupPetUseCase.savePet(
            new SignupPetUseCase.SignupPetCommand(
                signupToken,
                request.name(),
                request.species(),
                request.breed(),
                request.birthDate(),
                request.ageGroup(),
                request.gender(),
                request.neutered(),
                request.intro(),
                request.photoUrl()
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
