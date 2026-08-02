import React from "react";
import { MainLayout } from "./MainLayout";
import { Text, Section, Button, Hr } from "@react-email/components";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

interface MeetRequestEmailProps {
  meet: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    requester: {
      firstName: string;
      lastName: string;
    };
  };
  actionUrl: string;
}

const BRAND_COLOR = "#003366";

export const MeetRequestEmail = ({
  meet = {
    title: "1-on-1 Discussion",
    description: "Discussing project details",
    startTime: "2026-08-03T04:30:00.000Z",
    endTime: "2026-08-03T05:00:00.000Z",
    requester: {
      firstName: "John",
      lastName: "Doe",
    },
  },
  actionUrl = "https://crewbase.naprocs.in/connect",
}: MeetRequestEmailProps) => {
  const formattedDate = dayjs(meet.startTime).tz("Asia/Kolkata").format("dddd, MMMM D, YYYY");
  const formattedStartTime = dayjs(meet.startTime).tz("Asia/Kolkata").format("h:mm A");
  const formattedEndTime = dayjs(meet.endTime).tz("Asia/Kolkata").format("h:mm A");

  return (
    <MainLayout previewText={`Meeting Request: ${meet.title}`}>
      <Text style={heading}>New Meeting Request</Text>
      
      <Text style={paragraph}>
        Hello, <strong>{meet.requester.firstName} {meet.requester.lastName}</strong> has requested a meeting with you.
      </Text>

      <Section style={detailsBox}>
        <Text style={detailRow}>
          <strong>Topic:</strong> {meet.title}
        </Text>
        <Text style={detailRow}>
          <strong>Description:</strong> {meet.description || "N/A"}
        </Text>
        <Text style={detailRow}>
          <strong>Date:</strong> {formattedDate}
        </Text>
        <Text style={detailRow}>
          <strong>Time:</strong> {formattedStartTime} - {formattedEndTime} (IST)
        </Text>
      </Section>

      <Section style={buttonContainer}>
        <Button style={button} href={actionUrl}>
          Review Request in Naprocs EMS
        </Button>
      </Section>

      <Hr style={hr} />

      <Text style={mutedText}>
        This is an automated message from the Naprocs EMS system.
      </Text>
    </MainLayout>
  );
};

export default MeetRequestEmail;

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
  margin: "0 0 12px 0",
  lineHeight: "1.4",
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

const mutedText = {
  fontSize: "13px",
  color: "#6b7280",
  lineHeight: "20px",
};
