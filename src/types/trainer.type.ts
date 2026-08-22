export interface Trainer {
  id: number;
  userId?: number;
  trainerCode?: string;
  fullName: string;
  specialty?: string;
  phone?: string;
  email?: string;
}

export interface TrainerMember {
  id: number;
  userId: number;
  fullName: string;
  avatarUrl?: string;
  phone?: string;
  packageName: string;
  status: "ACTIVE" | "INACTIVE";
  sessionsTotal: number;
  sessionsCompleted: number;
  joinDate: string;
}

export interface TrainerSession {
  id: number;
  memberId: number;
  memberName: string;
  date: string;
  startTime: string;
  endTime: string;
  status: "SCHEDULED" | "COMPLETED" | "CANCELLED";
  notes?: string;
}

export interface WorkoutProgress {
  memberId: number;
  weight: number;
  bodyFatPercentage: number;
  muscleMass: number;
  lastUpdated: string;
  goals: {
    targetWeight: number;
    description: string;
  };
}
