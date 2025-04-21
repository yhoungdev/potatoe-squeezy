import API_ENDPOINTS from "@/enums/API_ENUM";
import ApiClient from "@/util/api";

interface UpdateWalletPayload {
  address: string;
}

class WalletService {
  static async getWalletAddress() {
    const response = await ApiClient.get<{ address: string }>(
      API_ENDPOINTS.USER_WALLET,
    );
    return response;
  }

  static async addWallet(payload: any) {
    const response = await ApiClient.post<{ address: string }>(
      API_ENDPOINTS.USER_WALLET,
      payload,
    );
    return response;
  }

  static async updateWallet(payload: any) {
    const response = await ApiClient.put<{ address: string }>(
      API_ENDPOINTS.USER_WALLET,
      payload,
    );
    return response;
  }
}

export default WalletService;
