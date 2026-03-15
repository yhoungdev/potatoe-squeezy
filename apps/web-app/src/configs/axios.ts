import axios from "axios";

const DEFAULT_AXIOS = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  timeoutErrorMessage: "There was a timeout, try again",
  withCredentials: true,
});

DEFAULT_AXIOS.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (window.location.pathname.startsWith("/app")) {
        window.location.replace("/");
      }
    }
    return Promise.reject(error);
  },
);

export default DEFAULT_AXIOS;
