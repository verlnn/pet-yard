package io.pet.petyard.onboarding.application.port.in;

import java.time.LocalDate;

public interface SignupPetUseCase {
    SignupPetResult savePet(SignupPetCommand command);

    record SignupPetCommand(
        String signupToken,
        String name,
        String species,
        String breed,
        LocalDate birthDate,
        String ageGroup,
        String gender,
        Boolean neutered,
        String intro,
        String photoUrl
    ) {
    }

    record SignupPetResult(String nextStep) {
    }
}
