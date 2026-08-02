import React from "react";
import { MainLayout } from "./MainLayout";
import { Text, Section, Hr } from "@react-email/components";

interface MfaOtpEmailProps {
  otp: string;
  expiresInMinutes?: number;
  ipAddress?: string;
}

const BRAND_COLOR = "#003366";

export const MfaOtpEmail = ({
  otp = "123456",
  expiresInMinutes = 5,
  ipAddress = "127.0.0.1",
}: MfaOtpEmailProps) => {
  return (
    <MainLayout previewText="Your Naprocs Verification Code">
      <Text style={heading}>Login Verification Code</Text>
      
      <Text style={paragraph}>
        Welcome back to Naprocs EMS! We are thrilled to see you.
        <br /><br />
        To ensure the highest level of security for your account, we require a quick verification step. Please use the One-Time Password (OTP) below to securely complete your login and access your dashboard.
      </Text>

      <Section style={credentialBox}>
        <Text style={otpText}>{otp}</Text>
      </Section>

      <Text style={paragraph}>
        This code is valid for <strong>{expiresInMinutes} minutes</strong>. Do not share this code with anyone.
      </Text>

      <Hr style={hr} />

      <Text style={mutedText}>
        Request originated from IP Address: {ipAddress}
      </Text>
      
      <Text style={mutedText}>
        If you did not attempt to sign in, please contact the IT Security team immediately.
      </Text>
    </MainLayout>
  );
};

export default MfaOtpEmail;

// Styles
const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#111827",
  marginBottom: "16px",
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  color: "#4b5563",
  marginBottom: "16px",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const credentialBox = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  padding: "24px",
  marginBottom: "24px",
  textAlign: "center" as const,
};

const otpText = {
  fontSize: "36px",
  letterSpacing: "8px",
  color: BRAND_COLOR,
  fontWeight: "bold",
  margin: "0",
};

const mutedText = {
  fontSize: "13px",
  color: "#6b7280",
  lineHeight: "20px",
};
