import API_ENDPOINTS from "@/enums/API_ENUM";
import ApiClient from "@/util/api";

interface WalletPayload {
  chain: string;
  address: string;
}

interface WalletResponse {
  id: number;
  userId: number;
  chain: string;
  address: string;
  createdAt: string;
  updatedAt: string;
}

class WalletService {
  static async getWalletAddress() {
    const response = await ApiClient.get<WalletResponse[]>(
      API_ENDPOINTS.USER_WALLET,
    );
    return response;
  }

  static async addWallet(payload: WalletPayload) {
    const response = await ApiClient.post<WalletResponse>(
      API_ENDPOINTS.USER_WALLET,
      payload,
    );
    return response;
  }

  static async updateWallet(payload: WalletPayload) {
    const response = await ApiClient.put<WalletResponse>(
      API_ENDPOINTS.USER_WALLET,
      payload,
    );
    return response;
  }
}

export default WalletService;
