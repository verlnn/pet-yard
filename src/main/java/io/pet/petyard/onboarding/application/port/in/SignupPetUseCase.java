package io.pet.petyard.onboarding.application.port.in;

public interface SignupPetUseCase {
    SignupPetResult savePet(SignupPetCommand command);

    record SignupPetCommand(
        String signupToken,
        String dogRegNo,
        String rfidCd,
        String ownerNm,
        String ownerBirth,
        String photoUrl,
        Double weightKg,
        Boolean vaccinationComplete,
        Boolean walkSafetyChecked
    ) {
    }

    record SignupPetResult(String nextStep) {
    }
}
