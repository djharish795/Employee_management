export interface LeaveRequest {
  id: string;
  type: "CASUAL_LEAVE" | "SICK_LEAVE" | "EARNED_LEAVE" | "MATERNITY_LEAVE" | "PATERNITY_LEAVE" | "SPECIAL_LEAVE";
  startDate: string;
  endDate: string;
  days: number;
  reason: string;
  status: "APPROVED" | "PENDING" | "REJECTED" | "CLARIFICATION";
  attachmentName?: string;
  emergencyContact: string;
  delegateName?: string;
  submittedDate: string;
  comments?: string;
  employeeName: string;
  department: string;
}

export interface LeaveBalance {
  type: string;
  allocated: number;
  used: number;
  available: number;
  pendingApproval: number;
}

export interface Holiday {
  date: string;
  name: string;
  type: "PUBLIC" | "RESTRICTED";
}

export interface LeavePolicy {
  type: string;
  description: string;
  eligibility: string;
  carryForwardDays: number;
  allocations: number;
}
