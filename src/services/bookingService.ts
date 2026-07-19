import apiClient from "../lib/apiClient";
import type { ApiResponse } from "../types/common.type";
import type { Booking } from "../types/booking.type";

export const bookingService = {
  async getMyBookings(): Promise<Booking[]> {
    const response = await apiClient.get<ApiResponse<Booking[]>>("/bookings/me");
    return response.data.data as Booking[];
  },
};
