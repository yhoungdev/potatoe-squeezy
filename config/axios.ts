import axios from "axios";

interface IAxiosProps {
  baseUrl: string;
}
export const defaultAxios = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 10000,
  timeoutErrorMessage: "Service timeout please try again later",
});
