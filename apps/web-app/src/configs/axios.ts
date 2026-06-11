import axios from "axios";
import Cookies from "js-cookie";

const DEFAULT_AXIOS = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  timeoutErrorMessage: "There was a timeout, try again",
  withCredentials: false,
});

DEFAULT_AXIOS.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const existing = localStorage.getItem("bearer_token");
      if (!existing) {
        const params = new URLSearchParams(window.location.search);
        const urlToken = params.get("token");
        if (urlToken) {
          localStorage.setItem("bearer_token", urlToken);
          params.delete("token");
          const next =
            window.location.pathname +
            (params.toString() ? `?${params.toString()}` : "") +
            window.location.hash;
          window.history.replaceState({}, document.title, next);
        }
      }
    }

    const token =
      localStorage.getItem("bearer_token") || Cookies.get("auth-token");
    if (token) {
      const value = `Bearer ${token}`;
      const headers: any = config.headers ?? {};
      if (typeof headers.set === "function") {
        headers.set("Authorization", value);
      } else {
        headers.Authorization = value;
      }
      config.headers = headers;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

DEFAULT_AXIOS.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname.startsWith("/app")) {
        localStorage.removeItem("bearer_token");
        Cookies.remove("auth-token");
      }
    }
    return Promise.reject(error);
  },
);

export default DEFAULT_AXIOS;
