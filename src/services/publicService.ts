import apiClient from "./apiClient";
import type { ApiResponse } from "../types/common.type";
import type { HomeData, PublicPackage, PublicTrainer, ContactRequestForm } from "../types/public.type";

const MOCK_PACKAGES: PublicPackage[] = [
  {
    id: "PKG-001",
    name: "Cơ Bản",
    description: "Phù hợp cho người mới bắt đầu",
    basePrice: 500000,
    hasAiWorkoutPlan: false,
    hasNutritionPlan: false,
    ptSessionsPerMonth: 1,
    features: ["Truy cập khung giờ off-peak", "Sử dụng phòng thay đồ", "1 buổi PT miễn phí"],
  },
  {
    id: "PKG-002",
    name: "Tiêu Chuẩn",
    description: "Lựa chọn phổ biến nhất",
    basePrice: 4500000,
    hasAiWorkoutPlan: true,
    hasNutritionPlan: false,
    ptSessionsPerMonth: 0,
    features: ["Truy cập 24/7", "Tham gia các lớp Yoga/Zumba", "Đo InBody miễn phí mỗi tháng", "Nước uống miễn phí"],
    isPopular: true,
  },
  {
    id: "PKG-003",
    name: "Cao Cấp",
    description: "Trải nghiệm hoàn hảo nhất",
    basePrice: 8000000,
    hasAiWorkoutPlan: true,
    hasNutritionPlan: true,
    ptSessionsPerMonth: 4,
    features: ["Tất cả quyền lợi Tiêu Chuẩn", "Sử dụng xông hơi & massage", "Có tủ đồ cá nhân riêng", "Tặng set đồ tập FitLife"],
  }
];

const MOCK_TRAINERS: PublicTrainer[] = [
  {
    id: "TRN-001",
    fullName: "Nguyễn Tuấn Khoa",
    avatarUrl: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&h=200&fit=crop",
    specialties: ["Tăng cơ", "Giảm mỡ", "Phục hồi chấn thương"],
    experienceYears: 5,
    bio: "Cựu vận động viên thể hình, chuyên gia dinh dưỡng thể thao.",
  },
  {
    id: "TRN-002",
    fullName: "Trần Anh Đức",
    avatarUrl: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=200&h=200&fit=crop",
    specialties: ["Yoga", "Pilates", "Core strength"],
    experienceYears: 7,
    bio: "Giảng viên Yoga Quốc tế với chứng chỉ RYT-500.",
  },
  {
    id: "TRN-003",
    fullName: "Lê Minh Tuấn",
    avatarUrl: "https://images.unsplash.com/photo-1594381898411-846e7d193883?q=80&w=200&h=200&fit=crop",
    specialties: ["Powerlifting", "CrossFit"],
    experienceYears: 4,
    bio: "Huấn luyện viên chuyên về sức mạnh và độ bền.",
  }
];

const MOCK_HOME_DATA: HomeData = {
  stats: {
    totalMembers: 2500,
    activeTrainers: 15,
    totalEquipment: 120,
    yearsOfExperience: 8,
  },
  featuredPackages: MOCK_PACKAGES,
  featuredTrainers: MOCK_TRAINERS,
};

export const publicService = {
  // PUB-01: Lấy dữ liệu trang chủ
  getHomeData: async (): Promise<HomeData> => {
    try {
      const response = await apiClient.get<ApiResponse<HomeData>>("/public/home");
      return response.data.data;
    } catch (error) {
      console.warn("API /public/home failed, using mock data", error);
      return MOCK_HOME_DATA;
    }
  },

  // PUB-02: Lấy danh sách gói tập
  getPackages: async (): Promise<PublicPackage[]> => {
    try {
      const response = await apiClient.get<ApiResponse<PublicPackage[]>>("/public/packages");
      return response.data.data;
    } catch (error) {
      console.warn("API /public/packages failed, using mock data", error);
      return MOCK_PACKAGES;
    }
  },

  // PUB-03: Chi tiết gói tập
  getPackageDetails: async (id: string): Promise<PublicPackage> => {
    try {
      const response = await apiClient.get<ApiResponse<PublicPackage>>(`/public/packages/${id}`);
      return response.data.data;
    } catch (error) {
      console.warn(`API /public/packages/${id} failed, using mock data`, error);
      const pkg = MOCK_PACKAGES.find(p => p.id === id);
      if (!pkg) throw new Error("Package not found");
      return pkg;
    }
  },

  // PUB-04: Lấy danh sách Trainer
  getTrainers: async (): Promise<PublicTrainer[]> => {
    try {
      const response = await apiClient.get<ApiResponse<PublicTrainer[]>>("/public/trainers");
      return response.data.data;
    } catch (error) {
      console.warn("API /public/trainers failed, using mock data", error);
      return MOCK_TRAINERS;
    }
  },

  // PUB-05: Gửi yêu cầu tư vấn
  submitContactRequest: async (data: ContactRequestForm): Promise<void> => {
    try {
      await apiClient.post<ApiResponse<void>>("/public/contact-requests", data);
    } catch (error) {
      console.warn("API /public/contact-requests failed, simulating success", error);
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
};
