export type NotificationType = 
  | "PACKAGE_EXPIRED" 
  | "PAYMENT" 
  | "SYSTEM" 
  | "AI_RECOMMENDATION"
  | "MAINTENANCE";

export interface NotificationDto {
  id: number;
  userId: number;
  title: string;
  content: string;
  type: NotificationType;
  readStatus: boolean;
  createdAt: string;
}

export interface NotificationResponse {
  notifications: NotificationDto[];
  unreadCount: number;
}
