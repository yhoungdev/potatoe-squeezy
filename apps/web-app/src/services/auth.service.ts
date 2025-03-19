import API_ENDPOINTS from "@/enums/API_ENUM";
import ApiClient from "@/util/api";

class AuthService {
  static async signInWithGithub(): Promise<any> {
    const response = await ApiClient.get<{ url: string }>(
      API_ENDPOINTS.GITHUB_AUTH,
    );
    return response;
  }

  static async signInWithGoogle(): Promise<any> {
    return await ApiClient.get(API_ENDPOINTS.GOOGLE_AUTH);
  }

  static async signOut(): Promise<void> {
    await ApiClient.post(API_ENDPOINTS.SIGN_OUT);
  }
}

export { AuthService };
