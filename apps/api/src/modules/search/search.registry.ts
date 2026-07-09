import { UserRole } from '@naprocs/types';

export interface SearchEntity {
  id: string;
  title: string;
  description: string;
  route?: string;
  parentModule: string;
  category: 'MODULE' | 'ACTION' | 'PERSON' | 'ASSET' | 'REPORT' | 'SETTING';
  permissions: UserRole[]; 
  keywords: string[];
  synonyms: string[];
  actionType: 'NAVIGATE' | 'SCROLL' | 'MODAL';
  icon: string;
  priority: number;
}

const ALL_ROLES = Object.values(UserRole);
const EXEC_ROLES = [UserRole.SUPER_ADMIN, UserRole.CEO, UserRole.COO, UserRole.CTO, UserRole.CFO, UserRole.CHRO, UserRole.HR, UserRole.FINANCE];
const HR_ROLES = [UserRole.SUPER_ADMIN, UserRole.HR, UserRole.CHRO, UserRole.CEO];
const MANAGER_ROLES = [UserRole.MANAGER, UserRole.TEAM_LEAD, UserRole.SUPER_ADMIN, UserRole.CEO, UserRole.COO, UserRole.CTO, UserRole.CHRO, UserRole.HR];

export const SEARCH_REGISTRY: SearchEntity[] = [
  // Dashboards
  {
    id: 'dashboard-employee',
    title: 'Employee Dashboard',
    description: 'View your daily summary and pending tasks',
    route: '/employee/dashboard',
    parentModule: 'Dashboard',
    category: 'MODULE',
    permissions: [UserRole.EMPLOYEE, UserRole.TEAM_LEAD, UserRole.MANAGER],
    keywords: ['home', 'dashboard', 'start', 'overview'],
    synonyms: ['main page', 'landing'],
    actionType: 'NAVIGATE',
    icon: 'LayoutDashboard',
    priority: 1
  },
  {
    id: 'dashboard-cto',
    title: 'CTO Dashboard',
    description: 'Engineering overview and metrics',
    route: '/cto/dashboard',
    parentModule: 'Dashboard',
    category: 'MODULE',
    permissions: [UserRole.CTO],
    keywords: ['cto', 'engineering', 'dashboard'],
    synonyms: ['tech dashboard'],
    actionType: 'NAVIGATE',
    icon: 'LayoutDashboard',
    priority: 1
  },
  {
    id: 'dashboard-ceo',
    title: 'Executive Dashboard',
    description: 'Company-wide metrics and operations',
    route: '/executive/dashboard',
    parentModule: 'Dashboard',
    category: 'MODULE',
    permissions: [UserRole.CEO, UserRole.COO],
    keywords: ['ceo', 'executive', 'dashboard'],
    synonyms: ['main dashboard'],
    actionType: 'NAVIGATE',
    icon: 'LayoutDashboard',
    priority: 1
  },

  // Attendance
  {
    id: 'attendance-dashboard',
    title: 'Attendance Dashboard',
    description: 'View your attendance logs and status',
    route: '/attendance',
    parentModule: 'Attendance',
    category: 'MODULE',
    permissions: ALL_ROLES,
    keywords: ['attendance', 'time', 'logs'],
    synonyms: ['timesheet'],
    actionType: 'NAVIGATE',
    icon: 'CalendarCheck',
    priority: 2
  },
  {
    id: 'attendance-checkin',
    title: 'Check In',
    description: 'Record today\'s attendance',
    route: '/attendance?action=punch-in',
    parentModule: 'Attendance',
    category: 'ACTION',
    permissions: ALL_ROLES,
    keywords: ['attendance', 'check in', 'checkin', 'punch', 'office', 'start work', 'clock in', 'mark attendance'],
    synonyms: ['login', 'arrive'],
    actionType: 'NAVIGATE',
    icon: 'Clock',
    priority: 1
  },

  // Leaves
  {
    id: 'leaves-dashboard',
    title: 'Leaves & Time Off',
    description: 'Manage your leave requests and balances',
    route: '/leaves',
    parentModule: 'Leaves',
    category: 'MODULE',
    permissions: ALL_ROLES,
    keywords: ['leave', 'vacation', 'time off', 'pto', 'sick', 'holiday'],
    synonyms: ['absence'],
    actionType: 'NAVIGATE',
    icon: 'Calendar',
    priority: 2
  },
  {
    id: 'leaves-apply',
    title: 'Apply for Leave',
    description: 'Submit a new leave request',
    route: '/leaves/apply',
    parentModule: 'Leaves',
    category: 'ACTION',
    permissions: ALL_ROLES,
    keywords: ['apply', 'request leave', 'new leave', 'book time off'],
    synonyms: ['take leave', 'sick leave', 'vacation request'],
    actionType: 'NAVIGATE',
    icon: 'Plus',
    priority: 1
  },
  {
    id: 'leaves-approvals',
    title: 'Leave Approvals',
    description: 'Review pending leave requests from your team',
    route: '/leaves/approvals',
    parentModule: 'Leaves',
    category: 'MODULE',
    permissions: MANAGER_ROLES,
    keywords: ['approve leave', 'pending leaves', 'team leaves', 'leave requests'],
    synonyms: ['manager leaves'],
    actionType: 'NAVIGATE',
    icon: 'CheckSquare',
    priority: 1
  },

  // Tasks
  {
    id: 'tasks-dashboard',
    title: 'Task Board',
    description: 'Manage your tasks and kanban board',
    route: '/tasks',
    parentModule: 'Tasks',
    category: 'MODULE',
    permissions: ALL_ROLES,
    keywords: ['tasks', 'kanban', 'todo', 'work', 'board', 'jira'],
    synonyms: ['assignments', 'my work'],
    actionType: 'NAVIGATE',
    icon: 'CheckSquare',
    priority: 2
  },

  // Connect
  {
    id: 'connect-dashboard',
    title: 'Connect & Meetings',
    description: 'Book meetings and check availability',
    route: '/connect',
    parentModule: 'Connect',
    category: 'MODULE',
    permissions: ALL_ROLES,
    keywords: ['connect', 'meeting', 'book', 'schedule', 'zoom', 'calendar'],
    synonyms: ['call', 'conference', 'availability'],
    actionType: 'NAVIGATE',
    icon: 'MessageSquare',
    priority: 2
  },

  // Assets
  {
    id: 'assets-dashboard',
    title: 'Assets',
    description: 'View assigned hardware and software',
    route: '/assets',
    parentModule: 'Assets',
    category: 'MODULE',
    permissions: ALL_ROLES,
    keywords: ['asset', 'laptop', 'hardware', 'software', 'device'],
    synonyms: ['equipment', 'macbook', 'inventory'],
    actionType: 'NAVIGATE',
    icon: 'Monitor',
    priority: 2
  },
  {
    id: 'assets-hr-manage',
    title: 'Asset Management',
    description: 'Manage company assets and assignments',
    route: '/hr/assets',
    parentModule: 'Assets',
    category: 'MODULE',
    permissions: HR_ROLES,
    keywords: ['manage assets', 'assign laptop', 'inventory', 'hardware management'],
    synonyms: ['equipment management'],
    actionType: 'NAVIGATE',
    icon: 'Monitor',
    priority: 1
  },

  // Settings & Profile
  {
    id: 'settings-profile',
    title: 'My Profile',
    description: 'View and edit your personal information',
    route: '/settings/profile',
    parentModule: 'Settings',
    category: 'SETTING',
    permissions: ALL_ROLES,
    keywords: ['profile', 'me', 'personal', 'account'],
    synonyms: ['my details', 'user settings'],
    actionType: 'NAVIGATE',
    icon: 'User',
    priority: 3
  },

  // Knowledge Base
  {
    id: 'knowledge-base',
    title: 'Knowledge Base',
    description: 'Company wiki, policies, and documents',
    route: '/knowledge',
    parentModule: 'Knowledge Base',
    category: 'MODULE',
    permissions: ALL_ROLES,
    keywords: ['knowledge', 'wiki', 'docs', 'policy', 'handbook', 'articles'],
    synonyms: ['information', 'documents'],
    actionType: 'NAVIGATE',
    icon: 'BookOpen',
    priority: 3
  },

  // Organization
  {
    id: 'org-chart',
    title: 'Org Chart',
    description: 'View the company hierarchy',
    route: '/org-chart',
    parentModule: 'Organisation',
    category: 'MODULE',
    permissions: ALL_ROLES,
    keywords: ['org chart', 'hierarchy', 'structure', 'tree'],
    synonyms: ['company structure', 'organization'],
    actionType: 'NAVIGATE',
    icon: 'Network',
    priority: 3
  },
  {
    id: 'employees-directory',
    title: 'Employee Directory',
    description: 'Search and find employees',
    route: '/employees',
    parentModule: 'Organisation',
    category: 'MODULE',
    permissions: ALL_ROLES,
    keywords: ['employees', 'directory', 'people', 'team', 'staff'],
    synonyms: ['colleagues', 'coworkers'],
    actionType: 'NAVIGATE',
    icon: 'Users',
    priority: 2
  },

  // Compliance
  {
    id: 'compliance-dashboard',
    title: 'Compliance',
    description: 'Data protection and compliance policies',
    route: '/compliance',
    parentModule: 'Compliance',
    category: 'MODULE',
    permissions: EXEC_ROLES, // Based on earlier list
    keywords: ['compliance', 'gdpr', 'policy', 'legal', 'data protection'],
    synonyms: ['rules', 'regulations'],
    actionType: 'NAVIGATE',
    icon: 'ShieldCheck',
    priority: 4
  },

  // Audit
  {
    id: 'audit-log',
    title: 'Audit Log',
    description: 'System-wide activity logs',
    route: '/audit',
    parentModule: 'Audit',
    category: 'MODULE',
    permissions: [UserRole.SUPER_ADMIN],
    keywords: ['audit', 'logs', 'activity', 'system logs', 'history'],
    synonyms: ['records', 'tracking'],
    actionType: 'NAVIGATE',
    icon: 'History',
    priority: 4
  }
];
