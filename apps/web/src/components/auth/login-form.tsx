"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import { useAuthStore } from "../../store/auth";
import { AuthService } from "../../services/auth.service";

// ---------- Zod validation schema ----------
const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Official Email is required" })
    .email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(6, { message: "Password must be at least 6 characters long" }),
  rememberDevice: z.boolean().default(false),
});

type LoginFormValues = z.infer<typeof loginSchema>;



// ---------- Inline design tokens (from HTML) ----------
const ink900 = "#0f1420";
const ink700 = "#3b4256";
const ink500 = "#6b7280";
const ink300 = "#9aa2b1";
const line = "#e7e8ec";
const accent = "#5b6cff";

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const setTempSession = useAuthStore((state) => state.setTempSession);
  const setAuthSession = useAuthStore((state) => state.setAuthSession);
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Do NOT do a client-side redirect here based on accessToken.
  // The middleware.ts handles all auth-based redirects server-side using the HttpOnly cookie.
  // A client-side redirect based on Zustand state would race with the cookie being set.

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", rememberDevice: false },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await AuthService.login(data.email, data.password);

      if (res.mfaRequired && res.challengeId && res.method) {
        setTempSession({
          email: data.email,
          challengeId: res.challengeId,
          method: res.method,
        });
        router.push("/mfa");
      } else if (res.token && res.refreshToken) {
        const role = res.role ?? "EMPLOYEE";
        setAuthSession({
          accessToken: res.token,
          refreshToken: res.refreshToken,
          role,
          employeeId: res.employeeId ?? null,
          isTeamLead: res.isTeamLead ?? false,
        });
        // Use a hard navigation (window.location) instead of router.push.
        // router.push is a client-side transition — it does NOT re-run the middleware
        // that reads the HttpOnly cookie. window.location forces a full page load,
        // which makes the browser send the cookie to the server and allows middleware
        // to verify it properly before serving the page.
        const target = res.redirectPath ?? "/employee/dashboard";
        window.location.replace(target);
      } else {
        throw new Error("Authentication failed: Missing secure tokens in server response.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ---- shared input focus/blur handlers ----
  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = accent;
    e.target.style.boxShadow = `0 0 0 3px rgba(91,108,255,0.12)`;
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement>, hasError: boolean) => {
    e.target.style.borderColor = hasError ? "#fca5a5" : line;
    e.target.style.boxShadow = "none";
  };

  return (
    <div style={{ width: "100%", maxWidth: 436 }}>

      {/* ---- Header ---- */}
      <h2 style={{ fontSize: 34, fontWeight: 700, color: ink900, marginBottom: 8, lineHeight: 1.15 }}>
        Welcome back
      </h2>
      <p style={{ fontSize: 15, color: ink500, marginBottom: 32 }}>
        Sign in to your enterprise account.
      </p>

      {/* ---- Global error banner ---- */}
      {errorMsg && (
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: 16,
            marginBottom: 24,
            borderRadius: 10,
            background: "#fef2f2",
            border: "1px solid #fecaca",
            color: "#dc2626",
            fontSize: 14,
          }}
        >
          <AlertCircle style={{ width: 20, height: 20, flexShrink: 0, marginTop: 1 }} />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* ---- Form ---- */}
      <form onSubmit={handleSubmit(onSubmit)} noValidate>

        {/* Email field */}
        <div>
          <label
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "1px",
              color: ink700,
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            <span>Official Email</span>
            {errors.email && (
              <span style={{ color: "#dc2626", textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>
                {errors.email.message}
              </span>
            )}
          </label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            {/* Mail icon */}
            <svg
              style={{ position: "absolute", left: 14, width: 18, height: 18, color: ink300, pointerEvents: "none", flexShrink: 0 }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            <input
              type="email"
              placeholder="name@company.com"
              disabled={isLoading}
              {...register("email")}
              onFocus={onFocus}
              onBlur={(e) => onBlur(e, !!errors.email)}
              style={{
                width: "100%",
                height: 48,
                padding: "0 44px",
                border: `1px solid ${errors.email ? "#fca5a5" : line}`,
                borderRadius: 10,
                fontSize: 14,
                color: ink900,
                outline: "none",
                background: "#fff",
                transition: "border-color .15s ease, box-shadow .15s ease",
                fontFamily: "inherit",
              }}
            />
          </div>
        </div>

        {/* Password field */}
        <div style={{ marginTop: 22 }}>
          <label
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 11,
              fontWeight: 600,
              letterSpacing: "1px",
              color: ink700,
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            <span>Password</span>
            {errors.password && (
              <span style={{ color: "#dc2626", textTransform: "none", letterSpacing: 0, fontWeight: 500 }}>
                {errors.password.message}
              </span>
            )}
          </label>
          <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
            {/* Lock icon */}
            <svg
              style={{ position: "absolute", left: 14, width: 18, height: 18, color: ink300, pointerEvents: "none", flexShrink: 0 }}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              disabled={isLoading}
              {...register("password")}
              onFocus={onFocus}
              onBlur={(e) => onBlur(e, !!errors.password)}
              style={{
                width: "100%",
                height: 48,
                padding: "0 44px",
                border: `1px solid ${errors.password ? "#fca5a5" : line}`,
                borderRadius: 10,
                fontSize: 14,
                color: ink900,
                outline: "none",
                background: "#fff",
                transition: "border-color .15s ease, box-shadow .15s ease",
                fontFamily: "inherit",
              }}
            />
            {/* Eye toggle */}
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
              style={{
                position: "absolute",
                right: 14,
                background: "none",
                border: "none",
                cursor: "pointer",
                color: ink300,
                display: "flex",
                alignItems: "center",
                padding: 0,
                lineHeight: 1,
              }}
            >
              {showPassword ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              )}
            </button>
          </div>

          {/* Forgot password — right-aligned */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 10 }}>
            <button
              type="button"
              style={{
                fontSize: 13,
                color: ink700,
                fontWeight: 600,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                fontFamily: "inherit",
              }}
            >
              Forgot?
            </button>
          </div>
        </div>

        {/* Remember this device */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 22 }}>
          <input
            type="checkbox"
            id="rememberDevice"
            disabled={isLoading}
            {...register("rememberDevice")}
            style={{ width: 16, height: 16, accentColor: ink900, cursor: "pointer", flexShrink: 0 }}
          />
          <label
            htmlFor="rememberDevice"
            style={{
              margin: 0,
              fontSize: 14,
              fontWeight: 400,
              color: ink700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Remember this device
          </label>
        </div>

        {/* Sign In button */}
        <button
          type="submit"
          disabled={isLoading}
          onMouseEnter={(e) => {
            if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = "#1a2136";
          }}
          onMouseLeave={(e) => {
            if (!isLoading) (e.currentTarget as HTMLButtonElement).style.background = ink900;
          }}
          onMouseDown={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.98)"; }}
          onMouseUp={(e) => { (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}
          style={{
            width: "100%",
            height: 50,
            marginTop: 26,
            background: isLoading ? "#4b5563" : ink900,
            color: "#fff",
            border: "none",
            borderRadius: 10,
            fontSize: 15,
            fontWeight: 600,
            cursor: isLoading ? "not-allowed" : "pointer",
            transition: "transform .12s ease, background .15s ease",
            fontFamily: "inherit",
            letterSpacing: "0.01em",
          }}
        >
          {isLoading ? "Signing in…" : "Sign In"}
        </button>

        {/* Divider */}
        <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "26px 0" }}>
          <div style={{ flex: 1, height: 1, background: line }} />
          <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: "1px", color: ink300, whiteSpace: "nowrap", textTransform: "uppercase" }}>
            Or continue with
          </span>
          <div style={{ flex: 1, height: 1, background: line }} />
        </div>

        {/* SSO Button */}
        <button
          type="button"
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#fafafa";
            (e.currentTarget as HTMLButtonElement).style.borderColor = "#d7d9df";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = "#fff";
            (e.currentTarget as HTMLButtonElement).style.borderColor = line;
          }}
          style={{
            width: "100%",
            height: 50,
            background: "#fff",
            border: `1px solid ${line}`,
            borderRadius: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
            fontSize: 14,
            fontWeight: 600,
            color: ink900,
            cursor: "pointer",
            transition: "border-color .15s ease, background .15s ease",
            fontFamily: "inherit",
          }}
        >
          {/* Google logo */}
          <svg style={{ width: 18, height: 18, flexShrink: 0 }} viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.61 15.01 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.57 8.91 5.04 12 5.04z" />
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.45c-.28 1.48-1.11 2.73-2.37 3.58v2.98h3.83c2.24-2.06 3.58-5.1 3.58-8.66z" />
            <path fill="#FBBC05" d="M5.36 14.5c-.24-.72-.38-1.5-.38-2.3a7.82 7.82 0 01.38-2.3L1.5 6.9C.54 8.84 0 11.02 0 13.3c0 2.28.54 4.46 1.5 6.4l3.86-3.2z" />
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.83-2.98c-1.06.71-2.42 1.13-4.13 1.13-3.09 0-5.73-2.53-6.64-5.46L1.5 16C3.4 19.85 7.35 23 12 23z" />
          </svg>
          <span>SSO Portal</span>
        </button>
      </form>

      {/* ---- Footer links ---- */}
      <div style={{ marginTop: 40, textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, fontSize: 12, color: ink300 }}>
          <a href="#" style={{ color: ink500, textDecoration: "none", fontWeight: 600 }}>Privacy Policy</a>
          <span>•</span>
          <a href="#" style={{ color: ink500, textDecoration: "none", fontWeight: 600 }}>Terms of Service</a>
          <span>•</span>
          <a href="#" style={{ color: ink500, textDecoration: "none", fontWeight: 600 }}>Help Center</a>
        </div>
        <div
          style={{
            marginTop: 10,
            fontSize: 10.5,
            letterSpacing: "1px",
            color: "#c3c6cd",
            fontWeight: 600,
            textTransform: "uppercase",
          }}
        >
          © 2024 Naprocs Technologies
        </div>
      </div>
    </div>
  );
};
