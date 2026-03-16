package io.pet.petyard.onboarding.application.port.in;

public interface SignupProfileUseCase {
    SignupProfileResult saveProfile(SignupProfileCommand command);

    record SignupProfileCommand(
        String signupToken,
        String nickname,
        String regionCode,
        String profileImageUrl,
        boolean marketingOptIn,
        boolean hasPet
    ) {
    }

    record SignupProfileResult(String nextStep) {
    }
}
