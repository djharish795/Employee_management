"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, Lock, Eye, EyeOff, AlertCircle } from "lucide-react";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { useAuthStore } from "../../store/auth";
import { AuthService } from "../../services/auth.service";

// Zod validation schema matching backend criteria
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

const roleDashboardMap: Record<string, string> = {
  SUPER_ADMIN: '/admin/dashboard',
  IT: '/admin/dashboard',
  CEO: '/executive/dashboard',
  COO: '/executive/dashboard',
  CTO: '/cto/dashboard',
  CFO: '/finance/dashboard',
  FINANCE: '/finance/dashboard',
  CHRO: '/hr/dashboard',
  HR: '/hr/dashboard',
};

export const LoginForm: React.FC = () => {
  const router = useRouter();
  const setTempSession = useAuthStore((state) => state.setTempSession);
  const setAuthSession = useAuthStore((state) => state.setAuthSession);
  const [showPassword, setShowPassword] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Client-side auth guard: if the user already has a valid token cookie,
  // redirect them away from the login page IMMEDIATELY (handles browser back-button cache bypass)
  React.useEffect(() => {
    const getCookie = (name: string) => {
      const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
      return match ? decodeURIComponent(match[2]) : null;
    };
    const token = getCookie('token');
    const role = getCookie('role')?.toUpperCase() ?? '';
    if (token) {
      const target = roleDashboardMap[role] ?? '/employee/dashboard';
      router.replace(target);
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberDevice: false,
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      // Execute authentication service login call
      const res = await AuthService.login(data.email, data.password);
      
      if (res.mfaRequired && res.challengeId && res.method) {
        // Update temporary auth session in state store and redirect to MFA verification
        setTempSession({
          email: data.email,
          challengeId: res.challengeId,
          method: res.method,
        });
        router.push("/mfa");
      } else if (res.token && res.refreshToken) {
        // Direct entry case (if MFA disabled in local testing)
        const role = res.role ?? "EMPLOYEE";
        setAuthSession({
          accessToken: res.token,
          refreshToken: res.refreshToken,
          role: role,
          employeeId: res.employeeId ?? null,
        });
        document.cookie = `token=${res.token}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `role=${role}; path=/; max-age=86400; SameSite=Strict`;
        router.push(res.redirectPath ?? "/employee/dashboard");
      } else {
        router.push("/employee/dashboard");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] px-4">
      {/* Header Info */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Welcome back
        </h2>
        <p className="text-sm text-slate-500 mt-2 font-medium">
          Sign in to your enterprise account.
        </p>
      </div>

      {/* Global Error Banner */}
      {errorMsg && (
        <div className="flex items-start gap-3 p-4 mb-6 rounded-lg bg-red-50 text-red-700 border border-red-100 text-sm">
          <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Email Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Official Email
            </label>
            {errors.email && (
              <span className="text-xs text-red-600 font-medium">
                {errors.email.message}
              </span>
            )}
          </div>
          <Input
            type="email"
            placeholder="name@company.com"
            icon={<Mail className="w-5 h-5" />}
            disabled={isLoading}
            {...register("email")}
          />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
              Password
            </label>
            {errors.password && (
              <span className="text-xs text-red-600 font-medium">
                {errors.password.message}
              </span>
            )}
          </div>
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              icon={<Lock className="w-5 h-5" />}
              disabled={isLoading}
              className="pr-12"
              {...register("password")}
            />
            {/* Password show/hide toggle */}
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPassword ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              className="text-xs font-semibold text-slate-900 hover:text-slate-900 transition-colors"
            >
              Forgot?
            </button>
          </div>
        </div>

        {/* Remember Device */}
        <div className="pt-1">
          <Checkbox
            label="Remember this device"
            disabled={isLoading}
            {...register("rememberDevice")}
          />
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          className="w-full text-sm font-semibold tracking-wide bg-slate-900 hover:bg-slate-800 text-white h-11"
          disabled={isLoading}
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        {/* Divider */}
        <div className="relative my-6 flex items-center justify-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <span className="relative px-3 bg-white text-[10px] font-bold tracking-widest text-slate-400 uppercase">
            Or continue with
          </span>
        </div>

        {/* SSO Button */}
        <button
          type="button"
          className="flex items-center justify-center gap-2.5 w-full h-11 border border-slate-200 rounded-lg bg-transparent text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors active:scale-[0.98]"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.61 15.01 1 12 1 7.35 1 3.4 3.65 1.5 7.5l3.86 3C6.27 7.57 8.91 5.04 12 5.04z"
            />
            <path
              fill="#4285F4"
              d="M23.49 12.27c0-.81-.07-1.59-.2-2.34H12v4.44h6.45c-.28 1.48-1.11 2.73-2.37 3.58v2.98h3.83c2.24-2.06 3.58-5.1 3.58-8.66z"
            />
            <path
              fill="#FBBC05"
              d="M5.36 14.5c-.24-.72-.38-1.5-.38-2.3a7.82 7.82 0 01.38-2.3L1.5 6.9C.54 8.84 0 11.02 0 13.3c0 2.28.54 4.46 1.5 6.4l3.86-3.2z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.83-2.98c-1.06.71-2.42 1.13-4.13 1.13-3.09 0-5.73-2.53-6.64-5.46L1.5 16C3.4 19.85 7.35 23 12 23z"
            />
          </svg>
          <span>SSO Portal</span>
        </button>
      </form>

      {/* Footer Info */}
      <div className="mt-14 text-center">
        <div className="flex justify-center items-center space-x-3 text-[11px] font-semibold text-slate-400">
          <a href="#" className="hover:text-slate-600 transition-colors">
            Privacy Policy
          </a>
          <span>•</span>
          <a href="#" className="hover:text-slate-600 transition-colors">
            Terms of Service
          </a>
          <span>•</span>
          <a href="#" className="hover:text-slate-600 transition-colors">
            Help Center
          </a>
        </div>
        <div className="text-[10px] font-bold text-slate-400/80 uppercase tracking-widest mt-4">
          © 2024 NAPROCS TECHNOLOGIES
        </div>
      </div>
    </div>
  );
};
