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
    const callbackURL = options.callbackURL ?? `${window.location.origin}/app`;
    const errorCallbackURL =
      options.errorCallbackURL ?? `${window.location.origin}/status/error`;

    const url = new URL(`${baseUrl}/auth/github`);
    url.searchParams.set("callbackURL", callbackURL);
    url.searchParams.set("errorCallbackURL", errorCallbackURL);

    return {
      url: url.toString(),
      redirect: true,
    };
  }

  static async signOut(): Promise<void> {
    localStorage.removeItem("bearer_token");
  }
}

export { AuthService };
