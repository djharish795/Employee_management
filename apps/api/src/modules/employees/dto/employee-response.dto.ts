export class EmployeeResponseDto {
  id!: string;
  employeeId!: string;
  firstName!: string;
  lastName!: string;
  middleName?: string | null;
  preferredName?: string | null;
  officialEmail!: string;
  personalEmail?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  departmentId?: string | null;
  designationId?: string | null;
  reportingManagerId?: string | null;
  status!: string;
  employeeType?: string | null;
  joiningDate?: Date | null;
  exitDate?: Date | null;
  exitReason?: string | null;
  photoUrl?: string | null;
  gender?: string | null;
  bloodGroup?: string | null;
  workLocation?: string | null;
  band?: string | null;
  grade?: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  // Relational data
  department?: any;
  designation?: any;
  subordinates?: any[];
  attendanceRecords?: any[];
  leaveBalances?: any[];
  leaveRequestsMade?: any[];
  assetsHeld?: any[];
  consentLogsAsSubject?: any[];

  constructor(partial: Partial<EmployeeResponseDto>) {
    Object.assign(this, partial);
  }
}

/**
 * Maps a raw Prisma Employee object to a sanitized EmployeeResponseDto.
 * Excludes sensitive fields like Aadhaar, PAN, Passport, Driving License, Bank Details, etc.
 */
export function mapToEmployeeResponseDto(raw: any): EmployeeResponseDto {
  if (!raw) return raw;

  // Destructure to extract and omit sensitive fields
  const {
    aadhaar,
    pan,
    passport,
    drivingLicence,
    voterId,
    bankName,
    bankBranch,
    bankIfsc,
    bankAccountEnc,
    accountType,
    paymentFrequency,
    paymentMode,
    documents,
    emergencyContact,
    currentAddress,
    permanentAddress,
    backgroundVerified,
    passwordHash, // Just in case it's joined
    ...safeData
  } = raw;

  return new EmployeeResponseDto(safeData);
}
