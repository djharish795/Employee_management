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
  accruedLeaves: number;
  usedLeaves: number;
  pendingLeaves: number;
  availableLeaves: number;
  details: Array<{
    id: string;
    yearlyAllocated?: number;
    allocated: number;
    used: number;
    pending: number;
    carriedOver: number;
    leaveType: { name: string; code: string; isPaidLeave?: boolean };
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
// Note: apiClient baseURL is already http://localhost:3001/api/v1
// So paths here must NOT include /api/v1 prefix
export const fetchMyLeaveKpi = async (employeeId: string): Promise<ApiLeaveKpi> => {
  const { data } = await apiClient.get(`/leaves/kpi`, { params: { employeeId } });
  return data;
};

// ─── Fetch approvals queue for an approver ────────────────────────────────────
export const fetchApprovals = async (approverId: string): Promise<ApiLeaveRequest[]> => {
  const { data } = await apiClient.get(`/leaves/approvals/${approverId}`);
  return data;
};

// ─── Apply for leave ──────────────────────────────────────────────────────────
export const applyLeave = async (payload: {
  employeeId: string;
  leaveTypeIds: string[];
  startDate: string;
  endDate: string;
  reason: string;
  isHalfDay?: boolean;
  halfDaySession?: string | null;
}): Promise<{ message: string; data: any }> => {
  const { data } = await apiClient.post("/leaves/apply", payload);
  return data;
};

// ─── Calculate leave deductions ───────────────────────────────────────────────
export const calculateLeave = async (payload: {
  employeeId: string;
  leaveTypeIds: string[];
  startDate: string;
  endDate: string;
  isHalfDay?: boolean;
  reason?: string;
  halfDaySession?: string | null;
}): Promise<{ totalDays: number; paidDays: number; unpaidDays: number; deductionAmount: number }> => {
  const { data } = await apiClient.post("/leaves/calculate", payload);
  return data;
};

// ─── Get My Leaves ───────────────────────────────────────────────────────────
export const getMyLeaves = async (employeeId?: string): Promise<any[]> => {
  const url = employeeId ? `/leaves/my?employeeId=${employeeId}` : "/leaves/my";
  const { data } = await apiClient.get(url);
  return data;
};

// ─── Approve a leave request ──────────────────────────────────────────────────
export const approveLeave = async (
  leaveId: string,
  approverId: string
): Promise<{ message: string }> => {
  const { data } = await apiClient.post(`/leaves/${leaveId}/approve`, { approverId });
  return data;
};

// ─── Reject a leave request ───────────────────────────────────────────────────
export const rejectLeave = async (
  leaveId: string,
  approverId: string,
  reason: string
): Promise<{ message: string }> => {
  const { data } = await apiClient.post(`/leaves/${leaveId}/reject`, { approverId, reason });
  return data;
};

// ─── Cancel a leave request ───────────────────────────────────────────────────
export const cancelLeaveRequest = async (
  leaveId: string
): Promise<{ message: string }> => {
  const { data } = await apiClient.post(`/leaves/${leaveId}/cancel`);
  return data;
};

// ─── Fetch my leave requests ──────────────────────────────────────────────────

// ─── Get approved leaves for calendar view ────────────────────────────────────
export const fetchLeaveCalendar = async (employeeId?: string): Promise<ApiLeaveRequest[]> => {
  const url = employeeId ? `/leaves/calendar?employeeId=${employeeId}` : "/leaves/calendar";
  const { data } = await apiClient.get(url);
  return data;
};
