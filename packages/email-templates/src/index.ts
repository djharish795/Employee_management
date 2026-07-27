import { render } from "@react-email/render";
import React from "react";
import { WelcomeEmail } from "./welcome-email";
import { LeaveApprovedEmail } from "./leave-approved";
import { ProjectAssignedEmail } from "./project-assigned";
import { OffboardingEmail } from "./offboarding-email";

// Helper function to render React Email components to HTML string
export const renderEmailHtml = async (
  templateName: string,
  context: any
): Promise<string> => {
  let element: React.ReactElement | null = null;

  switch (templateName.toUpperCase()) {
    case "WELCOME":
    case "ONBOARDING":
      element = React.createElement(WelcomeEmail, context);
      break;
    case "LEAVE_APPROVED":
      element = React.createElement(LeaveApprovedEmail, context);
      break;
    case "PROJECT_ASSIGNED":
      element = React.createElement(ProjectAssignedEmail, context);
      break;
    case "OFFBOARDING":
      element = React.createElement(OffboardingEmail, context);
      break;
    default:
      // Fallback for unknown templates
      return `<p><strong>Template:</strong> ${templateName}</p><pre>${JSON.stringify(
        context,
        null,
        2
      )}</pre>`;
  }

  // Render the react element to static HTML
  return render(element, { pretty: true });
};
