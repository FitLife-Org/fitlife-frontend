import type { Status } from "./common.type";

export interface Equipment {
  id: number;
  name: string;
  location?: string;
  status: Status | "MAINTENANCE";
}
