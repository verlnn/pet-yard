package io.pet.petyard.onboarding.application.port.in;

public interface SignupCompleteUseCase {
    SignupCompleteResult complete(SignupCompleteCommand command);

    record SignupCompleteCommand(String signupToken) {
    }

    record SignupCompleteResult(String accessToken, String refreshToken) {
    }
}
