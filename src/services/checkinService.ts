import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { CheckinRecord } from "../types/checkin.type";

export const checkinService = {
  async getMyCheckins(): Promise<CheckinRecord[]> {
    const response = await apiClient.get<ApiResponse<CheckinRecord[]>>("/checkins/me");
    return response.data.data as CheckinRecord[];
  },
};
