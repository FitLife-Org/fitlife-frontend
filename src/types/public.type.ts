export interface PublicPackage {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  hasAiWorkoutPlan: boolean;
  hasNutritionPlan: boolean;
  ptSessionsPerMonth: number;
  features: string[];
  isPopular?: boolean;
}

export interface PublicTrainer {
  id: string;
  fullName: string;
  avatarUrl: string;
  specialties: string[];
  experienceYears: number;
  bio: string;
}

export interface HomeData {
  stats: {
    totalMembers: number;
    activeTrainers: number;
    totalEquipment: number;
    yearsOfExperience: number;
  };
  featuredPackages: PublicPackage[];
  featuredTrainers: PublicTrainer[];
}

export interface ContactRequestForm {
  fullName: string;
  phoneNumber: string;
  email: string;
  message: string;
}
