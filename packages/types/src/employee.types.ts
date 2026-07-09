export enum EmployeeStatus {
  PROBATION = "PROBATION",
  ACTIVE = "ACTIVE",
  NOTICE_PERIOD = "NOTICE_PERIOD",
  EXITED = "EXITED",
  ONBOARDING = "ONBOARDING",
}

export enum Gender {
  MALE = "MALE",
  FEMALE = "FEMALE",
  OTHER = "OTHER",
  PREFER_NOT_TO_SAY = "PREFER_NOT_TO_SAY",
}

export enum MaritalStatus {
  SINGLE = "SINGLE",
  MARRIED = "MARRIED",
  DIVORCED = "DIVORCED",
  WIDOWED = "WIDOWED",
}

export enum EmployeeType {
  FULL_TIME = "FULL_TIME",
  PART_TIME = "PART_TIME",
  CONTRACT = "CONTRACT",
  INTERN = "INTERN",
}

export interface EmployeeProfile {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  middleName?: string | null;
  preferredName?: string | null;
  officialEmail: string;
  personalEmail?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  dateOfBirth?: Date | null;
  gender?: Gender | null;
  bloodGroup?: string | null;
  nationality?: string | null;
  maritalStatus?: MaritalStatus | null;
  aadhaar?: string | null;
  pan?: string | null;
  departmentId?: string | null;
  designationId?: string | null;
  status: EmployeeStatus;
  joiningDate?: Date | null;
  employeeType?: EmployeeType | null;
  workLocation?: string | null;
  reportingManagerId?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
