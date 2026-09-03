import apiClient from "./apiClient";
import type { ApiResponse, Status } from "../types/common.type";
import type { GymPackage, PackageDuration, AdminPackageCreateRequest, AdminPackageUpdateRequest, AdminPackageDurationCreateRequest, AdminPackageDurationUpdateRequest } from "../types/package.type";

export const packageService = {
  async getPublicPackages(params?: Record<string, unknown>): Promise<GymPackage[]> {
    const updatedParams = {
        ...params,
        page: (Number(params?.page) || 0) + 1,
    };
    const response = await apiClient.get<ApiResponse<GymPackage[] | { content?: GymPackage[]; data?: GymPackage[] }>>("/gym-packages", { params: updatedParams });
    const responseData = response.data.data;
    if (responseData && typeof responseData === 'object' && 'content' in responseData && Array.isArray((responseData as { content: GymPackage[] }).content)) {
      return (responseData as { content: GymPackage[] }).content;
    } else if (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray((responseData as { data: GymPackage[] }).data)) {
      return (responseData as { data: GymPackage[] }).data;
    } else if (Array.isArray(responseData)) {
      return responseData;
    }
    return [];
  },

  async getPublicPackageById(id: number): Promise<GymPackage> {
    const response = await apiClient.get<ApiResponse<GymPackage>>(`/gym-packages/${id}`);
    return response.data.data as GymPackage;
  },

  async getAdminPackages(params?: Record<string, unknown>): Promise<GymPackage[]> {
    const updatedParams = {
        ...params,
        page: (Number(params?.page) || 0) + 1,
    };
    const response = await apiClient.get<ApiResponse<GymPackage[] | { content?: GymPackage[]; data?: GymPackage[] }>>("/admin/gym-packages", { params: updatedParams });
    const responseData = response.data.data;
    if (responseData && typeof responseData === 'object' && 'content' in responseData && Array.isArray((responseData as { content: GymPackage[] }).content)) {
      return (responseData as { content: GymPackage[] }).content;
    } else if (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray((responseData as { data: GymPackage[] }).data)) {
      return (responseData as { data: GymPackage[] }).data;
    } else if (Array.isArray(responseData)) {
      return responseData;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },

  async getAdminPackageById(id: number): Promise<GymPackage> {
    const response = await apiClient.get<ApiResponse<GymPackage>>(`/admin/gym-packages/${id}`);
    if (response.data.data) {
       return response.data.data as GymPackage;
    }
    return response.data as unknown as GymPackage;
  },

  async createPackage(data: AdminPackageCreateRequest): Promise<GymPackage> {
    const response = await apiClient.post<ApiResponse<GymPackage>>("/admin/gym-packages", data);
    return response.data.data;
  },

  async updatePackage(id: number, data: AdminPackageUpdateRequest): Promise<GymPackage> {
    const response = await apiClient.put<ApiResponse<GymPackage>>(`/admin/gym-packages/${id}`, data);
    return response.data.data;
  },

  async updatePackageStatus(id: number, status: Status): Promise<GymPackage> {
    const response = await apiClient.patch<ApiResponse<GymPackage>>(`/admin/gym-packages/${id}/status`, { status });
    return response.data.data;
  },

  async deletePackage(id: number): Promise<void> {
    await apiClient.delete(`/admin/gym-packages/${id}`);
  },

  async getPackageDurations(): Promise<PackageDuration[]> {
    const response = await apiClient.get<ApiResponse<PackageDuration[] | { content?: PackageDuration[]; data?: PackageDuration[] }>>("/package-durations/active");
    const responseData = response.data.data;
    if (responseData && typeof responseData === 'object' && 'content' in responseData && Array.isArray((responseData as { content: PackageDuration[] }).content)) {
      return (responseData as { content: PackageDuration[] }).content;
    } else if (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray((responseData as { data: PackageDuration[] }).data)) {
      return (responseData as { data: PackageDuration[] }).data;
    } else if (Array.isArray(responseData)) {
      return responseData;
    }
    return [];
  },

  async getAdminPackageDurations(): Promise<PackageDuration[]> {
    const response = await apiClient.get<ApiResponse<PackageDuration[] | { content?: PackageDuration[]; data?: PackageDuration[] }>>("/admin/package-durations");
    const responseData = response.data.data;
    if (responseData && typeof responseData === 'object' && 'content' in responseData && Array.isArray((responseData as { content: PackageDuration[] }).content)) {
      return (responseData as { content: PackageDuration[] }).content;
    } else if (responseData && typeof responseData === 'object' && 'data' in responseData && Array.isArray((responseData as { data: PackageDuration[] }).data)) {
      return (responseData as { data: PackageDuration[] }).data;
    } else if (Array.isArray(responseData)) {
      return responseData;
    } else if (Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  },

  async getAdminPackageDurationById(id: number): Promise<PackageDuration> {
    const response = await apiClient.get<ApiResponse<PackageDuration>>(`/admin/package-durations/${id}`);
    if (response.data.data) {
      return response.data.data as PackageDuration;
    }
    return response.data as unknown as PackageDuration;
  },

  async createPackageDuration(data: AdminPackageDurationCreateRequest): Promise<PackageDuration> {
    const response = await apiClient.post<ApiResponse<PackageDuration>>("/admin/package-durations", data);
    return response.data.data;
  },

  async updatePackageDuration(id: number, data: AdminPackageDurationUpdateRequest): Promise<PackageDuration> {
    const response = await apiClient.put<ApiResponse<PackageDuration>>(`/admin/package-durations/${id}`, data);
    return response.data.data;
  },

  async updatePackageDurationStatus(id: number, status: Status): Promise<PackageDuration> {
    const response = await apiClient.patch<ApiResponse<PackageDuration>>(`/admin/package-durations/${id}/status`, { status });
    return response.data.data;
  },

  async deletePackageDuration(id: number): Promise<void> {
    await apiClient.delete(`/admin/package-durations/${id}`);
  },

  async getPTPackages(): Promise<import("../types/package.type").PTPackage[]> {
    try {
      const response = await apiClient.get<ApiResponse<import("../types/package.type").PTPackage[]>>("/pt-packages");
      if (Array.isArray(response.data.data)) return response.data.data;
    } catch {
      // Fallback data theo nghiệp vụ phần 3
    }
    return [
      { id: 1, code: "PT_TRIAL", name: "PT Trial", sessions: 1, durationDays: 7, price: 250000, perSessionPrice: 250000, sessionDurationMinutes: 60, description: "1 buổi trải nghiệm PT cá nhân trong 7 ngày." },
      { id: 2, code: "PT_STARTER", name: "PT Starter", sessions: 5, durationDays: 30, price: 1100000, perSessionPrice: 220000, sessionDurationMinutes: 60, description: "5 buổi tập cùng PT trong 30 ngày." },
      { id: 3, code: "PT_PROGRESS", name: "PT Progress", sessions: 12, durationDays: 60, price: 2400000, perSessionPrice: 200000, sessionDurationMinutes: 60, description: "12 buổi tập xây dựng nền tảng trong 60 ngày." },
      { id: 4, code: "PT_TRANSFORM", name: "PT Transformation", sessions: 24, durationDays: 120, price: 4500000, perSessionPrice: 187500, sessionDurationMinutes: 60, description: "24 buổi biến đổi thể hình trong 120 ngày." },
      { id: 5, code: "PT_INTENSIVE", name: "PT Intensive", sessions: 36, durationDays: 180, price: 6300000, perSessionPrice: 175000, sessionDurationMinutes: 60, description: "36 buổi huấn luyện chuyên sâu trong 180 ngày." },
    ];
  },

  async getAddonServices(): Promise<import("../types/package.type").AddonService[]> {
    try {
      const response = await apiClient.get<ApiResponse<import("../types/package.type").AddonService[]>>("/addon-services");
      if (Array.isArray(response.data.data)) return response.data.data;
    } catch {
      // Fallback data theo nghiệp vụ phần 4
    }
    return [
      { id: 1, code: "BODY_METRICS", name: "Đo chỉ số cơ thể", price: 50000, unit: "lần", category: "METRICS", description: "Đo kiểm tra các chỉ số cơ bản." },
      { id: 2, code: "INBODY_DEEP", name: "InBody chuyên sâu", price: 150000, unit: "lần", category: "METRICS", description: "Phân tích chi tiết tỷ lệ mỡ, cơ, nước." },
      { id: 3, code: "TOWEL_SINGLE", name: "Khăn tập theo lần", price: 20000, unit: "lần", category: "FACILITIES", description: "Mượn 01 khăn tập cotton sạch." },
      { id: 4, code: "LOCKER_MONTH", name: "Tủ đồ cố định", price: 150000, unit: "tháng", category: "FACILITIES", description: "Tủ đồ riêng biệt cố định theo tháng." },
      { id: 5, code: "DAY_PASS", name: "Vé tập một ngày", price: 100000, unit: "ngày", category: "TICKETS", description: "Tập tự do 1 ngày tại phòng tập." },
      { id: 6, code: "GROUP_CLASS_PASS", name: "Vé trải nghiệm lớp nhóm", price: 80000, unit: "buổi", category: "TICKETS", description: "Tham gia 1 lớp Yoga / Zumba / Aerobic." },
      { id: 7, code: "WORKOUT_PLAN", name: "Lập lịch tập cá nhân", price: 300000, unit: "lần", category: "COACHING", description: "Thiết kế giáo án tập luyện riêng." },
      { id: 8, code: "NUTRITION_MENU", name: "Thực đơn dinh dưỡng", price: 400000, unit: "lần", category: "COACHING", description: "Thực đơn ăn uống chuẩn calo." },
      { id: 9, code: "COMBO_PLAN_MENU", name: "Combo Tập + Dinh dưỡng", price: 600000, unit: "lần", category: "COACHING", description: "Giáo án tập luyện & thực đơn chuẩn." },
      { id: 10, code: "FREEZE_EXTEND", name: "Gia hạn đóng băng", price: 100000, unit: "7 ngày", category: "OTHER", description: "Gia hạn thêm 7 ngày đóng băng gói." },
      { id: 11, code: "TRANSFER_FEE", name: "Phí chuyển nhượng gói", price: 200000, unit: "lần", category: "OTHER", description: "Phí thủ tục chuyển nhượng gói tập." },
    ];
  },

  async verifyPromotion(code: string): Promise<import("../types/package.type").Promotion | null> {
    try {
      const response = await apiClient.get<ApiResponse<import("../types/package.type").Promotion>>(`/promotions/verify/${code}`);
      if (response.data.data) return response.data.data;
    } catch {
      // Fallback lookup
    }
    const mockPromos: Record<string, import("../types/package.type").Promotion> = {
      FITNEW10: { id: 1, promotionCode: "FITNEW10", promotionName: "Ưu đãi Hội viên mới (-10%)", discountType: "PERCENT", discountValue: 10, maximumDiscount: 300000, minimumOrderValue: 300000, active: true },
      FITGROUP15: { id: 2, promotionCode: "FITGROUP15", promotionName: "Đăng ký nhóm 5+ (-15%)", discountType: "PERCENT", discountValue: 15, maximumDiscount: 500000, minimumOrderValue: 1000000, active: true },
      FITSVIP15: { id: 3, promotionCode: "FITSVIP15", promotionName: "Ưu đãi Sinh nhật (-15%)", discountType: "PERCENT", discountValue: 15, maximumDiscount: 1000000, minimumOrderValue: 500000, active: true },
      FITSTUDENT10: { id: 4, promotionCode: "FITSTUDENT10", promotionName: "Ưu đãi HSSV (-10%)", discountType: "PERCENT", discountValue: 10, maximumDiscount: 200000, minimumOrderValue: 0, active: true },
    };
    return mockPromos[code.trim().toUpperCase()] || null;
  }
};
