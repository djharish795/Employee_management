export interface Employee {
  id: string;
  employeeId?: string;
  name: string;
  email: string;
  photoUrl: string;
  initials: string;
  avatarBg: string;
  department: string;
  designation: string;
  status: "ACTIVE" | "PROBATION" | "NOTICE PERIOD" | "ONBOARDING" | "DEACTIVATED" | "EXITED" | "CANCELLED";
  joinedDate: string;
  location: string;
  manager?: {
    id: string;
    name: string;
    photoUrl: string;
  };
}

export type DirectoryRole = "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE" | "FINANCE" | "CTO";

export interface DirectoryRoleConfig {
  canAddEmployee: boolean;
  canBulkDeactivate: boolean;
  canBulkAssignManager: boolean;
  canExport: boolean;
  dataScope: "ALL" | "TEAM";
  showSummaryWidgets: boolean;
}

export interface DirectoryFilters {
  search: string;
  department: string;
  designation: string;
  location: string;
  status: string;
  employeeType?: string;
}

// Extended Profile Interfaces
export interface PersonalInfo {
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  nationality: string;
  primaryLanguage: string;
}

export interface ContactInfo {
  mobile: string;
  workEmail: string;
  personalEmail: string;
  currentAddress: string;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface DirectReport {
  id: string;
  name: string;
  designation: string;
  photoUrl: string;
}

export interface CareerMilestone {
  date: string;
  event: string;
  department: string;
  designation: string;
  details: string;
}

export interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  status: "PRESENT" | "LATE" | "WFH" | "ABSENT";
  remarks: string;
}

export interface LeaveRequest {
  id: string;
  type: "SICK LEAVE" | "CASUAL LEAVE" | "ANNUAL LEAVE" | "MATERNITY LEAVE";
  startDate: string;
  endDate: string;
  days: number;
  status: "APPROVED" | "PENDING" | "REJECTED";
}

export interface LeaveBalance {
  type: string;
  allocated: number;
  used: number;
  available: number;
}

export interface AssignedAsset {
  id: string;
  name: string;
  category: "LAPTOP" | "MONITOR" | "PERIPHERAL" | "MOBILE";
  serialNo: string;
  assignedDate: string;
  status: "ACTIVE" | "UPGRADED" | "RETURNED";
}

export interface AssetRequest {
  id: string;
  assetName: string;
  requestedDate: string;
  reason: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
}

export interface IdentityDocument {
  id: string;
  name: string;
  type: "AADHAAR" | "PAN" | "PASSPORT" | "BANK_STATEMENT";
  maskedValue: string;
  verifiedAt: string;
  status: "VERIFIED" | "PENDING" | "REJECTED";
}

export interface ComplianceRecord {
  id: string;
  policyName: string;
  acknowledgedAt: string;
  status: "COMPLIANT" | "PENDING";
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  category: "PROFILE" | "ATTENDANCE" | "LEAVE" | "ASSET" | "PROMOTION" | "SYSTEM";
  title: string;
  description: string;
  operator: string;
}

export interface FullEmployeeProfile extends Employee {
  personalInfo: PersonalInfo;
  contactInfo: ContactInfo;
  emergencyContact: EmergencyContact;
  directReports: DirectReport[];
  careerMilestones: CareerMilestone[];
  attendanceRecords: AttendanceRecord[];
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequest[];
  assignedAssets: AssignedAsset[];
  assetRequests: AssetRequest[];
  identityDocuments: IdentityDocument[];
  complianceRecords: ComplianceRecord[];
  timelineEvents: TimelineEvent[];
}
