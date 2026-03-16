import API_ENDPOINTS from "@/enums/API_ENUM";
import ApiClient from "@/util/api";
import { BASE_API_URL } from "@/constant";
import { createAuthClient } from "better-auth/client";

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

const baseUrl = String(BASE_API_URL || "").replace(/\/+$/, "");
const authClient = createAuthClient({
  baseURL: baseUrl,
  fetchOptions: {
    credentials: "include",
  },
});

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
    const callbackURL = options.callbackURL ?? `${window.location.origin}/app`;
    const newUserCallbackURL = options.newUserCallbackURL ?? callbackURL;
    const errorCallbackURL =
      options.errorCallbackURL ?? `${window.location.origin}/status/error`;

    const result = (await authClient.signIn.social({
      provider: "github",
      callbackURL,
      newUserCallbackURL,
      errorCallbackURL,
      scopes: options.scopes,
      disableRedirect: true,
    } as any)) as any;

    const error = result?.error;
    if (error) {
      throw error;
    }

    const url = result?.data?.url ?? result?.url;
    if (!url) {
      throw new Error("Missing OAuth redirect URL");
    }

    return {
      url,
      redirect: true,
    };
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
    const result = (await authClient.getSession()) as any;
    const error = result?.error;
    if (error) {
      throw error;
    }
    return result?.data ?? result;
  }

  static async signOut(): Promise<void> {
    const result = (await authClient.signOut()) as any;
    const error = result?.error;
    if (error) {
      throw error;
    }
  }
}

export { AuthService };
