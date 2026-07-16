export type AuditRole = "ADMIN" | "HR" | "CEO" | "COMPLIANCE_OFFICER" | "IT_ADMIN";

export type AuditEventType = 
  | "LOGIN_SUCCESS"
  | "LOGIN_FAILED"
  | "LOGOUT"
  | "PASSWORD_CHANGED"
  | "MFA_ENABLED"
  | "MFA_DISABLED"
  | "ROLE_UPDATED"
  | "PERMISSION_GRANTED"
  | "PROFILE_UPDATED"
  | "DATA_EXPORTED"
  | "LEAVE_APPROVED"
  | "LEAVE_REJECTED"
  | "ASSET_ASSIGNED"
  | "ASSET_REVOKED"
  | "DEPARTMENT_CREATED";

export type AuditEventStatus = "SUCCESS" | "FAILED" | "WARNING";
export type AuditEventModule = "AUTH" | "EMPLOYEES" | "ATTENDANCE" | "LEAVES" | "ASSETS" | "ORG" | "SYSTEM";

export interface AuditEvent {
  id: string;
  timestamp: string; // ISO 8601 string
  actor: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  action: AuditEventType;
  module: AuditEventModule;
  target?: {
    id: string;
    name: string;
    type: "USER" | "ROLE" | "DEPARTMENT" | "ASSET" | "REPORT" | "SYSTEM";
  };
  details?: string;
  status: AuditEventStatus;
  ipAddress: string;
  userAgent: string;
  location: string;
}

export interface AuditDashboardKPIs {
  totalEvents24h: number;
  failedLogins24h: number;
  criticalWarnings24h: number;
  dataExports24h: number;
}
