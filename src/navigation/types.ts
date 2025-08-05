// src/navigation/types.ts

export type RootStackParamList = {
  MainTabs: undefined;
  AddBeneficiary: undefined;
  AddSeller: undefined;
  AddCattle: { beneficiary_id: string };
  BeneficiaryProfile: { beneficiary_id: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};
