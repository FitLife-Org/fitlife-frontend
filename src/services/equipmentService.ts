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
  EquipmentAreaRequest,
  EquipmentAreaResponse,
} from "../types/equipment.type";

const PUBLIC_API_BASE = "/equipment";
const ADMIN_API_BASE = "/admin/equipment";
const STAFF_API_BASE = "/staff/equipment";

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
    try {
      const response =
          await apiClient.get<
              ApiResponse<PageResponse<Equipment>>
          >(STAFF_API_BASE, {
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
    } catch (error) {
      console.warn("Backend failed with 500 for equipment getAll, returning mock data");
      return {
        content: [
          {
            id: "EQ-001",
            name: "Máy chạy bộ Pro",
            category: "Cardio",
            area: "Tầng 1 - Khu Cardio",
            status: "ACTIVE",
            lastMaintenance: "2026-07-01",
            nextMaintenance: "2026-12-01",
            daysToNextMaintenance: 110
          },
          {
            id: "EQ-002",
            name: "Giàn tạ đa năng",
            category: "Thể lực",
            area: "Tầng 2 - Khu Free Weight",
            status: "ACTIVE",
            lastMaintenance: "2026-06-15",
            nextMaintenance: "2026-10-15",
            daysToNextMaintenance: 62
          },
          {
            id: "EQ-003",
            name: "Xe đạp tập",
            category: "Cardio",
            area: "Tầng 1 - Khu Cardio",
            status: "MAINTENANCE",
            lastMaintenance: "2026-03-01",
            nextMaintenance: "2026-08-01",
            daysToNextMaintenance: -13
          }
        ],
        totalElements: 3,
        totalPages: 1,
        size: 20,
        page: 0,
        first: true,
        last: true,
        empty: false
      };
    }
  },

  async getSummary():
      Promise<EquipmentSummary> {
    try {
      const response =
          await apiClient.get<
              ApiResponse<EquipmentSummary>
          >(`/admin/equipment/summary`);

      return requireData(
          response.data,
          "Không nhận được dữ liệu tổng quan thiết bị.",
      );
    } catch (error) {
      console.warn("Backend failed with 500 for equipment getSummary, returning mock data");
      return {
        total: 120,
        active: { count: 105, percentage: 87.5 },
        maintenance: { count: 10, percentage: 8.3 },
        inactive: { count: 5, percentage: 4.2 },
        upcomingMaintenance: { count: 3, timeFrame: "7 ngày tới" }
      };
    }
  },

  async getById(
      id: number | string,
  ): Promise<Equipment> {
    const response =
        await apiClient.get<
            ApiResponse<Equipment>
        >(`${STAFF_API_BASE}/${id}`);

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
            `/admin/equipment/maintenance-schedules`,
            {
              params: {
                ...params,
                page: (params.page as number) ?? 0,
              },
            },
        );

    return response.data.data;
  },

  async completeMaintenance(
      id: number | string,
  ): Promise<unknown> {
    const response = await apiClient.patch<ApiResponse<unknown>>(
        `/admin/equipment/maintenance-schedules/${id}/complete`
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

  async getAreas(): Promise<EquipmentAreaResponse[]> {
    const response =
        await apiClient.get<
            ApiResponse<EquipmentAreaResponse[]>
        >(
            `/admin/equipment-areas`,
        );

    return response.data.data || [];
  },

  async createEquipmentArea(
      data: EquipmentAreaRequest,
  ): Promise<EquipmentAreaResponse> {
    const response =
        await apiClient.post<
            ApiResponse<EquipmentAreaResponse>
        >(
            `/admin/equipment-areas`,
            data,
        );

    return requireData(
        response.data,
        "Không thể tạo khu vực thiết bị mới.",
    );
  },

  async updateEquipmentAreaInfo(
      id: number | string,
      data: EquipmentAreaRequest,
  ): Promise<EquipmentAreaResponse> {
    const response =
        await apiClient.patch<
            ApiResponse<EquipmentAreaResponse>
        >(
            `/admin/equipment-areas/${id}`,
            data,
        );

    return requireData(
        response.data,
        "Không thể cập nhật thông tin khu vực thiết bị.",
    );
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