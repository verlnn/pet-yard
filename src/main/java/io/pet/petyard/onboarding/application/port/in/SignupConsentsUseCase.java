package io.pet.petyard.onboarding.application.port.in;

import java.util.List;

public interface SignupConsentsUseCase {
    SignupConsentsResult saveConsents(SignupConsentsCommand command);

    record ConsentItem(String code, boolean agreed) {
    }

    record SignupConsentsCommand(String signupToken, List<ConsentItem> consents) {
    }

    record SignupConsentsResult(String nextStep) {
    }
}
