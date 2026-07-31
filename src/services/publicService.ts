import apiClient from "./apiClient";

import type {
  ApiResponse,
} from "../types/common.type";

import type {
  HomeData,
  PublicPackage,
  PublicTrainer,
  ContactRequestForm,
} from "../types/public.type";

function requireData<T>(
    response: ApiResponse<T>,
    message: string,
): T {
  if (
      response.data === null ||
      response.data === undefined
  ) {
    throw new Error(message);
  }

  return response.data;
}

export const publicService = {
  async getHomeData():
      Promise<HomeData> {
    const response =
        await apiClient.get<
            ApiResponse<HomeData>
        >("/public/home");

    return requireData(
        response.data,
        "Không nhận được dữ liệu trang chủ.",
    );
  },

  async getPackages():
      Promise<PublicPackage[]> {
    const response =
        await apiClient.get<
            ApiResponse<PublicPackage[]>
        >("/public/packages");

    return requireData(
        response.data,
        "Không nhận được danh sách gói tập.",
    );
  },

  async getPackageDetails(
      id: string,
  ): Promise<PublicPackage> {
    const response =
        await apiClient.get<
            ApiResponse<PublicPackage>
        >(
            `/public/packages/${encodeURIComponent(
                id,
            )}`,
        );

    return requireData(
        response.data,
        "Không nhận được chi tiết gói tập.",
    );
  },

  async getTrainers():
      Promise<PublicTrainer[]> {
    const response =
        await apiClient.get<
            ApiResponse<PublicTrainer[]>
        >("/public/trainers");

    return requireData(
        response.data,
        "Không nhận được danh sách huấn luyện viên.",
    );
  },

  async submitContactRequest(
      data: ContactRequestForm,
  ): Promise<void> {
    await apiClient.post<
        ApiResponse<void>
    >(
        "/public/contact-requests",
        data,
    );
  },
};