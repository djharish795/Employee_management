import { apiClient } from "./client";
import { AttendanceLog, AttendanceKPIs, OrgReportsResponse } from "@/types/attendance";

export const fetchTodayStatus = async (): Promise<{ state: "IN" | "BREAK" | "OUT", startTime: number, offset: number }> => {
  const { data } = await apiClient.get("/attendance/today");
  return data;
};

export const fetchMyLogs = async (): Promise<AttendanceLog[]> => {
  const { data } = await apiClient.get("/attendance/my-logs");
  // Assuming the backend returns { data: AttendanceLog[], total: number }
  return data.data; 
};

export const fetchMyKpis = async (): Promise<AttendanceKPIs> => {
  const { data } = await apiClient.get("/attendance/my-kpis");
  return data;
};

export const submitPunch = async (action: "IN" | "BREAK" | "OUT"): Promise<{ state: "IN" | "BREAK" | "OUT", startTime: number, offset: number }> => {
  const { data } = await apiClient.post("/attendance/punch", { action });
  return data;
};

export const fetchOrgReports = async (): Promise<OrgReportsResponse> => {
  const { data } = await apiClient.get("/attendance/org-reports");
  return data;
};
