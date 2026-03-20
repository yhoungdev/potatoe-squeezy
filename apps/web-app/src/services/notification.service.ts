import API_ENDPOINTS from "@/enums/API_ENUM";
import ApiClient from "@/util/api";

export interface UserNotification {
  id: number;
  title: string;
  message: string;
  amount: string;
  senderAddress: string;
  recipientAddress: string;
  txHash: string | null;
  createdAt: string;
  sender: {
    username: string | null;
    avatarUrl: string | null;
  } | null;
}

class NotificationService {
  static async getUserNotifications(): Promise<UserNotification[]> {
    const response = await ApiClient.get<UserNotification[]>(
      API_ENDPOINTS.USER_NOTIFICATIONS,
    );
    return response;
  }

  static async clearUserNotifications() {
    const response = await ApiClient.delete<{
      success: boolean;
      notificationsClearedAt: string;
    }>(API_ENDPOINTS.USER_NOTIFICATIONS);
    return response;
  }
}

export default NotificationService;
