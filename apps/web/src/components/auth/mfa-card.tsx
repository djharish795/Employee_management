"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Shield, ArrowLeft, Smartphone, AlertCircle } from "lucide-react";
import { Button } from "../ui/button";
import { useAuthStore } from "../../store/auth";
import { AuthService } from "../../services/auth.service";

export const MfaCard: React.FC = () => {
  const router = useRouter();
  const { tempSession, setDeviceDetails, setAuthSession } = useAuthStore();
  const [code, setCode] = React.useState<string[]>(Array(6).fill(""));
  const [singleCode, setSingleCode] = React.useState("");
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  // Timer State for Email OTP (120 seconds = 02:00)
  const [secondsRemaining, setSecondsRemaining] = React.useState(120);

  // Focus tracking refs for individual digit boxes
  const inputRefs = React.useRef<HTMLInputElement[]>([]);

  // Redirect back to login if no temp session details are stored
  React.useEffect(() => {
    if (!tempSession) {
      router.push("/login");
    }
  }, [tempSession, router]);

  // Timer logic
  React.useEffect(() => {
    if (tempSession?.method !== "EMAIL_OTP" || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [secondsRemaining, tempSession]);

  const formatTimer = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const handleDigitChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // Only allow numbers

    const newCode = [...code];
    newCode[index] = value.substring(value.length - 1);
    setCode(newCode);

    // Auto focus next box
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempSession) return;

    setIsLoading(true);
    setErrorMsg(null);

    const mfaCode = tempSession.method === "EMAIL_OTP" 
      ? code.join("") 
      : singleCode.replace(/\s+/g, "");

    if (mfaCode.length < 6) {
      setErrorMsg("Please enter the complete 6-digit code.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await AuthService.verifyMFA(mfaCode, tempSession.challengeId);
      
      if (res.unknownDevice && res.deviceDetails) {
        setDeviceDetails(res.deviceDetails);
        router.push("/new-device");
      } else if (res.success && res.token) {
        const role = res.role ?? "EMPLOYEE";
        setAuthSession({
          accessToken: res.token,
          role: role,
        });
        document.cookie = `token=${res.token}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `role=${role}; path=/; max-age=86400; SameSite=Strict`;
        router.push(res.redirectPath ?? "/employee/dashboard");
      } else {
        router.push("/employee/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid or expired verification code.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!tempSession) return null;

  return (
    <div className="w-full max-w-[440px] p-8 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
      {/* Icon Area */}
      <div className="flex items-center justify-center mx-auto mb-6 w-12 h-12 bg-blue-50 text-blue-600 rounded-full">
        {tempSession.method === "EMAIL_OTP" ? (
          <Shield className="w-6 h-6" />
        ) : (
          <Smartphone className="w-6 h-6" />
        )}
      </div>

      {/* Header Info */}
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
        {tempSession.method === "EMAIL_OTP" 
          ? "Two-Factor Authentication" 
          : "Authenticator app"}
      </h2>
      <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed px-2">
        {tempSession.method === "EMAIL_OTP"
          ? "We&apos;ve sent a 6-digit verification code to your registered device."
          : "Enter the 6-digit code from your authenticator app"}
      </p>

      {/* Error banner */}
      {errorMsg && (
        <div className="flex items-start gap-2.5 p-3.5 my-5 rounded-lg bg-red-50 text-red-700 border border-red-100 text-sm text-left">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Verification Forms */}
      <form onSubmit={handleVerify} className="mt-8 space-y-6">
        {tempSession.method === "EMAIL_OTP" ? (
          /* Case 1: Email 6-Digit Individual Blocks */
          <div className="space-y-6">
            <div className="flex justify-between gap-2.5 max-w-[340px] mx-auto">
              {code.map((val, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={val}
                  onChange={(e) => handleDigitChange(e.target.value, idx)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  ref={(el) => {
                    if (el) inputRefs.current[idx] = el;
                  }}
                  className="w-12 h-14 text-center text-xl font-bold border border-slate-200 rounded-xl bg-slate-50 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus-visible:outline-none transition-all duration-150"
                  disabled={isLoading}
                />
              ))}
            </div>

            {/* Expiry / Resend area */}
            <div className="flex flex-col items-center space-y-2 text-xs font-semibold select-none text-slate-500">
              <div className="flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                <span>Code expires in {formatTimer(secondsRemaining)}</span>
              </div>
              <button
                type="button"
                className="text-blue-600 hover:text-blue-700 transition-colors disabled:opacity-50"
                disabled={secondsRemaining > 0 || isLoading}
                onClick={() => setSecondsRemaining(120)}
              >
                Resend Code
              </button>
            </div>
          </div>
        ) : (
          /* Case 2: Authenticator App Combined Input Box */
          <div className="space-y-6">
            <div className="max-w-[280px] mx-auto">
              <input
                type="text"
                placeholder="000 000"
                maxLength={7}
                value={singleCode}
                onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, "");
                  if (val.length > 3) {
                    val = val.substring(0, 3) + " " + val.substring(3, 6);
                  }
                  setSingleCode(val);
                }}
                className="w-full h-12 text-center text-2xl font-bold tracking-[0.2em] border border-slate-200 rounded-xl placeholder:text-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus-visible:outline-none transition-all duration-150"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col items-center space-y-2 text-xs font-semibold">
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="flex items-center space-x-1.5 text-slate-500 hover:text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to login</span>
              </button>
              <a href="#" className="text-blue-600 hover:text-blue-700 mt-2 block transition-colors">
                Lost access to your app?
              </a>
            </div>
          </div>
        )}

        {/* Submit */}
        <Button
          type="submit"
          className="w-full text-sm font-semibold tracking-wide"
          disabled={isLoading}
        >
          {isLoading
            ? "Verifying..."
            : tempSession.method === "EMAIL_OTP"
              ? "Verify & Sign In"
              : "Verify"}
        </Button>
      </form>
    </div>
  );
};
