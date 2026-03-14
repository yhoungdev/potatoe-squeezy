import API_ENDPOINTS from "@/enums/API_ENUM";
import ApiClient from "@/util/api";

class AuthService {
  static async signInWithGithub(callbackURL: string): Promise<{
    url: string;
    redirect: boolean;
  }> {
    return await ApiClient.post(API_ENDPOINTS.SIGN_IN_SOCIAL, {
      provider: "github",
      callbackURL,
    });
  }

  static async signInWithGoogle(callbackURL: string): Promise<{
    url: string;
    redirect: boolean;
  }> {
    return await ApiClient.post(API_ENDPOINTS.SIGN_IN_SOCIAL, {
      provider: "google",
      callbackURL,
    });
  }

  static async getSession(): Promise<any> {
    return await ApiClient.get(API_ENDPOINTS.GET_SESSION);
  }

  static async signOut(): Promise<void> {
    await ApiClient.post(API_ENDPOINTS.SIGN_OUT);
  }
}

export { AuthService };
