import API_ENDPOINTS from "@/enums/API_ENUM";
import ApiClient from "@/util/api";

class UserService {
  static async fetchUserProfile() {
    const response = await ApiClient.get(API_ENDPOINTS.USER_PROFILE);
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
}
export default UserService;
