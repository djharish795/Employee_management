export type SettingsRole = "SUPER_ADMIN" | "ADMIN" | "HR_ADMIN" | "IT_ADMIN" | "COMPLIANCE_OFFICER";

export interface SettingsKPIs {
  totalUsers: number;
  activeRoles: number;
  securityAlerts: number;
  activeWorkflows: number;
  integrationsConnected: number;
  complianceStatus: "HEALTHY" | "WARNING" | "CRITICAL";
}

export type PermissionAction = "READ" | "WRITE" | "DELETE" | "APPROVE" | "MANAGE";
export type SystemModule = "EMPLOYEES" | "ATTENDANCE" | "LEAVES" | "ASSETS" | "PAYROLL" | "AUDIT" | "SETTINGS";

export interface RolePermissionMatrix {
  roleId: string;
  roleName: string;
  permissions: Record<SystemModule, PermissionAction[]>;
}

export interface AdminUserRecord {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  status: "ACTIVE" | "INACTIVE" | "LOCKED";
  lastLogin: string;
  mfaEnabled: boolean;
}

export interface IntegrationStatus {
  id: string;
  provider: string;
  category: "HRIS" | "SSO" | "COMMUNICATION" | "STORAGE";
  isConnected: boolean;
  lastSync?: string;
  health: "GOOD" | "FAILING" | "UNKNOWN";
}
