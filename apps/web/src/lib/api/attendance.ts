import axios from "axios";
import { AttendanceLog, AttendanceKPIs } from "@/types/attendance";

// Create a configured axios instance
// Assumes Next.js proxies `/api/v1` to the NestJS backend, or we are calling it directly
const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

// We assume there's a way to attach the JWT token in the future. 
// For now, if the user has an auth token, we would inject it via an interceptor here.
apiClient.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const tokenMatch = document.cookie.match(new RegExp('(^| )token=([^;]+)'));
    const token = tokenMatch ? tokenMatch[2] : null;
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

export const fetchTodayStatus = async (): Promise<{ state: "IN" | "BREAK" | "OUT", startTime: number, offset: number }> => {
  const { data } = await apiClient.get("/api/v1/attendance/today");
  return data;
};

export const fetchMyLogs = async (): Promise<AttendanceLog[]> => {
  const { data } = await apiClient.get("/api/v1/attendance/my-logs");
  // Assuming the backend returns { data: AttendanceLog[], total: number }
  return data.data; 
};

export const fetchMyKpis = async (): Promise<AttendanceKPIs> => {
  const { data } = await apiClient.get("/api/v1/attendance/my-kpis");
  return data;
};

export const submitPunch = async (action: "IN" | "BREAK" | "OUT"): Promise<void> => {
  await apiClient.post("/api/v1/attendance/punch", { action });
};
