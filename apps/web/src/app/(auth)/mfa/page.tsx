import { Metadata } from "next";
import { MfaCard } from "../../../components/auth/mfa-card";

export const metadata: Metadata = {
  title: "MFA Verification | Naprocs EMS",
  description: "Verify your identity with Two-Factor Authentication.",
};

export default function MfaPage() {
  return (
    <div className="flex w-full h-screen bg-[#fafbfc] items-center justify-center p-4">
      <MfaCard />
    </div>
  );
}
