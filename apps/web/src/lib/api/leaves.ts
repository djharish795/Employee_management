import { apiClient } from "./client";

// ─── Types matching the backend LeavesService responses ─────────────────────

export interface ApiLeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approvalQueue?: Array<{ role: string; status: string; approverId?: string; actedAt?: string }>;
  currentStep?: number;
  rejectionReason?: string | null;
  approvedAt?: string | null;
  employee?: { id: string; firstName: string; lastName: string; employeeId: string; department?: { name: string } };
  leaveType?: { id: string; name: string; code: string };
}

export interface ApiLeaveKpi {
  totalLeaves: number;
  usedLeaves: number;
  pendingLeaves: number;
  availableLeaves: number;
  details: Array<{
    id: string;
    allocated: number;
    used: number;
    pending: number;
    carriedOver: number;
    leaveType: { name: string; code: string };
    year: number;
  }>;
}

export interface ApiCalendarEvent {
  id: string;
  employeeId: string;
  startDate: string;
  endDate: string;
  totalDays: number;
  status: string;
  employee?: { firstName: string; lastName: string };
  leaveType?: { name: string };
}

// ─── Fetch my KPI (balance summary) for the logged-in employee ───────────────
export const fetchMyLeaveKpi = async (employeeId: string): Promise<ApiLeaveKpi> => {
  const { data } = await apiClient.get(`/api/v1/leaves/kpi/${employeeId}`);
  return data;
};

// ─── Fetch approvals queue for an approver ────────────────────────────────────
export const fetchApprovals = async (approverId: string): Promise<ApiLeaveRequest[]> => {
  const { data } = await apiClient.get(`/api/v1/leaves/approvals/${approverId}`);
  return data;
};

// ─── Apply for leave ──────────────────────────────────────────────────────────
export const applyLeave = async (payload: {
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason: string;
}): Promise<{ message: string; data: ApiLeaveRequest }> => {
  const { data } = await apiClient.post("/api/v1/leaves/apply", payload);
  return data;
};

// ─── Approve a leave request ──────────────────────────────────────────────────
export const approveLeave = async (
  leaveId: string,
  approverId: string
): Promise<{ message: string }> => {
  const { data } = await apiClient.post(`/api/v1/leaves/${leaveId}/approve`, { approverId });
  return data;
};

// ─── Reject a leave request ───────────────────────────────────────────────────
export const rejectLeave = async (
  leaveId: string,
  approverId: string,
  reason: string
): Promise<{ message: string }> => {
  const { data } = await apiClient.post(`/api/v1/leaves/${leaveId}/reject`, { approverId, reason });
  return data;
};

// ─── Get approved leaves for calendar view ────────────────────────────────────
export const fetchLeaveCalendar = async (): Promise<ApiCalendarEvent[]> => {
  const { data } = await apiClient.get("/api/v1/leaves/calendar");
  return data;
};
