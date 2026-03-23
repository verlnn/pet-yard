package io.pet.petyard.onboarding.application.port.in;

public interface SignupProfileUseCase {
    SignupUsernameValidationResult validateUsername(SignupUsernameValidationCommand command);

    SignupProfileResult saveProfile(SignupProfileCommand command);

    record SignupUsernameValidationCommand(
        String signupToken,
        String username
    ) {
    }

    record SignupUsernameValidationResult(String username) {
    }

    record SignupProfileCommand(
        String signupToken,
        String nickname,
        String username,
        String regionCode,
        String profileImageUrl,
        boolean marketingOptIn,
        boolean hasPet
    ) {
    }

    record SignupProfileResult(String nextStep) {
    }
}
