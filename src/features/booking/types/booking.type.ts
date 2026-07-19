export interface Booking {
  id: number;
  trainerId: number;
  memberId: number;
  startsAt: string;
  endsAt: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
}
