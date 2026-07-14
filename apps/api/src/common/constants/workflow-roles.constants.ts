import { RbacRoles } from '../../common/rbac/rbac.config';

/**
 * Workflow-specific role type.
 * Includes both standard RBAC roles and designation-specific workflow roles
 * that exist only within the leave/WFH approval pipeline (e.g. 'TS', 'QE', 'HRE').
 */
export type WorkflowRole = typeof RbacRoles[keyof typeof RbacRoles] | 'TS' | 'QE' | 'HRE';

/**
 * Maps employee designation titles to their workflow role.
 * Used by the leave and WFH approval systems to determine
 * which approval queue a request should follow.
 *
 * Keys are designation title values as stored in the database.
 * Values are the corresponding workflow role identifiers.
 */
export const DesignationRoleMap: Record<string, WorkflowRole> = {
  TR: RbacRoles.TR,
  TS: 'TS',
  TL: RbacRoles.TL,
  QA: RbacRoles.QA,
  QE: 'QE',
  HRE: 'HRE',
  CTO: RbacRoles.CTO,
  CEO: RbacRoles.CEO,
};

/**
 * Maps department codes to their workflow role.
 * When an employee's designation title doesn't directly match a known role,
 * the department code is used as a fallback to derive the workflow role.
 *
 * Also handles known aliases (e.g. 'OPS' → OR, 'ADMIN' → AR).
 */
export const DepartmentRoleMap: Record<string, WorkflowRole> = {
  HR: RbacRoles.HR,
  OR: RbacRoles.OR,
  OPS: RbacRoles.OR,
  AR: RbacRoles.AR,
  ADMIN: RbacRoles.AR,
};

/**
 * Default workflow role assigned to employees whose designation and
 * department do not match any entry in the above maps.
 */
export const DEFAULT_WORKFLOW_ROLE: WorkflowRole = RbacRoles.EMPLOYEE;

/**
 * Resolves the workflow role for an employee based on their designation title,
 * department code, and employee ID pattern.
 *
 * Resolution order:
 * 1. Exact designation title match in DesignationRoleMap
 * 2. Department code match in DepartmentRoleMap
 * 3. Employee ID path segment match (e.g. '/HR/' → HR)
 * 4. Designation title keyword match ('Lead', 'Manager' → TR)
 * 5. Fallback to DEFAULT_WORKFLOW_ROLE ('EMPLOYEE')
 *
 * @param employee - Employee record with optional department, designation, and employeeId
 * @returns The resolved WorkflowRole string
 */
export function resolveWorkflowRole(employee: {
  department?: { code?: string } | null;
  designation?: { title?: string } | null;
  employeeId?: string;
}): WorkflowRole {
  const designTitle = employee.designation?.title || '';
  const deptCode = employee.department?.code || '';
  const empId = employee.employeeId || '';

  // 1. Exact designation title match
  if (designTitle in DesignationRoleMap) {
    return DesignationRoleMap[designTitle];
  }

  // 2. Department code match
  if (deptCode in DepartmentRoleMap) {
    return DepartmentRoleMap[deptCode];
  }

  // 3. Employee ID path segment match (e.g. '/HR/', '/OR/', '/AR/', '/TR/')
  for (const [key, role] of Object.entries(DepartmentRoleMap)) {
    if (empId.includes(`/${key}/`)) {
      return role;
    }
  }

  // 4. Designation title keyword match for leads/managers
  if (designTitle.includes('Lead') || designTitle.includes('Manager')) {
    return RbacRoles.TR;
  }

  // Also check employee ID for TR pattern
  if (empId.includes('/TR/')) {
    return RbacRoles.TR;
  }

  // 5. Fallback
  return DEFAULT_WORKFLOW_ROLE;
}
