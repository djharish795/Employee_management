export type OrgRole = "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";

export interface OrgEmployee {
  id: string;
  name: string;
  designation: string;
  department: string;
  location: string;
  email: string;
  photoUrl: string;
  initials: string;
  avatarBg: string;
  gender?: string;
  managerId: string | null; // Adjacency list relation
}

export interface DepartmentNode {
  id: string;
  name: string;
  headId: string | null; // Refers to an OrgEmployee id
  head?: {
    name: string;
    photoUrl: string | null;
  } | null;
  headcount: number;
  openPositions: number;
  budget?: string;
  description: string;
}

// Derived tree structure for UI rendering
export interface OrgTreeNode extends OrgEmployee {
  children: OrgTreeNode[];
  directReportsCount: number;
  totalReportsCount: number; // recursive sum
}

export interface OrgKPIs {
  totalEmployees: number;
  totalDepartments: number;
  totalManagers: number;
  vacantPositions: number;
  avgSpanOfControl: string; // "x.x"
}
