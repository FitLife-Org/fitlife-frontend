import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { Equipment } from "../types/equipment.type";

export const equipmentService = {
  async getEquipment(): Promise<Equipment[]> {
    const response = await apiClient.get<ApiResponse<Equipment[]>>("/equipment");
    return response.data.data;
  },
};
