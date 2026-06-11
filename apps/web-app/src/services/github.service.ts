import API_ENDPOINTS from "@/enums/API_ENUM";
import ApiClient from "@/util/api";

export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
}

class GithubService {
  static async searchUsers(query = "", limit = 10): Promise<GitHubUser[]> {
    const response = await ApiClient.get<GitHubUser[]>(
      API_ENDPOINTS.GITHUB_USER_SEARCH,
      {
        q: query,
        limit: String(limit),
      },
    );

    return response;
  }
}

export default GithubService;
