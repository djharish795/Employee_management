import React from "react";
import { MainLayout } from "./MainLayout";
import { Text, Section, Hr, Button } from "@react-email/components";

interface OffboardingEmailProps {
  name: string;
  lastWorkingDay: string;
  settlementDate: string;
}

const BRAND_COLOR = "#003366";

export const OffboardingEmail = ({
  name = "Employee",
  lastWorkingDay = "Dec 31, 2024",
  settlementDate = "Jan 15, 2025",
}: OffboardingEmailProps) => {
  return (
    <MainLayout previewText="Offboarding Process Initiated">
      <Text style={heading}>Offboarding Process Initiated</Text>
      
      <Text style={paragraph}>
        Hi {name},
      </Text>
      
      <Text style={paragraph}>
        We have received your exit request and have initiated the offboarding process. We wish you the best in your future endeavors!
      </Text>

      <Hr style={hr} />

      <Section style={detailsBox}>
        <Text style={detailRow}>
          <strong>Last Working Day:</strong> {lastWorkingDay}
        </Text>
        <Text style={detailRow}>
          <strong>Expected Settlement Date:</strong> {settlementDate}
        </Text>
      </Section>
      
      <Text style={paragraph}>
        Please ensure you complete all your pending tasks, submit any final expense claims, and complete your Knowledge Transfer (KT) checklist. 
        Your system access will be revoked automatically at the end of your last working day.
      </Text>
      
      <Section style={buttonContainer}>
        <Button style={button} href="https://crewbase.naprocs.in/offboarding">
          View Exit Checklist
        </Button>
      </Section>
    </MainLayout>
  );
};

export default OffboardingEmail;

// Styles
const heading = {
  fontSize: "24px",
  fontWeight: "bold",
  color: "#b91c1c", // Red for exit
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

const detailsBox = {
  backgroundColor: "#f9fafb",
  border: "1px solid #e5e7eb",
  borderRadius: "6px",
  padding: "16px",
  marginBottom: "24px",
};

const detailRow = {
  fontSize: "16px",
  color: "#111827",
  margin: "0 0 8px 0",
};

const buttonContainer = {
  textAlign: "center" as const,
  marginTop: "16px",
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
