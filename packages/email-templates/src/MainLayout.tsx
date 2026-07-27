import React from "react";
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Img,
  Text,
  Preview,
} from "@react-email/components";

interface MainLayoutProps {
  previewText: string;
  children: React.ReactNode;
}

const BRAND_COLOR = "#003366";

export const MainLayout = ({ previewText, children }: MainLayoutProps) => {
  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src="https://crewbase.naprocs.in/logo.jpeg"
              width="150"
              alt="Naprocs EMS"
              style={logo}
            />
          </Section>
          
          <Section style={content}>
            {children}
          </Section>

          <Section style={footer}>
            <Text style={footerText}>
              &copy; {new Date().getFullYear()} Naprocs Technologies Pvt. Ltd. All rights reserved.
              <br />
              This is an automated message. Please do not reply directly to this email.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const main = {
  backgroundColor: "#f3f4f6",
  fontFamily:
    "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Oxygen-Sans,Ubuntu,Cantarell,'Helvetica Neue',sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "20px 0 48px",
  width: "580px",
  maxWidth: "100%",
};

const header = {
  padding: "24px",
  backgroundColor: "#ffffff",
  borderTopLeftRadius: "8px",
  borderTopRightRadius: "8px",
  borderBottom: `4px solid ${BRAND_COLOR}`,
  textAlign: "center" as const,
};

const logo = {
  margin: "0 auto",
  objectFit: "contain" as const,
};

const content = {
  padding: "32px",
  backgroundColor: "#ffffff",
};

const footer = {
  padding: "24px",
  backgroundColor: "#e5e7eb",
  borderBottomLeftRadius: "8px",
  borderBottomRightRadius: "8px",
};

const footerText = {
  fontSize: "12px",
  color: "#6b7280",
  textAlign: "center" as const,
  margin: 0,
};
