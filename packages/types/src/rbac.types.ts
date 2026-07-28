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
  CRM = "CRM",
}

export enum SidebarType {
  CEO = "CEO",
  CEM = "CEM",
  TEAM_LEAD = "TEAM_LEAD",
  EMPLOYEE = "EMPLOYEE",
  OE = "OE",
}

export interface RoleRegistryEntry {
  role: UserRole;
  defaultDashboard: string;
  sidebarType: SidebarType;
  allowedNamespaces: string[];
}

export const ROLE_REGISTRY: Record<UserRole, RoleRegistryEntry> = {
  [UserRole.SUPER_ADMIN]: {
    role: UserRole.SUPER_ADMIN,
    defaultDashboard: "/admin/dashboard",
    sidebarType: SidebarType.CEO,
    allowedNamespaces: ["/admin"]
  },
  [UserRole.CEO]: {
    role: UserRole.CEO,
    defaultDashboard: "/executive/dashboard",
    sidebarType: SidebarType.CEO,
    allowedNamespaces: ["/executive", "/org-chart"]
  },
  [UserRole.CTO]: {
    role: UserRole.CTO,
    defaultDashboard: "/cto/dashboard",
    sidebarType: SidebarType.CEO,
    allowedNamespaces: ["/cto", "/org-chart"]
  },
  [UserRole.COO]: {
    role: UserRole.COO,
    defaultDashboard: "/executive/dashboard",
    sidebarType: SidebarType.CEO,
    allowedNamespaces: ["/executive", "/org-chart"]
  },
  [UserRole.OPERATIONS_HEAD]: {
    role: UserRole.OPERATIONS_HEAD,
    defaultDashboard: "/executive/dashboard",
    sidebarType: SidebarType.CEO,
    allowedNamespaces: ["/executive", "/org-chart"]
  },
  [UserRole.CFO]: {
    role: UserRole.CFO,
    defaultDashboard: "/finance/dashboard",
    sidebarType: SidebarType.CEO,
    allowedNamespaces: ["/finance", "/org-chart"]
  },
  [UserRole.CHRO]: {
    role: UserRole.CHRO,
    defaultDashboard: "/hr/dashboard",
    sidebarType: SidebarType.CEO,
    allowedNamespaces: ["/hr", "/org-chart"]
  },
  [UserRole.HR]: {
    role: UserRole.HR,
    defaultDashboard: "/hr/dashboard",
    sidebarType: SidebarType.CEO,
    allowedNamespaces: ["/hr", "/org-chart", "/onboarding", "/offboarding"]
  },
  [UserRole.FINANCE]: {
    role: UserRole.FINANCE,
    defaultDashboard: "/finance/dashboard",
    sidebarType: SidebarType.CEO,
    allowedNamespaces: ["/finance", "/org-chart"]
  },
  [UserRole.MANAGER]: {
    role: UserRole.MANAGER,
    defaultDashboard: "/employee/dashboard",
    sidebarType: SidebarType.CEO,
    allowedNamespaces: ["/employee", "/org-chart"]
  },
  [UserRole.TEAM_LEAD]: {
    role: UserRole.TEAM_LEAD,
    defaultDashboard: "/employee/dashboard",
    sidebarType: SidebarType.TEAM_LEAD,
    allowedNamespaces: ["/employee", "/org-chart"]
  },
  [UserRole.EMPLOYEE]: {
    role: UserRole.EMPLOYEE,
    defaultDashboard: "/employee/dashboard",
    sidebarType: SidebarType.EMPLOYEE,
    allowedNamespaces: ["/employee"]
  },
  [UserRole.IT]: {
    role: UserRole.IT,
    defaultDashboard: "/admin/dashboard",
    sidebarType: SidebarType.CEO,
    allowedNamespaces: ["/admin"]
  },
  [UserRole.CEM]: {
    role: UserRole.CEM,
    defaultDashboard: "/cem/dashboard",
    sidebarType: SidebarType.CEM,
    allowedNamespaces: ["/cem", "/oe", "/om", "/crm"]
  },
  [UserRole.OM]: {
    role: UserRole.OM,
    defaultDashboard: "/om/dashboard",
    sidebarType: SidebarType.CEM,
    allowedNamespaces: ["/cem", "/oe", "/om", "/crm", "/org-chart"]
  },
  [UserRole.OE]: {
    role: UserRole.OE,
    defaultDashboard: "/oe/dashboard",
    sidebarType: SidebarType.OE,
    allowedNamespaces: ["/cem", "/oe", "/om", "/crm"]
  },
  [UserRole.CRM]: {
    role: UserRole.CRM,
    defaultDashboard: "/crm/dashboard",
    sidebarType: SidebarType.CEM,
    allowedNamespaces: ["/cem", "/oe", "/om", "/crm"]
  }
};

export const ROLE_SIDEBAR_TYPE: Record<UserRole, SidebarType> = Object.keys(ROLE_REGISTRY).reduce((acc, key) => {
  const k = key as UserRole;
  acc[k] = ROLE_REGISTRY[k].sidebarType;
  return acc;
}, {} as Record<UserRole, SidebarType>);

export function getSidebarTypeForRole(role: string): SidebarType {
  const entry = ROLE_REGISTRY[role as UserRole];
  return entry?.sidebarType ?? SidebarType.EMPLOYEE;
}

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = Object.keys(ROLE_REGISTRY).reduce((acc, key) => {
  const k = key as UserRole;
  acc[k] = ROLE_REGISTRY[k].defaultDashboard;
  return acc;
}, {} as Record<UserRole, string>);

export function getDashboardPathForRole(role: string): string {
  const entry = ROLE_REGISTRY[role as UserRole];
  return entry?.defaultDashboard ?? "/employee/dashboard";
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
  READ_PAYROLL = "READ_PAYROLL",
  ACCESS_CEM = "ACCESS_CEM",
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
    Permission.APPROVE_FIELD_REQUESTS,
  ],
  [UserRole.TEAM_LEAD]: [
    Permission.READ_OWN_PROFILE,
    Permission.WRITE_OWN_PROFILE,
    Permission.READ_TEAM_PROFILES,
    Permission.APPROVE_FIELD_REQUESTS,
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
    Permission.READ_PAYROLL,
  ],
  [UserRole.SUPER_ADMIN]: [
    Permission.READ_EMPLOYEES,
    Permission.WRITE_EMPLOYEES,
    Permission.READ_AUDIT,
    Permission.WRITE_OWN_PROFILE,
    Permission.READ_PAYROLL,
    Permission.ACCESS_CEM,
  ],
  [UserRole.FINANCE]: [
    Permission.READ_EMPLOYEES,
    Permission.READ_PAYROLL,
  ],
  [UserRole.CEO]: [
    Permission.READ_EMPLOYEES,
    Permission.READ_AUDIT,
    Permission.MANAGE_PROJECTS,
    Permission.ACCESS_SETTINGS,
    Permission.WRITE_OWN_PROFILE,
    Permission.ACCESS_CEM,
    Permission.APPROVE_FIELD_REQUESTS,
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
    Permission.READ_PAYROLL,
  ],
  [UserRole.IT]: [
    Permission.READ_EMPLOYEES,
  ],
  [UserRole.CEM]: [
    Permission.READ_EMPLOYEES,
    Permission.ACCESS_CEM,
  ],
  [UserRole.OM]: [
    Permission.READ_EMPLOYEES,
    Permission.APPROVE_FIELD_REQUESTS,
    Permission.ACCESS_CEM,
  ],
  [UserRole.OE]: [
    Permission.READ_EMPLOYEES,
    Permission.ACCESS_CEM,
  ],
  [UserRole.CRM]: [
    Permission.READ_EMPLOYEES,
    Permission.ACCESS_CEM,
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
