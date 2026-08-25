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
  async getPackages(): Promise<PublicPackage[]> {
    try {
      const response = await apiClient.get<ApiResponse<any>>("/gym-packages", {
        params: { page: 1, size: 100 }
      });
      const data = requireData(response.data, "Không thể tải danh sách gói tập");
      const content = data.content ? data.content : data;
      return content.map((pkg: any) => ({
        id: pkg.id?.toString(),
        name: pkg.name,
        description: pkg.description,
        basePrice: pkg.basePrice,
        hasAiWorkoutPlan: pkg.hasAiWorkoutPlan,
        hasNutritionPlan: pkg.hasNutritionPlan,
        ptSessionsPerMonth: pkg.ptSessionsPerMonth,
        features: pkg.benefits ? pkg.benefits.split("\n") : [],
        isPopular: pkg.name?.toLowerCase().includes("pro")
      }));
    } catch (error) {
      console.error("Failed to fetch packages", error);
      return [];
    }
  },

  async getPackageDetails(id: string): Promise<PublicPackage> {
    const response = await apiClient.get<ApiResponse<any>>(`/gym-packages/${id}`);
    const pkg = requireData(response.data, "Không nhận được chi tiết gói tập.");
    return {
      id: pkg.id?.toString(),
      name: pkg.name,
      description: pkg.description,
      basePrice: pkg.basePrice,
      hasAiWorkoutPlan: pkg.hasAiWorkoutPlan,
      hasNutritionPlan: pkg.hasNutritionPlan,
      ptSessionsPerMonth: pkg.ptSessionsPerMonth,
      features: pkg.benefits ? pkg.benefits.split("\n") : [],
    };
  },

  async getTrainers(): Promise<PublicTrainer[]> {
    try {
      const response = await apiClient.get<ApiResponse<any[]>>("/trainers");
      const data = response.data?.data;
      if (Array.isArray(data) && data.length > 0) {
        return data.map((t: any) => ({
          id: t.id ? t.id.toString() : "",
          fullName: t.fullName || "Huấn luyện viên",
          avatarUrl: t.avatarUrl || `https://i.pravatar.cc/150?u=${t.id || t.username}`,
          specialties: t.specialization
            ? t.specialization.split(",").map((s: string) => s.trim())
            : t.specialty
            ? [t.specialty]
            : ["Fitness & Bodybuilding"],
          experienceYears: t.experienceYears || 1,
          bio: t.bio || "Huấn luyện viên cá nhân chuyên nghiệp tại FitLife Gym."
        }));
      }
    } catch (error) {
      console.warn("Failed to fetch public trainers from backend, using fallback data", error);
    }

    return [
      {
        id: "1",
        fullName: "Nguyễn Văn A",
        avatarUrl: "https://i.pravatar.cc/150?u=a",
        specialties: ["Yoga", "Cardio"],
        experienceYears: 5,
        bio: "Chuyên gia Yoga & Cardio với hơn 5 năm kinh nghiệm huấn luyện."
      },
      {
        id: "2",
        fullName: "Trần Thị B",
        avatarUrl: "https://i.pravatar.cc/150?u=b",
        specialties: ["Weightlifting", "CrossFit"],
        experienceYears: 7,
        bio: "Chuyên gia thể hình và sức mạnh tăng cơ giảm mỡ hiệu quả."
      }
    ];
  },

  async getHomeData(): Promise<HomeData> {
    const packages = await this.getPackages();
    const trainers = await this.getTrainers();
    
    return {
      stats: {
        totalMembers: 1250,
        activeTrainers: trainers.length,
        totalEquipment: 450,
        yearsOfExperience: 10,
      },
      featuredPackages: packages.slice(0, 3),
      featuredTrainers: trainers,
    };
  },

  async submitContactRequest(data: ContactRequestForm): Promise<void> {
    console.log("Contact request submitted (mock):", data);
    // await apiClient.post<ApiResponse<void>>("/public/contact-requests", data);
  },
};