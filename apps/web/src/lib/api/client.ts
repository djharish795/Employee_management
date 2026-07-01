import axios from "axios";
import { useAuthStore } from "../../store/auth";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1",
});

// Request Interceptor: Inject Token
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const tokenMatch = document.cookie.match(new RegExp("(^| )token=([^;]+)"));
    const cookieToken = tokenMatch ? tokenMatch[2] : null;
    const storeToken = useAuthStore.getState().accessToken;

    const token = cookieToken || storeToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Response Interceptor: Handle 401 & Token Refresh
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      typeof window !== "undefined"
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = "Bearer " + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = useAuthStore.getState().refreshToken;

      if (!refreshToken) {
        // No refresh token available, force logout
        useAuthStore.getState().clearSession();
        window.location.href = "/login";
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/auth/refresh`,
          { refreshToken }
        );

        if (data.token && data.refreshToken) {
          useAuthStore.getState().setAuthSession({
            accessToken: data.token,
            refreshToken: data.refreshToken,
            role: data.role || "EMPLOYEE",
            employeeId: data.employeeId ?? null,
          });
          document.cookie = `token=${data.token}; path=/; max-age=86400; SameSite=Strict`;

          processQueue(null, data.token);
          
          originalRequest.headers.Authorization = "Bearer " + data.token;
          return apiClient(originalRequest);
        } else {
          throw new Error("Invalid refresh response");
        }
      } catch (err) {
        processQueue(err, null);
        useAuthStore.getState().clearSession();
        window.location.href = "/login";
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
