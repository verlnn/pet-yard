export interface PetFormState {
  name: string;
  species: string;
  breed: string;
  birthDate: string;
  ageGroup: string;
  gender: string;
  neutered: string;
  intro: string;
  photoUrl: string;
  weightKg: string;
  vaccinationComplete: string;
  walkSafetyChecked: string;
}

export interface PetVerificationState {
  dogRegNo: string;
  rfidCd: string;
  ownerNm: string;
  ownerBirth: string;
}
