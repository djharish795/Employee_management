import { toZonedTime } from "date-fns-tz";

/**
 * Attendance statuses that count as "present" for metrics.
 */
export const PRESENT_STATUSES = ['PRESENT', 'WFH', 'HALF_DAY', 'EARLY_CHECKOUT'] as const;

/**
 * Attendance statuses that count as "present" for metrics, including late arrivals.
 */
export const PRESENT_WITH_LATE_STATUSES = ['PRESENT', 'WFH', 'HALF_DAY', 'LATE', 'EARLY_CHECKOUT'] as const;

/**
 * Check if a check-in time is after the 10:15 AM IST cutoff.
 */
export function isLateArrival(checkInTime: Date): boolean {
  const zoned = toZonedTime(checkInTime, 'Asia/Kolkata');
  const h = zoned.getHours();
  const m = zoned.getMinutes();
  return h > 10 || (h === 10 && m > 15);
}

/**
 * Safely parse breakHistory from DB (handles string | object | null).
 */
export function parseBreakHistory(raw: unknown): Array<{ start: string; end: string | null }> {
  if (!raw) return [];
  try {
    const parsed = typeof raw === "string" ? JSON.parse(raw) : (raw as any[]);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}
