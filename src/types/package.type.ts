import type { Status } from "./common.type";

export interface GymPackage {
  id: number;
  name: string;
  description?: string;
  durationDays: number;
  price: number;
  status: Status;
}
