import type { GymPackage } from "./package.type";
import type { Status } from "./common.type";

export interface Subscription {
  id: number;
  package: GymPackage;
  startDate: string;
  endDate: string;
  status: Status;
}
