import { apiClient } from "./client";

export interface ApiWfhRequest {
  id: string;
  employeeId: string;
  date: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvalQueue?: Array<{ role: string; status: string; approverId?: string; actedAt?: string }>;
  currentStep?: number;
  approvedAt?: string | null;
  employee?: { id: string; firstName: string; lastName: string; employeeId: string; department?: { name: string } };
}

// Note: apiClient baseURL is already http://localhost:3001/api/v1
// Paths here must NOT include the /api/v1 prefix

export const fetchMyWfh = async (employeeId: string): Promise<ApiWfhRequest[]> => {
  const { data } = await apiClient.get(`/wfh/my`, { params: { employeeId } });
  return data;
};

export const fetchWfhApprovals = async (approverId: string): Promise<ApiWfhRequest[]> => {
  const { data } = await apiClient.get(`/wfh/approvals`, { params: { approverId } });
  return data;
};

export const applyWfh = async (payload: {
  employeeId: string;
  date: string;
  reason: string;
}): Promise<{ message: string; data: ApiWfhRequest }> => {
  const { data } = await apiClient.post("/wfh/apply", payload);
  return data;
};

export const approveWfh = async (
  wfhId: string,
  approverId: string
): Promise<{ message: string }> => {
  const { data } = await apiClient.post(`/wfh/${wfhId}/approve`, { approverId });
  return data;
};

export const rejectWfh = async (
  wfhId: string,
  approverId: string,
  reason: string
): Promise<{ message: string }> => {
  const { data } = await apiClient.post(`/wfh/${wfhId}/reject`, { approverId, reason });
  return data;
};
