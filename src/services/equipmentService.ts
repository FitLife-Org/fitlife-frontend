import apiClient from "./apiClient";

import type {
  ApiResponse,
  PageResponse,
} from "../types/common.type";

import type {
  Equipment,
  AdminEquipmentCreateRequest,
  AdminEquipmentUpdateRequest,
  EquipmentSummary,
} from "../types/equipment.type";

const PUBLIC_API_BASE = "/equipment";
const ADMIN_API_BASE = "/admin/equipment";

export interface EquipmentQueryParams {
  page?: number;
  size?: number;
  keyword?: string;
  status?: string;
  areaId?: number;
  sort?: string;
}

export interface CreateMaintenanceRequest {
  maintenanceDate: string;
  maintenanceType?: string;
  description: string;
  cost?: number;
  status?: string;
  handledById?: number;
}

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

export const EquipmentService = {
  /**
   * Danh sách thiết bị public/staff.
   * page dùng chuẩn Spring: bắt đầu từ 0.
   */
  async getAll(
      params: EquipmentQueryParams = {},
  ): Promise<PageResponse<Equipment>> {
    const response =
        await apiClient.get<
            ApiResponse<PageResponse<Equipment>>
        >(PUBLIC_API_BASE, {
          params: {
            page: params.page ?? 0,
            size: params.size ?? 20,

            ...(params.keyword?.trim()
                ? {
                  keyword:
                      params.keyword.trim(),
                }
                : {}),

            ...(params.status &&
            params.status !== "ALL"
                ? {
                  status: params.status,
                }
                : {}),

            ...(params.areaId !== undefined
                ? {
                  areaId: params.areaId,
                }
                : {}),

            ...(params.sort
                ? {
                  sort: params.sort,
                }
                : {}),
          },
        });

    return requireData(
        response.data,
        "Không nhận được danh sách thiết bị.",
    );
  },

  async getSummary():
      Promise<EquipmentSummary> {
    const response =
        await apiClient.get<
            ApiResponse<EquipmentSummary>
        >(`${ADMIN_API_BASE}/summary`);

    return requireData(
        response.data,
        "Không nhận được dữ liệu tổng quan thiết bị.",
    );
  },

  async getById(
      id: number | string,
  ): Promise<Equipment> {
    const response =
        await apiClient.get<
            ApiResponse<Equipment>
        >(`${ADMIN_API_BASE}/${id}`);

    return requireData(
        response.data,
        "Không nhận được thông tin thiết bị.",
    );
  },

  async create(
      data: AdminEquipmentCreateRequest,
  ): Promise<Equipment> {
    const response =
        await apiClient.post<
            ApiResponse<Equipment>
        >(ADMIN_API_BASE, data);

    return requireData(
        response.data,
        "Không nhận được thiết bị vừa tạo.",
    );
  },

  async update(
      id: number | string,
      data: AdminEquipmentUpdateRequest,
  ): Promise<Equipment> {
    const response =
        await apiClient.put<
            ApiResponse<Equipment>
        >(
            `${ADMIN_API_BASE}/${id}`,
            data,
        );

    return requireData(
        response.data,
        "Không nhận được thiết bị sau khi cập nhật.",
    );
  },

  async updateStatus(
      id: number | string,
      status: string,
  ): Promise<Equipment> {
    const response =
        await apiClient.patch<
            ApiResponse<Equipment>
        >(
            `${ADMIN_API_BASE}/${id}/status`,
            {
              status,
            },
        );

    return requireData(
        response.data,
        "Không nhận được trạng thái thiết bị sau khi cập nhật.",
    );
  },

  async delete(
      id: number | string,
  ): Promise<void> {
    await apiClient.delete<
        ApiResponse<void>
    >(`${ADMIN_API_BASE}/${id}`);
  },

  async createMaintenance(
      id: number | string,
      data: CreateMaintenanceRequest,
  ): Promise<unknown> {
    const response =
        await apiClient.post<
            ApiResponse<unknown>
        >(
            `${ADMIN_API_BASE}/${id}/maintenance`,
            data,
        );

    return response.data.data;
  },

  async getMaintenanceSchedules(
      params: Record<string, unknown> = {},
  ): Promise<unknown> {
    const response =
        await apiClient.get<
            ApiResponse<unknown>
        >(
            `${ADMIN_API_BASE}/maintenance-schedules`,
            {
              params,
            },
        );

    return response.data.data;
  },

  async completeMaintenance(
      id: number | string,
  ): Promise<unknown> {
    const response =
        await apiClient.patch<
            ApiResponse<unknown>
        >(
            `${ADMIN_API_BASE}/maintenance-schedules/${id}/complete`,
        );

    return response.data.data;
  },

  async reportBroken(
      id: number | string,
      description: string,
  ): Promise<unknown> {
    const response =
        await apiClient.post<
            ApiResponse<unknown>
        >(
            `/staff/equipment/${id}/report-broken`,
            { description },
        );

    return response.data.data;
  },

  async getAreas(): Promise<any[]> {
    const response =
        await apiClient.get<
            ApiResponse<any[]>
        >(
            `/admin/equipment-areas`,
        );

    return response.data.data || [];
  },

  async updateArea(
      id: number | string,
      area: string,
  ): Promise<Equipment> {
    const response =
        await apiClient.patch<
            ApiResponse<Equipment>
        >(
            `${ADMIN_API_BASE}/${id}/area`,
            { area },
        );

    return requireData(
        response.data,
        "Không thể cập nhật khu vực thiết bị.",
    );
  },

  async retire(
      id: number | string,
  ): Promise<Equipment> {
    const response =
        await apiClient.post<
            ApiResponse<Equipment>
        >(
            `${ADMIN_API_BASE}/${id}/retire`,
        );

    return requireData(
        response.data,
        "Không thể ngừng hoạt động thiết bị.",
    );
  },

  async getHistory(
      id: number | string,
  ): Promise<any[]> {
    const response =
        await apiClient.get<
            ApiResponse<any[]>
        >(
            `${ADMIN_API_BASE}/${id}/history`,
        );

    return response.data.data || [];
  },
};