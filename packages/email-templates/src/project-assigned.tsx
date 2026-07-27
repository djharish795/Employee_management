import React from "react";
import { MainLayout } from "./MainLayout";
import { Text, Section, Hr, Button } from "@react-email/components";

interface ProjectAssignedEmailProps {
  name: string;
  projectName: string;
  role: string;
  deadline: string;
  assignedBy: string;
}

const BRAND_COLOR = "#003366";

export const ProjectAssignedEmail = ({
  name = "Employee",
  projectName = "Apollo Migration",
  role = "Frontend Lead",
  deadline = "Dec 31, 2024",
  assignedBy = "Manager",
}: ProjectAssignedEmailProps) => {
  return (
    <MainLayout previewText={`You have been assigned to ${projectName}`}>
      <Text style={heading}>New Project Assignment</Text>
      
      <Text style={paragraph}>
        Hi {name},
      </Text>
      
      <Text style={paragraph}>
        You have just been assigned to a new project team by <strong>{assignedBy}</strong>!
      </Text>

      <Hr style={hr} />

      <Section style={detailsBox}>
        <Text style={detailRow}>
          <strong>Project Name:</strong> {projectName}
        </Text>
        <Text style={detailRow}>
          <strong>Your Role:</strong> {role}
        </Text>
        <Text style={detailRow}>
          <strong>Target Deadline:</strong> {deadline}
        </Text>
      </Section>
      
      <Section style={buttonContainer}>
        <Button style={button} href="https://crewbase.naprocs.in/projects">
          View Project Details
        </Button>
      </Section>

      <Text style={paragraph}>
        Please review the project briefs in the EMS portal and reach out to your team lead if you have any questions.
      </Text>
    </MainLayout>
  );
};

export default ProjectAssignedEmail;

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
