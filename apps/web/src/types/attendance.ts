export interface AttendanceLog {
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number | string;
  status: "PRESENT" | "LATE" | "WFH" | "ABSENT" | "ON_LEAVE" | "EARLY_CHECKOUT" | "HALF_DAY";
  remarks: string;
  totalBreakSeconds?: number;
  breakHistory?: Array<{ start: string; end: string | null }>;
  punchHistory?: Array<{ action: "IN" | "OUT" | "BREAK"; time: string }>;
  overtime?: number;
  isOvertimeApproved?: boolean;
  isRegularized?: boolean;
}

export interface RegularizationRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  attendanceDate: string;
  reason: string;
  correctionType: "MISSING_PUNCH" | "INCORRECT_TIME" | "LATE_CHECKIN" | "EARLY_CHECKOUT" | "WFH_MARKING";
  attachmentName?: string;
  step1Status: 'PENDING' | 'APPROVED' | 'REJECTED';
  step2Status: 'PENDING' | 'APPROVED' | 'REJECTED';
  step1ApproverId?: string | null;
  step2ApproverId?: string | null;
  submittedDate: string;
  comments?: string;
}

export interface AttendanceKPIs {
  presentToday: string;
  attendanceRate: number;
  avgHoursWorked: string;
  lateArrivals: number;
  leaveDays: number;
  wfhDays: number;
  thisWeekHours?: number;
  weeklyTargetHours?: number;
  thisMonthDays?: number;
  weeklyTrends?: Array<{ date: string; hours: number }>;
}

export interface OrgReportsResponse {
  avgAttendance: number;
  lateRate: number;
  avgHours: string;
  activeFTE: number;
  departmentRates: Array<{
    name: string;
    percent: number;
    count: number;
  }>;
  lateTrends: Array<{
    label: string;
    count: number;
    percent: number;
  }>;
}
