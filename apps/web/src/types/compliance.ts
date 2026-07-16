export type ComplianceRole = "CEO" | "HR" | "COMPLIANCE_OFFICER" | "ADMIN" | "LEGAL";

export type ConsentStatus = "ACTIVE" | "EXPIRED" | "REVOKED" | "PENDING";
export type ConsentType = "DATA_PROCESSING" | "BIOMETRIC" | "BACKGROUND_CHECK" | "MARKETING";

export interface ConsentRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  type: ConsentType;
  status: ConsentStatus;
  dateAccepted: string; // ISO String
  expiryDate?: string; // ISO String
  lastUpdated: string; // ISO String
}

export type PolicyStatus = "PUBLISHED" | "DRAFT" | "ARCHIVED";
export type PolicyCategory = "SECURITY" | "HR" | "LEGAL" | "OPERATIONS";

export interface PolicyRecord {
  id: string;
  title: string;
  version: string;
  category: PolicyCategory;
  status: PolicyStatus;
  publishedDate?: string;
  acceptanceRate: number; // Percentage 0-100
  totalEmployees: number;
  acceptedEmployees: number;
}

export type RequestType = "DATA_ACCESS" | "DATA_CORRECTION" | "DATA_DELETION";
export type RequestStatus = "RECEIVED" | "REVIEWING" | "APPROVED" | "FULFILLED" | "REJECTED";

export interface ComplianceRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  type: RequestType;
  status: RequestStatus;
  dateSubmitted: string;
  slaDeadline: string; // Due date
  assignedTo?: string; // Role or UserId
}

export interface ComplianceKPIs {
  complianceScore: number;
  activeConsents: number;
  pendingRequests: number;
  policyAcknowledgements: number;
  complianceViolations: number;
}
