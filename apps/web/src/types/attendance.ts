export interface AttendanceLog {
  date: string;
  checkIn: string;
  checkOut: string;
  hoursWorked: number | string;
  status: "PRESENT" | "LATE" | "WFH" | "ABSENT" | "ON_LEAVE" | "EARLY_CHECKOUT" | "HALF_DAY";
  remarks: string;
  totalBreakSeconds?: number;
  breakHistory?: Array<{ start: string; end: string | null }>;
}

export interface RegularizationRequest {
  id: string;
  attendanceDate: string;
  reason: string;
  correctionType: "MISSING_PUNCH" | "INCORRECT_TIME" | "WFH_MARKING";
  attachmentName?: string;
  managerStatus: "APPROVED" | "PENDING" | "REJECTED";
  hrStatus: "APPROVED" | "PENDING" | "REJECTED";
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
  thisMonthDays?: number;
  weeklyTrends?: Array<{ date: string; hours: number }>;
}
