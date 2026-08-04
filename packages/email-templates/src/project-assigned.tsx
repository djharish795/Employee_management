import React from "react";
import { MainLayout } from "./MainLayout";
import { Text, Section, Hr, Button } from "@react-email/components";

interface ProjectAssignedEmailProps {
  name: string;
  projectName: string;
  role: string;
  assignedBy: string;
  projectUrl: string;
  teamLeadName?: string;
}

const BRAND_COLOR = "#003366";

export const ProjectAssignedEmail = ({
  name = "Employee",
  projectName = "New Project",
  role = "Team Member",
  assignedBy = "Manager",
  projectUrl = "https://crewbase.naprocs.in/projects",
  teamLeadName,
}: ProjectAssignedEmailProps) => {
  return (
    <MainLayout previewText={`Welcome to the ${projectName} team!`}>
      <Text style={heading}>Welcome Aboard</Text>
      
      <Text style={paragraph}>
        Dear {name},
      </Text>
      
      <Text style={paragraph}>
        We are thrilled to welcome you to the <strong>{projectName}</strong> team! You have been officially assigned to this project in the capacity of <strong>{role}</strong> by <strong>{assignedBy}</strong>.
      </Text>

      <Text style={paragraph}>
        Your skills and expertise are highly valued, and we are confident that you will make a significant contribution to the success of this initiative. We look forward to seeing the great work we will achieve together.
      </Text>

      <Hr style={hr} />

      <Section style={detailsBox}>
        <Text style={detailRow}>
          <strong>Project Name:</strong> {projectName}
        </Text>
        <Text style={detailRow}>
          <strong>Your Role:</strong> {role}
        </Text>
        {teamLeadName && (
          <Text style={detailRow}>
            <strong>Team Lead:</strong> {teamLeadName}
          </Text>
        )}
      </Section>
      
      <Section style={buttonContainer}>
        <Button style={button} href={projectUrl}>
          Access Project Dashboard
        </Button>
      </Section>

      <Text style={paragraph}>
        Please review the project briefs in the EMS portal. If you have any questions or need immediate assistance, please reach out to your reporting manager.
      </Text>

      <Text style={paragraph}>
        Best regards,<br/>
        Naprocs Management
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
