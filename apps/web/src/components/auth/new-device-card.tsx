"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, MapPin, Monitor, Clock } from "lucide-react";
import { Button } from "../ui/button";
import { useAuthStore } from "../../store/auth";
import { AuthService } from "../../services/auth.service";

export const NewDeviceCard: React.FC = () => {
  const router = useRouter();
  const { deviceDetails, tempSession, clearSession } = useAuthStore();
  const [isLoading, setIsLoading] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  // Redirect if no device details are stored
  React.useEffect(() => {
    if (!deviceDetails) {
      router.push("/login");
    }
  }, [deviceDetails, router]);

  const handleTrustDevice = async () => {
    if (!tempSession) return;
    setIsLoading(true);
    setErrorMsg(null);
    try {
      await AuthService.trustDevice(tempSession.challengeId);
      clearSession();
      router.push("/employee");
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to authorize device.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlockDevice = () => {
    // Force secure logout path, reset local states and route back
    clearSession();
    router.push("/login?alert=blocked");
  };

  if (!deviceDetails) return null;

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-white border border-slate-100 rounded-2xl shadow-sm text-center">
      {/* Exclamation Icon */}
      <div className="flex items-center justify-center mx-auto mb-5 w-12 h-12 bg-amber-50 text-amber-600 rounded-full animate-bounce">
        <AlertTriangle className="w-6 h-6" />
      </div>

      {/* Header Info */}
      <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
        New device detected
      </h2>
      <p className="text-sm text-slate-500 mt-2 font-medium leading-relaxed px-4">
        We noticed a sign-in from a device we don&apos;t recognise.
      </p>

      {/* Details Box */}
      <div className="mt-6 p-5 bg-slate-50 border border-slate-100 rounded-xl text-left space-y-4">
        {/* Location Row */}
        <div className="flex items-start space-x-3.5">
          <MapPin className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Location
            </div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">
              {deviceDetails.location}
            </div>
          </div>
        </div>

        {/* Device Row */}
        <div className="flex items-start space-x-3.5">
          <Monitor className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Device
            </div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">
              {deviceDetails.device}
            </div>
          </div>
        </div>

        {/* Time Row */}
        <div className="flex items-start space-x-3.5">
          <Clock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Time
            </div>
            <div className="text-sm font-semibold text-slate-800 mt-0.5">
              {deviceDetails.time}
            </div>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="text-xs font-semibold text-red-600 mt-3 text-left">
          {errorMsg}
        </div>
      )}

      {/* Buttons */}
      <div className="mt-8 flex flex-col gap-3">
        <Button
          onClick={handleTrustDevice}
          className="w-full text-sm font-semibold tracking-wide"
          variant="secondary"
          disabled={isLoading}
        >
          {isLoading ? "Authorizing..." : "This was me — trust device"}
        </Button>
        
        <Button
          onClick={handleBlockDevice}
          className="w-full text-sm font-semibold tracking-wide border-red-200 text-red-600 hover:bg-red-50"
          variant="outline"
          disabled={isLoading}
        >
          Not me — secure account
        </Button>
      </div>

      {/* Bottom email notice */}
      <div className="mt-6 text-[11px] font-semibold text-slate-400 leading-normal px-4">
        A security notification has been sent to your registered email.
      </div>
    </div>
  );
};
