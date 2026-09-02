import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store/authStore";
import { ROUTES } from "@/constants/routes";
import { getApiBaseUrl, isLikelyJwt } from "@/lib/apiBase";

interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
  };
}

const api = axios.create({
  baseURL: getApiBaseUrl() || undefined,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
  timeout: 30_000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const accessToken = useAuthStore.getState().accessToken;
  if (isLikelyJwt(accessToken)) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (typeof FormData !== "undefined" && config.data instanceof FormData) {
    if (typeof config.headers.delete === "function") {
      config.headers.delete("Content-Type");
    } else {
      delete config.headers["Content-Type"];
    }
  }
  return config;
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string | null) => void;
  reject: (error: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
}

function isRefreshRequest(config?: AxiosRequestConfig): boolean {
  const url = config?.url ?? "";
  return url.includes("/auth/refresh");
}

function forceLogout() {
  useAuthStore.getState().logout();
  if (typeof window !== "undefined") {
    window.location.href = ROUTES.AUTH.LOGIN;
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status !== 401 || !originalRequest) {
      return Promise.reject(error);
    }

    // Refresh endpoint itself failed — do not retry
    if (isRefreshRequest(originalRequest)) {
      forceLogout();
      return Promise.reject(error);
    }

    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise<string | null>((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        if (!originalRequest.headers) {
          originalRequest.headers = {};
        }
        originalRequest.headers.Authorization = `Bearer ${token}`;
        return api(originalRequest);
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshResponse = await axios.post<RefreshResponse>(
        `${getApiBaseUrl()}/auth/refresh`,
        {},
        { withCredentials: true }
      );

      const newToken = refreshResponse.data.data.accessToken;
      useAuthStore.getState().updateAccessToken(newToken);
      processQueue(null, newToken);

      if (!originalRequest.headers) {
        originalRequest.headers = {};
      }
      originalRequest.headers.Authorization = `Bearer ${newToken}`;

      return api(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      forceLogout();
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;
