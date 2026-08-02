import { Metadata } from "next";
import { BrandingPanel } from "../../components/auth/branding-panel";
import MasterAdminEntryPoint from "@/components/master-admin/MasterAdminEntryPoint";

export const metadata: Metadata = {
  title: "Master Admin · Crewbase",
};

export default function MasterAuthPage() {
  return (
    <div style={{ display: "flex", width: "100%", minHeight: "100vh", background: "#fff", overflow: "hidden" }}>
      {/* Animated left branding panel (matches production login) */}
      <BrandingPanel />

      {/* Right: master admin auth panel */}
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
        <MasterAdminEntryPoint />
      </div>
    </div>
  );
}
