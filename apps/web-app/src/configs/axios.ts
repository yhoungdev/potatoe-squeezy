import axios from "axios";
import Cookies from "js-cookie";

const DEFAULT_AXIOS = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  timeoutErrorMessage: "There was a timeout, try again",
});


DEFAULT_AXIOS.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth-token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


DEFAULT_AXIOS.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove("auth-token");
      window.location.href = "/";
    }
    return Promise.reject(error);
  }
);

export default DEFAULT_AXIOS;
