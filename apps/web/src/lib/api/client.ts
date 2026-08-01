import axios from "axios";
import { useAuthStore } from "../../store/auth";
import CryptoJS from "crypto-js";

let apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
apiUrl = apiUrl.split('#')[0].trim();

const secret = process.env.NEXT_PUBLIC_API_ENCRYPTION_KEY;

export const apiClient = axios.create({
  baseURL: apiUrl,
  withCredentials: true,
});

// Request Interceptor: Encrypt Outgoing Payload
apiClient.interceptors.request.use((config) => {
  if (secret && config.data && !(config.data instanceof FormData)) {
    try {
      const keyHash = CryptoJS.SHA256(secret);
      const iv = CryptoJS.lib.WordArray.random(16);
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(config.data), keyHash, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });
      config.data = {
        payload: iv.toString(CryptoJS.enc.Base64) + ':' + encrypted.ciphertext.toString(CryptoJS.enc.Base64)
      };
    } catch (e) {
      console.error("Payload encryption failed:", e);
    }
  }
  return config;
});

// Response Interceptor: Handle 401 & Token Refresh & Decrypt Incoming Payload
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
  (response) => {
    if (secret && response.data && response.data.payload) {
      try {
        const parts = response.data.payload.split(':');
        if (parts.length === 2) {
          const keyHash = CryptoJS.SHA256(secret);
          const iv = CryptoJS.enc.Base64.parse(parts[0]);
          const ciphertext = CryptoJS.enc.Base64.parse(parts[1]);
          const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: ciphertext });
          const decrypted = CryptoJS.AES.decrypt(cipherParams, keyHash, {
            iv: iv,
            mode: CryptoJS.mode.CBC,
            padding: CryptoJS.pad.Pkcs7
          });
          response.data = JSON.parse(decrypted.toString(CryptoJS.enc.Utf8));
        }
      } catch (e) {
        console.error("Payload decryption failed:", e);
      }
    }
    return response;
  },
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
          .then(() => {
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await axios.post(`${apiUrl}/auth/refresh`, {}, { withCredentials: true });
        
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        useAuthStore.getState().clearSession();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
