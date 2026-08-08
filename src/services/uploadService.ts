import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";

export interface UploadResult {
  url: string;
  fileName?: string;
}

export const uploadService = {
  async upload(file: File): Promise<UploadResult> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post<ApiResponse<UploadResult>>("/uploads/images", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return response.data.data as UploadResult;
  },
};
