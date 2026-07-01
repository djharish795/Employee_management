import React from "react";
import { Metadata } from "next";
import { BookingWizard } from "@/components/modules/connect/booking/booking-wizard";

export const metadata: Metadata = {
  title: "Schedule Meeting | Naprocs EMS",
  description: "Book a meeting with a colleague.",
};

export default function BookingPage({ params }: { params: { id: string } }) {
  return <BookingWizard employeeId={params.id} />;
}
