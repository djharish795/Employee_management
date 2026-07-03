import { Metadata } from "next";
import { BrandingPanel } from "../../../components/auth/branding-panel";
import { LoginForm } from "../../../components/auth/login-form";

export const metadata: Metadata = {
  title: "NAPROCS · AI Echo System",
  description: "Sign in to the Naprocs Enterprise Employee Management System.",
};

export default function LoginPage() {
  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", background: "#fff", overflow: "hidden" }}>
      {/* Animated left branding panel */}
      <BrandingPanel />

      {/* Right: login form panel */}
      <div
        style={{
          flex: "1 1 50%",
          minWidth: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fff",
          padding: 40,
          overflowY: "auto",
        }}
      >
        <LoginForm />
      </div>
    </div>
  );
}
