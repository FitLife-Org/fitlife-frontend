import type { Role, Status } from "./common.type";

export interface User {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: Role;
  status: Status;
}
