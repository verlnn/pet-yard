package io.pet.petyard.onboarding.application.port.in;

public interface SignupPetUseCase {
    SignupPetResult savePet(SignupPetCommand command);

    record SignupPetCommand(
        String signupToken,
        String dogRegNo,
        String rfidCd,
        String ownerNm,
        String ownerBirth,
        String intro,
        String photoUrl
    ) {
    }

    record SignupPetResult(String nextStep) {
    }
}
