/**
 * Centralized Permission Constants for future RBAC implementation.
 * Designed to replace legacy enum-based permissions with fine-grained granular access.
 */
export const RbacPermissions = {
  // Employees
  EMPLOYEES_READ: 'employees.read',
  EMPLOYEES_CREATE: 'employees.create',
  EMPLOYEES_UPDATE: 'employees.update',
  EMPLOYEES_DELETE: 'employees.delete',
  EMPLOYEES_EXPORT: 'employees.export',

  // Departments
  DEPARTMENTS_READ: 'departments.read',
  DEPARTMENTS_CREATE: 'departments.create',
  DEPARTMENTS_UPDATE: 'departments.update',
  DEPARTMENTS_DELETE: 'departments.delete',

  // Designations
  DESIGNATIONS_READ: 'designations.read',
  DESIGNATIONS_CREATE: 'designations.create',
  DESIGNATIONS_UPDATE: 'designations.update',
  DESIGNATIONS_DELETE: 'designations.delete',

  // Leave
  LEAVE_READ: 'leave.read',
  LEAVE_CREATE: 'leave.create',
  LEAVE_APPROVE: 'leave.approve',
  LEAVE_REJECT: 'leave.reject',
  LEAVE_EXPORT: 'leave.export',

  // Attendance
  ATTENDANCE_READ: 'attendance.read',
  ATTENDANCE_MANAGE: 'attendance.manage',

  // Assets
  ASSETS_READ: 'assets.read',
  ASSETS_CREATE: 'assets.create',
  ASSETS_ALLOCATE: 'assets.allocate',
  ASSETS_RETURN: 'assets.return',
  ASSETS_RETIRE: 'assets.retire',

  // Tasks
  TASKS_READ: 'tasks.read',
  TASKS_CREATE: 'tasks.create',
  TASKS_ASSIGN: 'tasks.assign',
  TASKS_UPDATE: 'tasks.update',
  TASKS_COMPLETE: 'tasks.complete',

  // Projects
  PROJECTS_READ: 'projects.read',
  PROJECTS_CREATE: 'projects.create',
  PROJECTS_ASSIGN: 'projects.assign',
  PROJECTS_MANAGE: 'projects.manage',

  // Documents
  DOCUMENTS_READ: 'documents.read',
  DOCUMENTS_UPLOAD: 'documents.upload',
  DOCUMENTS_DELETE: 'documents.delete',
  DOCUMENTS_EXPORT: 'documents.export',

  // Compliance
  COMPLIANCE_READ: 'compliance.read',
  COMPLIANCE_MANAGE: 'compliance.manage',

  // WFH
  WFH_READ: 'wfh.read',
  WFH_CREATE: 'wfh.create',
  WFH_APPROVE: 'wfh.approve',
  WFH_REJECT: 'wfh.reject',

  // Analytics & Dashboard
  DASHBOARD_VIEW: 'dashboard.view',
  ANALYTICS_VIEW: 'analytics.view',

  // Recruitment
  RECRUITMENT_READ: 'recruitment.read',
  RECRUITMENT_CREATE: 'recruitment.create',
  RECRUITMENT_UPDATE: 'recruitment.update',
  RECRUITMENT_DELETE: 'recruitment.delete',

  // Payroll
  PAYROLL_READ: 'payroll.read',
  PAYROLL_MANAGE: 'payroll.manage',

  // Knowledge
  KNOWLEDGE_READ: 'knowledge.read',
  KNOWLEDGE_CREATE: 'knowledge.create',
  KNOWLEDGE_UPDATE: 'knowledge.update',
  KNOWLEDGE_DELETE: 'knowledge.delete',

  // Learning
  LEARNING_READ: 'learning.read',
  LEARNING_MANAGE: 'learning.manage',

  // Engagement
  ENGAGEMENT_READ: 'engagement.read',
  ENGAGEMENT_MANAGE: 'engagement.manage',

  // Settings
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_MANAGE: 'settings.manage',

  // Talent & Succession
  TALENT_READ: 'talent.read',
  TALENT_MANAGE: 'talent.manage',

  // Reports
  REPORTS_READ: 'reports.read',
  REPORTS_GENERATE: 'reports.generate',

  // Workflows
  WORKFLOWS_READ: 'workflows.read',
  WORKFLOWS_MANAGE: 'workflows.manage',

  // Health
  HEALTH_READ: 'health.read',

  // Notifications
  NOTIFICATIONS_READ: 'notifications.read',
  NOTIFICATIONS_MANAGE: 'notifications.manage',

  // Connect (Zoom, etc)
  CONNECT_READ: 'connect.read',
  CONNECT_MANAGE: 'connect.manage',

  // Profile (Own)
  PROFILE_READ: 'profile.read',
  PROFILE_UPDATE: 'profile.update',

  // System
  AUDIT_READ: 'audit.read',
  ROLES_READ: 'roles.read',
  ROLES_MANAGE: 'roles.manage',
} as const;

export type RbacPermissionType = typeof RbacPermissions[keyof typeof RbacPermissions];

/**
 * Standard Role Definitions for future RBAC engine.
 */
export const RbacRoles = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  CEO: 'CEO',
  COO: 'COO',
  OPERATIONS_HEAD: 'OPERATIONS_HEAD',
  CTO: 'CTO',
  CHRO: 'CHRO',
  HR: 'HR',
  MANAGER: 'MANAGER',
  TEAM_LEAD: 'TEAM_LEAD',
  TL: 'TL', // Inconsistency: Abbreviated TL vs TEAM_LEAD
  QA: 'QA',
  COMPLIANCE_OFFICER: 'COMPLIANCE_OFFICER',
  LEGAL: 'LEGAL',
  IT: 'IT',
  FINANCE: 'FINANCE',
  EMPLOYEE: 'EMPLOYEE',

  // Department-specific shorthand roles found in WFH service
  OR: 'OR',
  OPS: 'OPS',
  AR: 'AR',
  ADMIN: 'ADMIN',
  TR: 'TR',
  OM: 'OM',
} as const;

export type RbacRoleType = typeof RbacRoles[keyof typeof RbacRoles];

/**
 * Baseline Permission Mappings defining what each role can access.
 */
export const RbacRolePermissionsMapping: Record<RbacRoleType, RbacPermissionType[]> = {
  [RbacRoles.CEO]: [
    RbacPermissions.PROFILE_READ,
    RbacPermissions.PROFILE_UPDATE,
    RbacPermissions.LEAVE_READ,
    RbacPermissions.LEAVE_CREATE,
    RbacPermissions.LEAVE_APPROVE,
    RbacPermissions.LEAVE_REJECT,
    RbacPermissions.EMPLOYEES_READ,
    RbacPermissions.DEPARTMENTS_READ,
    RbacPermissions.DASHBOARD_VIEW,
    RbacPermissions.AUDIT_READ,
    RbacPermissions.ASSETS_ALLOCATE,
    RbacPermissions.TASKS_READ,
    RbacPermissions.TASKS_CREATE,
    RbacPermissions.TASKS_ASSIGN,
    RbacPermissions.TASKS_UPDATE,
    RbacPermissions.DOCUMENTS_READ,
    RbacPermissions.DOCUMENTS_UPLOAD,
    RbacPermissions.COMPLIANCE_READ,
    RbacPermissions.COMPLIANCE_MANAGE,
    RbacPermissions.NOTIFICATIONS_READ,
    RbacPermissions.NOTIFICATIONS_MANAGE,
    RbacPermissions.SETTINGS_VIEW,
    RbacPermissions.SETTINGS_MANAGE,
    RbacPermissions.REPORTS_READ,
    RbacPermissions.REPORTS_GENERATE,
    RbacPermissions.PROFILE_READ,
    RbacPermissions.PROFILE_UPDATE,
  ],
  [RbacRoles.HR]: [
    RbacPermissions.PROFILE_READ,
    RbacPermissions.PROFILE_UPDATE,
    RbacPermissions.LEAVE_READ,
    RbacPermissions.LEAVE_CREATE,
    RbacPermissions.LEAVE_APPROVE,
    RbacPermissions.LEAVE_REJECT,
    RbacPermissions.EMPLOYEES_READ,
    RbacPermissions.EMPLOYEES_CREATE,
    RbacPermissions.EMPLOYEES_UPDATE,
    RbacPermissions.EMPLOYEES_DELETE,
    RbacPermissions.EMPLOYEES_EXPORT,
    RbacPermissions.DEPARTMENTS_READ,
    RbacPermissions.DEPARTMENTS_CREATE,
    RbacPermissions.DEPARTMENTS_UPDATE,
    RbacPermissions.DEPARTMENTS_DELETE,
    RbacPermissions.DESIGNATIONS_READ,
    RbacPermissions.DESIGNATIONS_CREATE,
    RbacPermissions.DESIGNATIONS_UPDATE,
    RbacPermissions.DESIGNATIONS_DELETE,
    RbacPermissions.DASHBOARD_VIEW,
    RbacPermissions.AUDIT_READ,
    RbacPermissions.REPORTS_READ,
    RbacPermissions.REPORTS_GENERATE,
    RbacPermissions.NOTIFICATIONS_READ,
    RbacPermissions.NOTIFICATIONS_MANAGE,
    RbacPermissions.LEAVE_READ,
    RbacPermissions.LEAVE_CREATE,
    RbacPermissions.LEAVE_APPROVE,
    RbacPermissions.LEAVE_REJECT,
    RbacPermissions.LEAVE_EXPORT,
    RbacPermissions.ATTENDANCE_READ,
    RbacPermissions.ATTENDANCE_MANAGE,
    RbacPermissions.ASSETS_READ,
    RbacPermissions.ASSETS_CREATE,
    RbacPermissions.ASSETS_ALLOCATE,
    RbacPermissions.ASSETS_RETURN,
    RbacPermissions.ASSETS_RETIRE,
    RbacPermissions.DOCUMENTS_READ,
    RbacPermissions.DOCUMENTS_UPLOAD,
    RbacPermissions.DOCUMENTS_DELETE,
    RbacPermissions.DOCUMENTS_EXPORT,
    RbacPermissions.COMPLIANCE_READ,
    RbacPermissions.COMPLIANCE_MANAGE,
    RbacPermissions.WFH_READ,
    RbacPermissions.WFH_CREATE,
    RbacPermissions.WFH_APPROVE,
    RbacPermissions.WFH_REJECT,
    RbacPermissions.WORKFLOWS_READ,
    RbacPermissions.WORKFLOWS_MANAGE,
    RbacPermissions.PROFILE_READ,
    RbacPermissions.PROFILE_UPDATE,
    RbacPermissions.RECRUITMENT_READ,
    RbacPermissions.RECRUITMENT_CREATE,
    RbacPermissions.RECRUITMENT_UPDATE,
    RbacPermissions.RECRUITMENT_DELETE,
    RbacPermissions.LEARNING_READ,
    RbacPermissions.LEARNING_MANAGE,
    RbacPermissions.ENGAGEMENT_READ,
    RbacPermissions.ENGAGEMENT_MANAGE,
    RbacPermissions.TALENT_READ,
    RbacPermissions.TALENT_MANAGE,
    RbacPermissions.KNOWLEDGE_READ,
    RbacPermissions.KNOWLEDGE_CREATE,
    RbacPermissions.KNOWLEDGE_UPDATE,
    RbacPermissions.KNOWLEDGE_DELETE,
  ],
  [RbacRoles.CHRO]: [
    RbacPermissions.EMPLOYEES_READ,
    RbacPermissions.EMPLOYEES_CREATE,
    RbacPermissions.EMPLOYEES_UPDATE,
    RbacPermissions.EMPLOYEES_DELETE,
    RbacPermissions.DEPARTMENTS_READ,
    RbacPermissions.DASHBOARD_VIEW,
    RbacPermissions.AUDIT_READ,
    RbacPermissions.REPORTS_READ,
    RbacPermissions.REPORTS_GENERATE,
    RbacPermissions.NOTIFICATIONS_READ,
    RbacPermissions.NOTIFICATIONS_MANAGE,
    RbacPermissions.LEAVE_READ,
    RbacPermissions.LEAVE_APPROVE,
    RbacPermissions.ATTENDANCE_READ,
    RbacPermissions.ASSETS_READ,
    RbacPermissions.COMPLIANCE_READ,
    RbacPermissions.COMPLIANCE_MANAGE,
    RbacPermissions.PROFILE_READ,
    RbacPermissions.PROFILE_UPDATE,
  ],
  [RbacRoles.MANAGER]: [
    RbacPermissions.EMPLOYEES_READ, // Team level handled by logic later
    RbacPermissions.DEPARTMENTS_READ,
    RbacPermissions.DASHBOARD_VIEW,
  ],
  [RbacRoles.EMPLOYEE]: [
    RbacPermissions.EMPLOYEES_READ, // Own profile handled by logic later
    RbacPermissions.DASHBOARD_VIEW,
  ],
  // Fallback for new roles (to be filled in later phases)
  [RbacRoles.SUPER_ADMIN]: [RbacPermissions.AUDIT_READ, RbacPermissions.SETTINGS_VIEW, RbacPermissions.SETTINGS_MANAGE, RbacPermissions.DASHBOARD_VIEW, RbacPermissions.EMPLOYEES_READ, RbacPermissions.DEPARTMENTS_READ, RbacPermissions.REPORTS_READ, RbacPermissions.REPORTS_GENERATE],
  [RbacRoles.CTO]: [],
  [RbacRoles.COO]: [],
  [RbacRoles.OPERATIONS_HEAD]: [],
  [RbacRoles.CHRO]: [],
  [RbacRoles.TEAM_LEAD]: [],
  [RbacRoles.TL]: [],
  [RbacRoles.QA]: [],
  [RbacRoles.COMPLIANCE_OFFICER]: [],
  [RbacRoles.LEGAL]: [],
  [RbacRoles.IT]: [],
  [RbacRoles.FINANCE]: [],
  [RbacRoles.OR]: [],
  [RbacRoles.OPS]: [],
  [RbacRoles.AR]: [],
  [RbacRoles.ADMIN]: [],
  [RbacRoles.TR]: [],
  [RbacRoles.OM]: [
    RbacPermissions.ASSETS_ALLOCATE,
    RbacPermissions.NOTIFICATIONS_READ,
    RbacPermissions.REPORTS_READ,
    RbacPermissions.REPORTS_GENERATE,
    RbacPermissions.PROFILE_READ,
  ],
};

/**
 * Standardized Role Groupings to replace inline array checks (e.g. ['CEO', 'CTO'].includes(role))
 */
export const RbacGroups = {
  GLOBAL_ADMINS: [RbacRoles.SUPER_ADMIN, RbacRoles.CEO, RbacRoles.CTO],
  LEAD_OR_MANAGER: [RbacRoles.TEAM_LEAD, RbacRoles.MANAGER, RbacRoles.CTO, RbacRoles.CEO, RbacRoles.SUPER_ADMIN],
  MANAGER_OR_HIGHER: [RbacRoles.MANAGER, RbacRoles.CTO, RbacRoles.CEO, RbacRoles.SUPER_ADMIN],
  LEAVE_APPROVERS: [RbacRoles.TL, RbacRoles.QA, RbacRoles.MANAGER],
  ASSET_PRIVILEGED: [RbacRoles.SUPER_ADMIN, RbacRoles.IT, RbacRoles.HR, RbacRoles.CHRO, RbacRoles.CEO, RbacRoles.CTO, RbacRoles.OM],
  ASSET_VIEWERS: [RbacRoles.SUPER_ADMIN, RbacRoles.CEO, RbacRoles.CTO, RbacRoles.CHRO, RbacRoles.HR, RbacRoles.IT, RbacRoles.OM],
  ASSET_FINANCIAL_VIEWERS: [RbacRoles.SUPER_ADMIN, RbacRoles.CEO, RbacRoles.FINANCE, RbacRoles.IT, RbacRoles.HR, RbacRoles.CHRO, RbacRoles.OM], // Note: CFO mapped to FINANCE
  ASSET_CREATORS: [RbacRoles.SUPER_ADMIN, RbacRoles.IT, RbacRoles.HR, RbacRoles.OM],
  ASSET_ADMINS: [RbacRoles.SUPER_ADMIN, RbacRoles.IT, RbacRoles.HR],
  ASSET_MANAGERS: [RbacRoles.MANAGER, RbacRoles.TEAM_LEAD],
  COMPLIANCE_ADMINS: [RbacRoles.SUPER_ADMIN, RbacRoles.HR, RbacRoles.COMPLIANCE_OFFICER, RbacRoles.LEGAL],
  KNOWLEDGE_WRITERS: [RbacRoles.SUPER_ADMIN, RbacRoles.CEO, RbacRoles.CTO, RbacRoles.COO, RbacRoles.OPERATIONS_HEAD, RbacRoles.CHRO, RbacRoles.HR, RbacRoles.IT],
  ATTENDANCE_ADMINS: [RbacRoles.HR, RbacRoles.CHRO, RbacRoles.CEO, RbacRoles.SUPER_ADMIN, RbacRoles.IT, RbacRoles.FINANCE],
  HR_OR_SUPER_ADMIN: [RbacRoles.HR, RbacRoles.SUPER_ADMIN],
  /** Roles that can bypass/override approval queues in leave and WFH workflows */
  APPROVAL_OVERRIDERS: [RbacRoles.OR, RbacRoles.CEO],
  /** Escalation chain for emergency leave requests */
  EMERGENCY_LEAVE_APPROVERS: [RbacRoles.CTO, RbacRoles.CEO],
} as const;
