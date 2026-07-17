export enum UserRole {
  SUPER_ADMIN = "SUPER_ADMIN",
  CEO = "CEO",
  CTO = "CTO",
  COO = "COO",
  OPERATIONS_HEAD = "OPERATIONS_HEAD",
  CFO = "CFO",
  CHRO = "CHRO",
  HR = "HR",
  FINANCE = "FINANCE",
  MANAGER = "MANAGER",
  TEAM_LEAD = "TEAM_LEAD",
  EMPLOYEE = "EMPLOYEE",
  IT = "IT",
  CEM = "CEM",
  OM = "OM",
  OE = "OE",
}

export enum SidebarType {
  CEO = "CEO",
  CEM = "CEM",
  TEAM_LEAD = "TEAM_LEAD",
  EMPLOYEE = "EMPLOYEE",
}

export const ROLE_SIDEBAR_TYPE: Record<UserRole, SidebarType> = {
  [UserRole.SUPER_ADMIN]: SidebarType.CEO,
  [UserRole.CEO]: SidebarType.CEO,
  [UserRole.CTO]: SidebarType.CEO,
  [UserRole.COO]: SidebarType.CEO,
  [UserRole.OPERATIONS_HEAD]: SidebarType.CEO,
  [UserRole.CFO]: SidebarType.CEO,
  [UserRole.CHRO]: SidebarType.CEO,
  [UserRole.HR]: SidebarType.CEO,
  [UserRole.FINANCE]: SidebarType.CEO,
  [UserRole.MANAGER]: SidebarType.CEO,
  [UserRole.TEAM_LEAD]: SidebarType.TEAM_LEAD,
  [UserRole.EMPLOYEE]: SidebarType.EMPLOYEE,
  [UserRole.IT]: SidebarType.CEO,
  [UserRole.CEM]: SidebarType.CEM,
  [UserRole.OM]: SidebarType.CEM,
  [UserRole.OE]: SidebarType.CEM,
};

export function getSidebarTypeForRole(role: string): SidebarType {
  return ROLE_SIDEBAR_TYPE[role as UserRole] ?? SidebarType.EMPLOYEE;
}

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: "/admin/dashboard",
  [UserRole.CEO]: "/executive/dashboard",
  [UserRole.CTO]: "/cto/dashboard",
  [UserRole.COO]: "/executive/dashboard",
  [UserRole.OPERATIONS_HEAD]: "/executive/dashboard",
  [UserRole.CFO]: "/finance/dashboard",
  [UserRole.CHRO]: "/hr/dashboard",
  [UserRole.HR]: "/hr/dashboard",
  [UserRole.FINANCE]: "/finance/dashboard",
  [UserRole.MANAGER]: "/employee/dashboard",
  [UserRole.TEAM_LEAD]: "/employee/dashboard",
  [UserRole.EMPLOYEE]: "/employee/dashboard",
  [UserRole.IT]: "/admin/dashboard",
  [UserRole.CEM]: "/cam/dashboard",
  [UserRole.OE]: "/oe/dashboard",
  [UserRole.OM]: "/om/dashboard",
};

export function getDashboardPathForRole(role: string): string {
  return ROLE_DASHBOARD_PATH[role as UserRole] ?? "/employee/dashboard";
}

export enum Permission {
  READ_EMPLOYEES = "READ_EMPLOYEES",
  WRITE_EMPLOYEES = "WRITE_EMPLOYEES",
  READ_TEAM_PROFILES = "READ_TEAM_PROFILES",
  READ_OWN_PROFILE = "READ_OWN_PROFILE",
  WRITE_OWN_PROFILE = "WRITE_OWN_PROFILE",
  READ_AUDIT = "READ_AUDIT",
  APPROVE_FIELD_REQUESTS = "APPROVE_FIELD_REQUESTS",
  MANAGE_PROJECTS = "MANAGE_PROJECTS",
  ACCESS_SETTINGS = "ACCESS_SETTINGS",
}

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.EMPLOYEE]: [
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
  ],
  [UserRole.MANAGER]: [
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
    Permission.READ_TEAM_PROFILES,
  ],
  [UserRole.TEAM_LEAD]: [
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
    Permission.READ_TEAM_PROFILES,
  ],
  [UserRole.HR]: [
    Permission.READ_EMPLOYEES,
    Permission.WRITE_EMPLOYEES,
    Permission.READ_AUDIT,
    Permission.WRITE_OWN_PROFILE,
  ],
  [UserRole.CHRO]: [
    Permission.READ_EMPLOYEES,
    Permission.WRITE_EMPLOYEES,
    Permission.WRITE_OWN_PROFILE,
  ],
  [UserRole.SUPER_ADMIN]: [
    Permission.READ_EMPLOYEES,
    Permission.WRITE_EMPLOYEES,
    Permission.READ_AUDIT,
    Permission.WRITE_OWN_PROFILE,
  ],
  [UserRole.FINANCE]: [
    Permission.READ_EMPLOYEES,
  ],
  [UserRole.CEO]: [
    Permission.READ_EMPLOYEES,
    Permission.READ_AUDIT,
    Permission.MANAGE_PROJECTS,
    Permission.ACCESS_SETTINGS,
    Permission.WRITE_OWN_PROFILE,
  ],
  [UserRole.CTO]: [
    Permission.READ_EMPLOYEES,
    Permission.READ_AUDIT,
    Permission.MANAGE_PROJECTS,
    Permission.WRITE_OWN_PROFILE,
  ],
  [UserRole.COO]: [
    Permission.READ_EMPLOYEES,
  ],
  [UserRole.OPERATIONS_HEAD]: [
    Permission.READ_EMPLOYEES,
    Permission.APPROVE_FIELD_REQUESTS,
  ],
  [UserRole.CFO]: [
    Permission.READ_EMPLOYEES,
  ],
  [UserRole.IT]: [
    Permission.READ_EMPLOYEES,
  ],
  [UserRole.CEM]: [
    Permission.READ_EMPLOYEES,
  ],
  [UserRole.OM]: [
    Permission.READ_EMPLOYEES,
    Permission.APPROVE_FIELD_REQUESTS,
  ],
  [UserRole.OE]: [
    Permission.READ_EMPLOYEES,
  ],
};

export function hasPermission(role: string | null | undefined, permission: Permission): boolean {
  if (!role) return false;
  const userRole = role.toUpperCase() as UserRole;
  const permissions = ROLE_PERMISSIONS[userRole] || [];
  // Universally grant own profile read and write access to all roles
  // (Because every user is fundamentally an employee who needs to check in, manage own leave, etc.)
  if (permission === Permission.READ_OWN_PROFILE || permission === Permission.WRITE_OWN_PROFILE) {
    return true;
  }
  return permissions.includes(permission);
}
