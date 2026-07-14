"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function NewOnboardingRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the robust Add Employee screens which act as the new onboarding portal
    router.replace("/employees/add");
  }, [router]);

  return (
    <div className="flex flex-col items-center justify-center h-full bg-slate-50">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-4" />
      <h2 className="text-lg font-bold text-slate-800">Redirecting to Onboarding Portal...</h2>
      <p className="text-sm text-slate-500 mt-2">Please wait while we load the complete onboarding wizard.</p>
    </div>
  );
}
