import apiClient from "./apiClient";
import { ApiResponse } from "../types/common.type";
import { NotificationDto } from "../types/notification.type";

class NotificationService {
  /**
   * Lấy danh sách thông báo của người dùng hiện tại
   */
  async getMyNotifications(): Promise<NotificationDto[]> {
    try {
      const res = await apiClient.get<ApiResponse<NotificationDto[]>>("/notifications/my");
      return res.data.data || [];
    } catch (error) {
      console.warn("Chưa thể tải thông báo (API có thể chưa sẵn sàng):", error);
      return [];
    }
  }

  /**
   * Đánh dấu một thông báo là đã đọc
   */
  async markAsRead(id: number): Promise<void> {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
    } catch (error) {
      console.warn(`Lỗi khi đánh dấu đã đọc thông báo ${id}:`, error);
    }
  }

  /**
   * Đánh dấu tất cả thông báo là đã đọc
   */
  async markAllAsRead(): Promise<void> {
    try {
      await apiClient.patch("/notifications/read-all");
    } catch (error) {
      console.warn("Lỗi khi đánh dấu đã đọc tất cả thông báo:", error);
    }
  }
}

export const notificationService = new NotificationService();
