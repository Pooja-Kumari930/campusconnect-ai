import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // send the httpOnly refresh cookie
});

let accessToken = null;
export const setAccessToken = (token) => {
  accessToken = token;
};

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
  return config;
});

// Silently refresh the access token on a 401 and retry the original request once.
let isRefreshing = false;
let queue = [];

const processQueue = (error, token = null) => {
  queue.forEach(({ resolve, reject }) => (error ? reject(error) : resolve(token)));
  queue = [];
};

const NO_RETRY_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh"];

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const isExcluded = NO_RETRY_ENDPOINTS.some((path) => originalRequest.url.includes(path));

    if (error.response?.status === 401 && !originalRequest._retry && !isExcluded) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          queue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await api.post("/auth/refresh");
        const newToken = data.data.accessToken;
        setAccessToken(newToken);
        processQueue(null, newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
      
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);