import { Metadata } from "next";
import { BrandingPanel } from "../../../components/auth/branding-panel";
import { LoginForm } from "../../../components/auth/login-form";

export const metadata: Metadata = {
  title: "Login | Naprocs EMS",
  description: "Sign in to the Naprocs Enterprise Employee Management System.",
};

export default function LoginPage() {
  return (
    <div className="flex w-full h-screen bg-white overflow-hidden">
      {/* Premium left brand visual layout */}
      <BrandingPanel />

      {/* Right form submission panel */}
      <div className="flex-1 flex flex-col items-center justify-center h-full bg-white overflow-y-auto py-10">
        <LoginForm />
      </div>
    </div>
  );
}
