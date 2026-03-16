package io.pet.petyard.onboarding.application.port.in;

public interface SignupProgressUseCase {
    SignupProgressResult progress(SignupProgressQuery query);

    record SignupProgressQuery(String signupToken) {
    }

    record SignupProgressResult(String step, String expiresAt, boolean hasPet) {
    }
}
