import type { UserStatus } from "./user.type";

export interface Trainer {
  id: number;
  userId?: number;
  trainerCode?: string;
  username?: string;
  fullName: string;
  specialty?: string;
  specialization?: string;
  experienceYears?: number;
  certifications?: string;
  bio?: string;
  phone?: string;
  email?: string;
  status?: UserStatus;
  isAcceptingMembers?: boolean;
  assignmentStatus?: "PENDING" | "ACTIVE" | "PENDING_CANCEL";
  assignmentId?: number;
}

export interface TrainerAssignmentRequest {
  assignmentId: number;
  memberId: number;
  memberCode: string;
  fullName: string;
  phone?: string;
  avatarUrl?: string;
  packageName: string;
  requestType: "NEW_ASSIGNMENT" | "CANCEL_ASSIGNMENT";
  status: "PENDING" | "PENDING_CANCEL";
  createdAt: string;
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
