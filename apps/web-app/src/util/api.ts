import DEFAULT_AXIOS from "@/configs/axios";


class ApiClient {
    private baseUrl: string;
    private axiosInstance: typeof DEFAULT_AXIOS;
    constructor(baseUrl: string, axiosInstance: typeof DEFAULT_AXIOS) {
        this.baseUrl = baseUrl;
        this.axiosInstance = axiosInstance;
    }
    async get<T>(path: string, params?: Record<string, string>): Promise<T> {
        const response = await this.axiosInstance.get(`${this.baseUrl}${path}`, { params });
        return response.data;
    }

    async post<T>(path: string, data?: Record<string, string>): Promise<T> {
        const response = await this.axiosInstance.post(`${this.baseUrl}${path}`, data);
        return response.data;
    }
    
    async put<T>(path: string, data?: Record<string, string>): Promise<T> {
        const response = await this.axiosInstance.put(`${this.baseUrl}${path}`, data);
        return response.data;
    }

    async delete<T>(path: string): Promise<T> {
        const response = await this.axiosInstance.delete(`${this.baseUrl}${path}`);
        return response.data;
    }

    async patch<T>(path: string): Promise<T> {
        const response = await this.axiosInstance.patch(`${this.baseUrl}${path}`);
        return response.data;
    }
};

export default ApiClient;