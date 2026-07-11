import type { UserRole } from "./rbac.types";

export type MfaMethod = "EMAIL_OTP";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  mfaRequired: boolean;
  challengeId?: string;
  method?: MfaMethod;
  token?: string;
  refreshToken?: string;
  role?: UserRole;
  employeeId?: string;
  isTeamLead?: boolean;
  employeeStatus?: string;
  redirectPath?: string;
}

export interface MfaVerifyRequest {
  code: string;
  challengeId: string;
}

export interface MfaVerifyResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  role?: UserRole;
  redirectPath?: string;
  unknownDevice?: boolean;
  employeeStatus?: string;
  deviceDetails?: {
    location: string;
    device: string;
    time: string;
  };
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  employeeId?: string;
}
