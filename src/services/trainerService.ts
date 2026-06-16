import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { Trainer } from "../types/trainer.type";

export const trainerService = {
  async getTrainers(): Promise<Trainer[]> {
    const response = await apiClient.get<ApiResponse<Trainer[]>>("/trainers");
    return response.data.data;
  },
};
