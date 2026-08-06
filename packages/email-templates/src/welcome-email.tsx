import React from "react";
import { MainLayout } from "./MainLayout";
import { Text, Button, Section, Hr, Heading } from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
  email: string;
  temporaryPassword?: string;
  loginUrl?: string;
}

const BRAND_COLOR = "#0052CC";
const ACCENT_COLOR = "#00B8D9";

export const WelcomeEmail = ({
  name = "Employee",
  email = "employee@naprocs.in",
  temporaryPassword = "TEMPORARY_PASSWORD",
  loginUrl = "https://crewbase.naprocs.in",
}: WelcomeEmailProps) => {
  return (
    <MainLayout previewText={`🎉 Welcome to the Naprocs family, ${name}! Your EMS account is ready.`}>

      {/* Hero Banner */}
      <Section style={heroBanner}>
        <Text style={heroEmoji}>🚀</Text>
        <Text style={heroHeading}>Welcome aboard, {name}!</Text>
        <Text style={heroSubtext}>
          We are beyond excited to have you with us. Today marks the beginning of an incredible journey — let's build something great together.
        </Text>
      </Section>

      <Hr style={hr} />

      {/* Energetic message */}
      <Text style={paragraph}>
        Your official <strong>Naprocs EMS</strong> account has been created and is ready to go! 🎯 From managing your attendance and leaves to connecting with your teammates and tracking your growth — your new digital workspace has everything you need, right at your fingertips.
      </Text>

      <Text style={paragraph}>
        Here is what you can do from day one:
      </Text>

      <Section style={featureList}>
        <Text style={featureItem}>✅ &nbsp;Mark attendance & apply for leaves</Text>
        <Text style={featureItem}>📋 &nbsp;View tasks & project assignments</Text>
        <Text style={featureItem}>👥 &nbsp;Connect with your team & manager</Text>
        <Text style={featureItem}>🏆 &nbsp;Track your performance & growth</Text>
      </Section>

      <Hr style={hr} />

      {/* Credentials Box */}
      <Text style={subheading}>🔑 Your Login Credentials</Text>
      <Text style={paragraph}>
        Use the credentials below to sign in for the first time. Please change your password immediately after your first login to keep your account secure.
      </Text>

      <Section style={credentialBox}>
        <Text style={credentialLabel}>LOGIN EMAIL</Text>
        <Text style={credentialValue}>{email}</Text>
        <Hr style={credentialDivider} />
        <Text style={credentialLabel}>TEMPORARY PASSWORD</Text>
        <Text style={credentialValue}>{temporaryPassword}</Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={loginUrl}>
          🚀 &nbsp;Launch Your EMS Dashboard
        </Button>
      </Section>

      <Hr style={hr} />

      <Text style={cautionText}>
        ⚠️ This is a <strong>temporary password</strong>. You will be prompted to set a new one on first login. Never share your credentials with anyone. If you face any issues, contact HR or IT.
      </Text>

      <Text style={signOff}>
        Rooting for your success,<br />
        <strong>The Naprocs Team 💙</strong>
      </Text>

    </MainLayout>
  );
};

export default WelcomeEmail;

// --- Styles ---
const heroBanner = {
  background: `linear-gradient(135deg, ${BRAND_COLOR} 0%, #003A99 100%)`,
  borderRadius: "12px",
  padding: "32px 24px",
  textAlign: "center" as const,
  marginBottom: "24px",
};

const heroEmoji = {
  fontSize: "48px",
  margin: "0 0 8px 0",
  textAlign: "center" as const,
};

const heroHeading = {
  fontSize: "28px",
  fontWeight: "800",
  color: "#ffffff",
  margin: "0 0 12px 0",
  textAlign: "center" as const,
  letterSpacing: "-0.5px",
};

const heroSubtext = {
  fontSize: "15px",
  color: "rgba(255,255,255,0.85)",
  lineHeight: "24px",
  margin: "0",
  textAlign: "center" as const,
};

const subheading = {
  fontSize: "18px",
  fontWeight: "700",
  color: "#1E293B",
  marginTop: "24px",
  marginBottom: "12px",
};

const paragraph = {
  fontSize: "15px",
  lineHeight: "26px",
  color: "#475569",
  marginBottom: "16px",
};

const featureList = {
  backgroundColor: "#F8FAFC",
  border: "1px solid #E2E8F0",
  borderRadius: "10px",
  padding: "16px 20px",
  marginBottom: "24px",
};

const featureItem = {
  fontSize: "14px",
  color: "#334155",
  fontWeight: "600",
  margin: "4px 0",
  lineHeight: "28px",
};

const hr = {
  borderColor: "#E2E8F0",
  margin: "24px 0",
};

const credentialBox = {
  backgroundColor: "#0F172A",
  borderRadius: "10px",
  padding: "20px 24px",
  marginBottom: "24px",
};

const credentialLabel = {
  fontSize: "10px",
  fontWeight: "700",
  color: ACCENT_COLOR,
  letterSpacing: "1.5px",
  textTransform: "uppercase" as const,
  margin: "0 0 4px 0",
};

const credentialValue = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#F8FAFC",
  fontFamily: "monospace",
  margin: "0 0 12px 0",
};

const credentialDivider = {
  borderColor: "#334155",
  margin: "12px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  marginTop: "24px",
  marginBottom: "24px",
};

const button = {
  backgroundColor: BRAND_COLOR,
  borderRadius: "8px",
  color: "#fff",
  fontSize: "15px",
  fontWeight: "700",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 32px",
  letterSpacing: "0.3px",
};

const cautionText = {
  fontSize: "13px",
  lineHeight: "22px",
  color: "#64748B",
  backgroundColor: "#FFFBEB",
  border: "1px solid #FCD34D",
  borderRadius: "8px",
  padding: "12px 16px",
  marginBottom: "16px",
};

const signOff = {
  fontSize: "15px",
  color: "#334155",
  lineHeight: "26px",
  marginTop: "24px",
};
