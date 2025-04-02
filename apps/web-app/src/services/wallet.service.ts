import API_ENDPOINTS from "@/enums/API_ENUM";
import ApiClient from "@/util/api";

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

  static async updateWallet() {}
}

export default WalletService;
