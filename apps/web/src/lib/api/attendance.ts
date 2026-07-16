import { apiClient } from "./client";
import { AttendanceLog, AttendanceKPIs, OrgReportsResponse, RegularizationRequest } from "@/types/attendance";

export const fetchTodayStatus = async (): Promise<{ state: "IN" | "BREAK" | "OUT", startTime: number, offset: number }> => {
  const { data } = await apiClient.get("/attendance/today");
  return data;
};

export const fetchMyLogs = async (page = 1, limit = 100): Promise<AttendanceLog[]> => {
  const { data } = await apiClient.get(`/attendance/my-logs?page=${page}&limit=${limit}`);
  // Assuming the backend returns { data: AttendanceLog[], total: number }
  return data.data; 
};

export const fetchMyKpis = async (): Promise<AttendanceKPIs> => {
  const { data } = await apiClient.get("/attendance/my-kpis");
  return data;
};

export const submitPunch = async (action: "IN" | "BREAK" | "OUT"): Promise<{ state: "IN" | "BREAK" | "OUT", startTime: number, offset: number }> => {
  const { data } = await apiClient.post("/attendance/punch", { action, idempotencyKey: crypto.randomUUID() });
  return data;
};

export const fetchOrgReports = async (): Promise<OrgReportsResponse> => {
  const { data } = await apiClient.get("/attendance/org-reports");
  return data;
};

export const fetchSummaryToday = async (date?: string, departmentId?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (date) params.append("date", date);
  if (departmentId && departmentId !== 'all') params.append("departmentId", departmentId);
  const { data } = await apiClient.get(`/attendance/summary-today?${params.toString()}`);
  return data;
};

export const fetchAllLogs = async (page = 1, limit = 500): Promise<AttendanceLog[]> => {
  const { data } = await apiClient.get(`/attendance/all-logs?page=${page}&limit=${limit}`);
  return data.data;
};

export const fetchRegularizations = async (): Promise<RegularizationRequest[]> => {
  const { data } = await apiClient.get("/attendance/regularizations");
  return data;
};

export const submitRegularization = async (payload: Partial<RegularizationRequest>): Promise<RegularizationRequest> => {
  const { data } = await apiClient.post("/attendance/regularize", payload);
  return data;
};

export const actionRegularization = async (id: string, action: "APPROVE" | "REJECT", approver: "MANAGER" | "HR"): Promise<RegularizationRequest> => {
  const { data } = await apiClient.patch(`/attendance/regularizations/${id}/action`, { action, approver });
  return data;
};

export const fetchTeamAttendanceView = async (dateStr?: string): Promise<any> => {
  const params = new URLSearchParams();
  if (dateStr) params.append("date", dateStr);
  const { data } = await apiClient.get(`/attendance/team-view?${params.toString()}`);
  return data;
};
