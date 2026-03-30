import axios from "axios";
import {API_BASE_URL} from "../constants/constantsPlus";

const BASE_URL = API_BASE_URL;

const api = axios.create({
  baseURL: `${BASE_URL}/api/v1`,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest",
    "Accept": "application/json"
  }
});

api.interceptors.request.use(
  (config) =>
  {
    const token = localStorage.getItem("token");
    if(token)
    {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) =>
  {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) =>
  {
    const status = error?.response?.status;
    const message = error?.response?.data?.message || error.message || "Unknown error";

    if(status === 401)
    {
      localStorage.removeItem("token");
    }

    return Promise.reject({
      status,
      message,
      raw: error
    });
  }
);

export default api;
