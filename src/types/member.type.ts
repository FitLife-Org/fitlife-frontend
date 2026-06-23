import type { Status } from "./common.type";

export interface MemberProfile {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  gender?: string;
  dateOfBirth?: string;
  height?: number;
  weight?: number;
  status: Status;
}

export interface BodyMetric {
  id: number;
  measuredAt: string;
  height: number;
  weight: number;
  bmi?: number;
  bodyFat?: number;
}
