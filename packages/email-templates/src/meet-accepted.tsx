import React from "react";
import { MainLayout } from "./MainLayout";
import { Text, Section, Button, Hr } from "@react-email/components";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

interface MeetAcceptedEmailProps {
  meet: {
    title: string;
    description: string;
    startTime: string;
    endTime: string;
    meetLink: string;
    requester: {
      firstName: string;
      lastName: string;
    };
  };
}

const BRAND_COLOR = "#003366";

export const MeetAcceptedEmail = ({
  meet = {
    title: "1-on-1 Discussion",
    description: "Discussing project details",
    startTime: "2026-08-03T04:30:00.000Z",
    endTime: "2026-08-03T05:00:00.000Z",
    meetLink: "https://zoom.us/j/123456789",
    requester: {
      firstName: "John",
      lastName: "Doe",
    },
  },
}: MeetAcceptedEmailProps) => {
  const formattedDate = dayjs(meet.startTime).tz("Asia/Kolkata").format("dddd, MMMM D, YYYY");
  const formattedStartTime = dayjs(meet.startTime).tz("Asia/Kolkata").format("h:mm A");
  const formattedEndTime = dayjs(meet.endTime).tz("Asia/Kolkata").format("h:mm A");

  return (
    <MainLayout previewText={`Zoom Meeting Scheduled: ${meet.title}`}>
      <Text style={heading}>Meeting Scheduled</Text>
      
      <Text style={paragraph}>
        Hello, your meeting requested by <strong>{meet.requester.firstName} {meet.requester.lastName}</strong> has been successfully scheduled.
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
        <Button style={button} href={meet.meetLink}>
          Join Zoom Meeting
        </Button>
      </Section>

      <Text style={paragraph}>
        You can also copy and paste the following link into your browser:
        <br />
        <a href={meet.meetLink} style={link}>{meet.meetLink}</a>
      </Text>

      <Hr style={hr} />

      <Text style={mutedText}>
        This is an automated message from the Naprocs EMS system.
      </Text>
    </MainLayout>
  );
};

export default MeetAcceptedEmail;

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

const link = {
  color: BRAND_COLOR,
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

const mutedText = {
  fontSize: "13px",
  color: "#6b7280",
  lineHeight: "20px",
};
