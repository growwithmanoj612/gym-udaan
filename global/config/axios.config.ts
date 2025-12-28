import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
// http://192.168.16.102
const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL || "http://192.168.1.101:9003/api/v1";
const API_TIMEOUT = 30000;

// Token storage keys
const ACCESS_TOKEN_KEY = "@gym_udaan_access_token";
const REFRESH_TOKEN_KEY = "@gym_udaan_refresh_token";

// Token management utilities
export const tokenManager = {
  async setAccessToken(token: string): Promise<void> {
    await AsyncStorage.setItem(ACCESS_TOKEN_KEY, token);
  },

  async getAccessToken(): Promise<string | null> {
    return await AsyncStorage.getItem(ACCESS_TOKEN_KEY);
  },

  async setRefreshToken(refreshToken: string): Promise<void> {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  },

  async getRefreshToken(): Promise<string | null> {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },

  async setTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      this.setAccessToken(accessToken),
      this.setRefreshToken(refreshToken),
    ]);
  },


  async removeTokens(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(ACCESS_TOKEN_KEY),
      AsyncStorage.removeItem(REFRESH_TOKEN_KEY),
    ]);
  },

  async clearAllData(): Promise<void> {
    await AsyncStorage.clear();
  },
};

// Create axios instance for authenticated requests
export const axios_auth: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
  },
});

// Create axios instance for form data (file uploads)
export const axios_auth_form: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT,
  headers: {
    "Content-Type": "multipart/form-data",
  },
});

// Flag to prevent multiple refresh requests
let isRefreshing = false;
let failedQueue: {
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}[] = [];

const processQueue = (error: any = null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });

  failedQueue = [];
};

// Request interceptor - Add access token to requests
const requestInterceptor = async (config: InternalAxiosRequestConfig) => {
  const token = await tokenManager.getAccessToken();

  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Log request in development
  if (__DEV__) {
    console.log(
      `📤 ${config.method?.toUpperCase()} ${config.url}`,
      config.data
    );
  }

  return config;
};

// Response interceptor - Handle success
const responseSuccessInterceptor = (response: any) => {
  // Log response in development
  if (__DEV__) {
    console.log(
      `📥 ${response.config.method?.toUpperCase()} ${response.config.url}`,
      response.data
    );
  }

  return response;
};

// Response interceptor - Handle errors
const responseErrorInterceptor = async (error: any) => {
  const originalRequest = error.config;

  // Log error in development
  if (__DEV__) {
    console.error("❌ API Error:", {
      url: originalRequest?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
  }

  // Handle 401 Unauthorized - Token expired
  if (error.response?.status === 401 && !originalRequest._retry) {
    if (isRefreshing) {
      // If already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return axios_auth(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const refreshToken = await tokenManager.getRefreshToken();

      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      // ✅ Call refresh endpoint with X-Refresh-Token header
      const response = await axios.post(
        `${API_BASE_URL}/auth/refresh`,
        {},
        {
          headers: {
            "X-Refresh-Token": refreshToken,
          },
        }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      // Store new tokens
      await tokenManager.setTokens(accessToken, newRefreshToken);

      // Update Authorization header for queued requests
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;

      // Process queued requests
      processQueue(null, accessToken);

      // Retry original request
      return axios_auth(originalRequest);
    } catch (refreshError: any) {
      // Refresh failed - logout user
      processQueue(refreshError, null);
      await tokenManager.removeTokens();

      Toast.show({
        type: "error",
        text1: "Session Expired",
        text2: "Please login again.",
        position: "top",
      });

      // Navigate to login
      router.replace("/(auth)/login");

      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }

  // Handle 403 Forbidden
  if (error.response?.status === 403) {
    Toast.show({
      type: "error",
      text1: "Permission Denied",
      text2: "You do not have permission to perform this action.",
      position: "top",
    });
  }

  // Handle 404 Not Found
  if (error.response?.status === 404) {
    Toast.show({
      type: "error",
      text1: "Not Found",
      text2:
        error.response?.data?.message ||
        "The requested resource was not found.",
      position: "top",
    });
  }

  // Handle 500 Server Error
  if (error.response?.status >= 500) {
    Toast.show({
      type: "error",
      text1: "Server Error",
      text2: "Please try again later.",
      position: "top",
    });
  }

  // Handle network errors
  if (error.message === "Network Error" || error.code === "ECONNABORTED") {
    Toast.show({
      type: "error",
      text1: "Network Error",
      text2: "Please check your internet connection.",
      position: "top",
    });
  }

  // Handle timeout
  if (error.code === "ECONNABORTED" && error.message.includes("timeout")) {
    Toast.show({
      type: "error",
      text1: "Request Timeout",
      text2: "The server took too long to respond.",
      position: "top",
    });
  }

  return Promise.reject(error);
};

// Apply interceptors to authenticated instance
axios_auth.interceptors.request.use(requestInterceptor, (error) =>
  Promise.reject(error)
);

axios_auth.interceptors.response.use(
  responseSuccessInterceptor,
  responseErrorInterceptor
);

// Apply interceptors to form data instance
axios_auth_form.interceptors.request.use(requestInterceptor, (error) =>
  Promise.reject(error)
);

axios_auth_form.interceptors.response.use(
  responseSuccessInterceptor,
  responseErrorInterceptor
);

// Export configured instances
export default axios_auth;
