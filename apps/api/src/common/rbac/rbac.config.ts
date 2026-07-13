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

  // Departments
  DEPARTMENTS_READ: 'departments.read',
  DEPARTMENTS_CREATE: 'departments.create',
  DEPARTMENTS_UPDATE: 'departments.update',
  DEPARTMENTS_DELETE: 'departments.delete',

  // Dashboard
  DASHBOARD_VIEW: 'dashboard.view',

  // System
  AUDIT_READ: 'audit.read',
  SETTINGS_MANAGE: 'settings.manage',
} as const;

export type RbacPermissionType = typeof RbacPermissions[keyof typeof RbacPermissions];

/**
 * Standard Role Definitions for future RBAC engine.
 */
export const RbacRoles = {
  CEO: 'CEO',
  HR: 'HR',
  MANAGER: 'Manager',
  EMPLOYEE: 'Employee',
} as const;

export type RbacRoleType = typeof RbacRoles[keyof typeof RbacRoles];

/**
 * Baseline Permission Mappings defining what each role can access.
 */
export const RbacRolePermissionsMapping: Record<RbacRoleType, RbacPermissionType[]> = {
  [RbacRoles.CEO]: [
    RbacPermissions.EMPLOYEES_READ,
    RbacPermissions.DEPARTMENTS_READ,
    RbacPermissions.DASHBOARD_VIEW,
    RbacPermissions.AUDIT_READ,
  ],
  [RbacRoles.HR]: [
    RbacPermissions.EMPLOYEES_READ,
    RbacPermissions.EMPLOYEES_CREATE,
    RbacPermissions.EMPLOYEES_UPDATE,
    RbacPermissions.EMPLOYEES_DELETE,
    RbacPermissions.DEPARTMENTS_READ,
    RbacPermissions.DEPARTMENTS_CREATE,
    RbacPermissions.DEPARTMENTS_UPDATE,
    RbacPermissions.DEPARTMENTS_DELETE,
    RbacPermissions.DASHBOARD_VIEW,
    RbacPermissions.AUDIT_READ,
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
};
