import DEFAULT_AXIOS from "@/configs/axios";

class ApiClient {
  private static readonly baseUrl =
    import.meta.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
  private static readonly axiosInstance = DEFAULT_AXIOS;

  static async get<T>(
    path: string,
    params?: Record<string, string>,
  ): Promise<T> {
    const response = await this.axiosInstance.get(`${this.baseUrl}${path}`, {
      params,
    });
    return response.data;
  }

  static async post<T>(
    path: string,
    data?: Record<string, string>,
  ): Promise<T> {
    const response = await this.axiosInstance.post(
      `${this.baseUrl}${path}`,
      data,
    );
    return response.data;
  }

  static async put<T>(path: string, data?: Record<string, string>): Promise<T> {
    const response = await this.axiosInstance.put(
      `${this.baseUrl}${path}`,
      data,
    );
    return response.data;
  }

  static async delete<T>(path: string): Promise<T> {
    const response = await this.axiosInstance.delete(`${this.baseUrl}${path}`);
    return response.data;
  }

  static async patch<T>(path: string): Promise<T> {
    const response = await this.axiosInstance.patch(`${this.baseUrl}${path}`);
    return response.data;
  }
}

export default ApiClient;
