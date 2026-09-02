import apiClient from "./apiClient";

import type {
  ApiResponse,
  PageResponse,
} from "../types/common.type";

import type {
  BodyMetric,
  BodyMetricHistoryParams,
  BodyMetricListParams,
  CreateMyBodyMetricRequest,
} from "../types/bodyMetric.type";

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

export const bodyMetricService = {
  /**
   * Danh sách Body Metric của Member hiện tại.
   *
   * Backend sắp xếp mặc định:
   * recordedAt DESC.
   */
  async getMyBodyMetrics(
      params: BodyMetricListParams = {},
  ): Promise<PageResponse<BodyMetric>> {
    const response =
        await apiClient.get<
            ApiResponse<
                PageResponse<BodyMetric>
            >
        >(
            "/body-metrics/me",
            {
              params: {
                page:
                    params.page ?? 0,

                size:
                    params.size ?? 20,

                sort:
                    params.sort ??
                    "recordedAt,desc",
              },
            },
        );

    return requireData(
        response.data,
        "Không nhận được lịch sử chỉ số cơ thể.",
    );
  },

  /**
   * Metric mới nhất theo recordedAt.
   */
  async getLatestMyBodyMetric():
      Promise<BodyMetric> {
    const response =
        await apiClient.get<
            ApiResponse<BodyMetric>
        >(
            "/body-metrics/me/latest",
        );

    return requireData(
        response.data,
        "Không nhận được chỉ số cơ thể mới nhất.",
    );
  },

  /**
   * Chi tiết một Body Metric của Member hiện tại.
   */
  async getMyBodyMetricById(
      id: number,
  ): Promise<BodyMetric> {
    const response =
        await apiClient.get<
            ApiResponse<BodyMetric>
        >(
            `/body-metrics/me/${id}`,
        );

    return requireData(
        response.data,
        "Không nhận được chi tiết chỉ số cơ thể.",
    );
  },

  /**
   * Lịch sử trong khoảng thời gian.
   *
   * Backend trả theo recordedAt ASC,
   * phù hợp để dựng biểu đồ.
   */
  async getMyBodyMetricHistory(
      params: BodyMetricHistoryParams,
  ): Promise<BodyMetric[]> {
    const response =
        await apiClient.get<
            ApiResponse<BodyMetric[]>
        >(
            "/body-metrics/me/history",
            {
              params: {
                from: params.from,
                to: params.to,
              },
            },
        );

    return requireData(
        response.data,
        "Không nhận được dữ liệu biểu đồ.",
    );
  },

  /**
   * Tạo lần đo mới.
   *
   * Không gửi memberId vì backend resolve Member
   * từ access token.
   */
  async createMyBodyMetric(
      request:
      CreateMyBodyMetricRequest,
  ): Promise<BodyMetric> {
    const payload:
        CreateMyBodyMetricRequest = {
      weightKg:
      request.weightKg,

      ...(request.heightCm !==
      undefined
          ? {
            heightCm:
            request.heightCm,
          }
          : {}),

      ...(request.bodyFatPercent !==
      undefined
          ? {
            bodyFatPercent:
            request.bodyFatPercent,
          }
          : {}),

      ...(request.muscleMassKg !==
      undefined
          ? {
            muscleMassKg:
            request.muscleMassKg,
          }
          : {}),

      ...(request.note?.trim()
          ? {
            note:
                request.note.trim(),
          }
          : {}),

      ...(request.recordedAt
          ? {
            recordedAt:
            request.recordedAt,
          }
          : {}),
    };

    const response =
        await apiClient.post<
            ApiResponse<BodyMetric>
        >(
            "/body-metrics/me",
            payload,
        );

    return requireData(
        response.data,
        "Không nhận được chỉ số cơ thể vừa tạo.",
    );
  },

  async getAdminMemberBodyMetrics(
      memberId: number,
      params: BodyMetricListParams = {},
  ): Promise<PageResponse<BodyMetric>> {
    const response =
        await apiClient.get<
            ApiResponse<
                PageResponse<BodyMetric>
            >
        >(
            `/admin/members/${memberId}/body-metrics`,
            {
              params: {
                page: params.page ?? 0,
                size: params.size ?? 20,
                sort: params.sort ?? "recordedAt,desc",
              },
            },
        );

    return requireData(
        response.data,
        "Không nhận được danh sách chỉ số cơ thể của hội viên.",
    );
  },

  async getAdminMemberLatestBodyMetric(
      memberId: number,
  ): Promise<BodyMetric> {
    const response =
        await apiClient.get<
            ApiResponse<BodyMetric>
        >(
            `/admin/members/${memberId}/body-metrics/latest`,
        );

    return requireData(
        response.data,
        "Không nhận được chỉ số cơ thể mới nhất của hội viên.",
    );
  },

  async createAdminMemberBodyMetric(
      memberId: number,
      request: CreateMyBodyMetricRequest,
  ): Promise<BodyMetric> {
    const payload: CreateMyBodyMetricRequest = {
      weightKg: request.weightKg,
      ...(request.heightCm !== undefined ? { heightCm: request.heightCm } : {}),
      ...(request.bodyFatPercent !== undefined ? { bodyFatPercent: request.bodyFatPercent } : {}),
      ...(request.muscleMassKg !== undefined ? { muscleMassKg: request.muscleMassKg } : {}),
      ...(request.note?.trim() ? { note: request.note.trim() } : {}),
      ...(request.recordedAt ? { recordedAt: request.recordedAt } : {}),
    };

    const response =
        await apiClient.post<
            ApiResponse<BodyMetric>
        >(
            `/admin/members/${memberId}/body-metrics`,
            payload,
        );

    return requireData(
        response.data,
        "Không tạo được chỉ số cơ thể cho hội viên.",
    );
  },
};