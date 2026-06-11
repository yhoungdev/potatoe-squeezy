import { BASE_API_URL } from "@/constant";

type SocialSignInOptions = {
  callbackURL?: string;
  newUserCallbackURL?: string;
  errorCallbackURL?: string;
  scopes?: string[];
};

const baseUrl = String(BASE_API_URL || "").replace(/\/+$/, "");

class AuthService {
  static async signInWithGithub(options: SocialSignInOptions): Promise<{
    url: string;
    redirect: boolean;
  }> {
    void options;

    return {
      url: `${baseUrl}/auth/login`,
      redirect: true,
    };
  }

  static async signOut(): Promise<void> {
    localStorage.removeItem("bearer_token");
  }
}

export { AuthService };
