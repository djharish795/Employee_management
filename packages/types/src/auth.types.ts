import type { UserRole } from "./rbac.types";

export type MfaMethod = "EMAIL_OTP" | "TOTP";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  mfaRequired: boolean;
  challengeId?: string;
  method?: MfaMethod;
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
