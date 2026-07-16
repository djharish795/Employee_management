import { DeviceDetails } from "../store/auth";

export interface LoginResponse {
  mfaRequired: boolean;
  challengeId?: string;
  method?: "EMAIL_OTP";
  token?: string;
  refreshToken?: string;
  role?: string;
  redirectPath?: string;
  employeeId?: string | null;
  isTeamLead?: boolean;
}

export interface VerifyMFAResponse {
  success: boolean;
  token?: string;
  refreshToken?: string;
  role?: string;
  redirectPath?: string;
  unknownDevice?: boolean;
  deviceDetails?: DeviceDetails;
  employeeId?: string | null;
  isTeamLead?: boolean;
}

export class AuthService {
  private static getApiUrl() {
    return process.env.NEXT_PUBLIC_API_URL!;
  }

  static async login(email: string, password: string): Promise<LoginResponse> {
    const res = await fetch(`${this.getApiUrl()}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ email, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Failed to log in. Please check your credentials.");
    }

    return res.json();
  }

  static async verifyMFA(
    code: string,
    challengeId: string
  ): Promise<VerifyMFAResponse> {
    const res = await fetch(`${this.getApiUrl()}/auth/mfa`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ code, challengeId }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || "Invalid or expired MFA code.");
    }

    return res.json();
  }

  static async trustDevice(challengeId: string): Promise<{ success: boolean }> {
    const res = await fetch(`${this.getApiUrl()}/auth/device/trust`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ challengeId }),
    });

    if (!res.ok) {
      throw new Error("Failed to trust device.");
    }

    return res.json();
  }
}
