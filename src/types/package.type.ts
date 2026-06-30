import type { Status } from "./common.type";

export interface GymPackage {
  id: number;
  code: string;
  name: string;
  packageType: string;
  price: number;
  durationDays: number;
  description?: string;
  status: Status;
  thumbnailUrl?: string;
}
