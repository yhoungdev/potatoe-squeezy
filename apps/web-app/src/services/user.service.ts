import API_ENDPOINTS from "@/enums/API_ENUM";
import ApiClient from "@/util/api";

export interface UpdateUserProfilePayload {
  displayName?: string | null;
  email?: string | null;
  twitterUrl?: string | null;
  tippersPublic?: boolean;
}

export interface UserRankBadge {
  name: string;
  minTips: number;
  maxTips: number | null;
}

export interface UserProfileResponse {
  user: any;
  wallet: any;
  wallets: any[];
  totalTipsReceived: string;
  totalTipsSent: string;
  totalTokensSent: string;
  sentTipCount: number;
  receivedTipCount: number;
  rankBadge: UserRankBadge | null;
}

export interface PublicTipperRecord {
  userId: number;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  totalAmount: string;
  tipCount: number;
  lastTippedAt: string | null;
}

export interface PublicTippersResponse {
  isPublic: boolean;
  tippers: PublicTipperRecord[];
}

class UserService {
  static async fetchUserProfile(): Promise<UserProfileResponse> {
    const response = await ApiClient.get<UserProfileResponse>(
      API_ENDPOINTS.USER_PROFILE,
    );
    return response;
  }

  static async fetchUserWallets() {
    const response = await ApiClient.get(API_ENDPOINTS.USER_WALLET);
    return response;
  }

  static async fetchAllPotatoeUsers() {
    const response = await ApiClient.get(API_ENDPOINTS.USER_ALL);
    return response;
  }

  static async updateUserProfile(data: UpdateUserProfilePayload) {
    const response = await ApiClient.put<UserProfileResponse>(
      API_ENDPOINTS.USER_PROFILE,
      data,
    );
    return response;
  }

  static async fetchPublicTippers(username: string) {
    const response = await ApiClient.get<PublicTippersResponse>(
      `${API_ENDPOINTS.USER_PUBLIC_TIPPERS}/${username}/tippers`,
    );
    return response;
  }
}
export default UserService;
