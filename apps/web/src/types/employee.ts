export interface WizardStep {
  num: number;
  title: string;
  active: boolean;
  completed: boolean;
}

export type EmployeeType = 'Full-Time' | 'Part-Time' | 'Contractor' | 'Intern';
export type EmploymentStatus = 'Active' | 'Inactive' | 'On Leave' | 'Terminated';

export interface PersonalInfo {
  firstName: string;
  middleName?: string;
  lastName: string;
  preferredName?: string;
  dateOfBirth: string;
  gender: string;
  bloodGroup?: string;
  nationality: string;
  maritalStatus: string;
  officialEmail: string;
  personalEmail?: string;
  phone: string;
  alternatePhone?: string;
  currentAddress: string;
  permanentAddress: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  profilePhoto?: File | null;
}

export interface EmploymentInfo {
  employeeId: string;
  employeeType: EmployeeType;
  status: EmploymentStatus;
  department: string;
  designation: string;
  role: string;
  reportingManagerId?: string;
  teamLeadId?: string;
  workLocation: string;
  branch: string;
  businessUnit: string;
  shiftTiming: string;
  joiningDate: string;
  probationPeriodMonths: number;
  noticePeriodDays: number;
  workMode: 'Office' | 'Hybrid' | 'Remote';
  annualCtc: number;
  monthlySalary: number;
  payGrade: string;
  currency: string;
  bonusEligibility: boolean;
}

export interface IdentityInfo {
  aadhaarNumber?: string;
  panNumber?: string;
  passportNumber?: string;
  drivingLicense?: string;
  voterId?: string;
  taxRegime: string;
  uanNumber?: string;
  pfAccount?: string;
  esiNumber?: string;
  nationality: string;
  residencyStatus: string;
  visaType?: string;
  visaExpiry?: string;
}

export interface BankInfo {
  accountHolderName: string;
  bankName: string;
  branchName: string;
  accountNumber: string;
  ifscCode: string;
  swiftCode?: string;
  paymentMode: string;
  frequency: string;
  accountType: string;
}

export interface DocumentInfo {
  id: string;
  category: 'Personal' | 'Identity' | 'Education' | 'Employment' | 'Financial';
  name: string;
  status: 'APPROVED' | 'PENDING' | 'REJECTED';
  size: string;
  uploadedAt: string;
  feedback?: string;
}

export interface EmergencyInfo {
  contactName1: string;
  contactPhone1: string;
  relationship1: string;
  contactName2?: string;
  contactPhone2?: string;
  relationship2?: string;
  bloodType: string;
  medicalConditions?: string;
  allergies?: string;
}

export interface AssetInfo {
  id: string;
  type: string;
  name: string;
  serialNumber: string;
  assignedDate: string;
  status: 'Assigned' | 'Pending' | 'Returned';
}

export interface AccessControlInfo {
  email: boolean;
  vpn: boolean;
  teams: boolean;
  slack: boolean;
  github: boolean;
  jira: boolean;
  biometric: boolean;
  twoFactorAuth: boolean;
  roleId: string;
  customPermissions: string[];
}

export interface NewEmployeeData {
  personalInfo: PersonalInfo;
  employmentInfo: EmploymentInfo;
  identityInfo: IdentityInfo;
  bankInfo: BankInfo;
  documents: DocumentInfo[];
  emergencyInfo: EmergencyInfo;
  assets: AssetInfo[];
  accessControl: AccessControlInfo;
}
