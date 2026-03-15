import API_ENDPOINTS from "@/enums/API_ENUM";
import ApiClient from "@/util/api";

type SocialSignInOptions = {
  callbackURL?: string;
  newUserCallbackURL?: string;
  errorCallbackURL?: string;
  scopes?: string[];
};

enum AuthProvider {
  GITHUB = "github",
  GOOGLE = "google",
}

class AuthService {
  static async signWithSocial(options: SocialSignInOptions): Promise<{
    provider: AuthProvider;
    callbackURL: boolean;
  }> {
    return await ApiClient.post(API_ENDPOINTS.SIGN_IN_SOCIAL, {
      ...options,
    });
  }

  static async signInWithGithub(options: SocialSignInOptions): Promise<{
    url: string;
    redirect: boolean;
  }> {
    return await ApiClient.post(API_ENDPOINTS.SIGN_IN_SOCIAL, {
      provider: "github",
      ...options,
    });
  }

  static async signInWithGoogle(options: SocialSignInOptions): Promise<{
    url: string;
    redirect: boolean;
  }> {
    return await ApiClient.post(API_ENDPOINTS.SIGN_IN_SOCIAL, {
      provider: "google",
      ...options,
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
