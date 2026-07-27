import React from "react";
import { MainLayout } from "./MainLayout";
import { Text, Button, Section, Hr } from "@react-email/components";

interface WelcomeEmailProps {
  name: string;
  email: string;
  temporaryPassword?: string;
  loginUrl?: string;
}

const BRAND_COLOR = "#003366";

export const WelcomeEmail = ({
  name = "Employee",
  email = "employee@naprocs.in",
  temporaryPassword = "TEMPORARY_PASSWORD",
  loginUrl = "https://crewbase.naprocs.in",
}: WelcomeEmailProps) => {
  return (
    <MainLayout previewText="Welcome to Naprocs EMS!">
      <Text style={heading}>Welcome to Naprocs, {name}!</Text>
      
      <Text style={paragraph}>
        We are thrilled to have you join the team. Your official Naprocs EMS account has been successfully created. You can use this portal to manage your attendance, request leaves, view your assets, and connect with your team.
      </Text>

      <Hr style={hr} />

      <Text style={subheading}>Your Login Credentials</Text>
      <Text style={paragraph}>
        Please use the following credentials to access the system for the first time. You will be prompted to change your password immediately upon logging in.
      </Text>
      
      <Section style={credentialBox}>
        <Text style={credentialText}>
          <strong>Email:</strong> {email}
        </Text>
        <Text style={credentialText}>
          <strong>Temporary Password:</strong> {temporaryPassword}
        </Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={loginUrl}>
          Login to Naprocs EMS
        </Button>
      </Section>

      <Text style={paragraph}>
        If you have any trouble logging in, please contact the IT team.
      </Text>
    </MainLayout>
  );
};

export default WelcomeEmail;

// Styles
const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#111827",
  marginBottom: "16px",
};

const subheading = {
  fontSize: "18px",
  fontWeight: "bold",
  color: "#374151",
  marginTop: "24px",
  marginBottom: "12px",
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
  padding: "16px",
  marginBottom: "24px",
};

const credentialText = {
  fontSize: "16px",
  color: "#111827",
  margin: "0 0 8px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  marginTop: "24px",
  marginBottom: "24px",
};

const button = {
  backgroundColor: BRAND_COLOR,
  borderRadius: "6px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};
