import { apiClient } from "./client";
import { AttendanceLog, AttendanceKPIs, OrgReportsResponse, RegularizationRequest } from "@/types/attendance";

export const fetchTodayStatus = async (): Promise<{ state: "IN" | "BREAK" | "OUT" | "HOLIDAY" | "ON_LEAVE", startTime: number, offset: number }> => {
  const { data } = await apiClient.get("/attendance/today");
  return data;
};

export const fetchMyLogs = async (page = 1, limit = 20): Promise<{ data: AttendanceLog[], total: number, page: number, limit: number }> => {
  const { data } = await apiClient.get(`/attendance/my-logs?page=${page}&limit=${limit}`);
  return data;
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

export const fetchAllLogs = async (
  page = 1,
  limit = 20,
  filterStatus?: string,
  filterMonth?: string,
  searchQuery?: string
): Promise<{ data: AttendanceLog[], total: number, page: number, limit: number }> => {
  const params = new URLSearchParams();
  params.append("page", page.toString());
  params.append("limit", limit.toString());
  
  if (filterStatus) params.append("status", filterStatus);
  
  if (filterMonth) {
    // filterMonth is expected to be "MMM YYYY" e.g., "Jul 2026"
    const date = new Date(filterMonth);
    if (!isNaN(date.getTime())) {
      params.append("month", (date.getMonth() + 1).toString());
      params.append("year", date.getFullYear().toString());
    }
  }

  // Not implemented in backend yet but we can pass it if we want server-side searching
  if (searchQuery) params.append("search", searchQuery);

  const { data } = await apiClient.get(`/attendance/all-logs?${params.toString()}`);
  return data;
};

export const exportAllLogsCsv = () => {
  window.open(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/attendance/export-all`, '_blank');
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

export const fetchPendingOvertime = async (): Promise<any> => {
  const { data } = await apiClient.get(`/attendance/pending-overtime`);
  return data;
};

export const approveOvertime = async (recordId: string, status: 'APPROVE' | 'REJECT'): Promise<any> => {
  const { data } = await apiClient.post(`/attendance/records/${recordId}/approve-overtime`, { status });
  return data;
};
