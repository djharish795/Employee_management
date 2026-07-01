"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { SelectTimeStep } from "./steps/select-time-step";
import { MeetingDetailsStep } from "./steps/meeting-details-step";
import { ReviewRequestStep } from "./steps/review-request-step";
import { ConfirmationStep } from "./steps/confirmation-step";

interface BookingWizardProps {
  employeeId: string;
}

export interface BookingState {
  employeeId: string;
  meetingType: string;
  selectedDate: Date | null;
  selectedTime: string | null;
  duration: number;
  title: string;
  agenda: string;
  priority: string;
  platform: string;
  notifyAttendees: boolean;
  attachInvite: boolean;
  recordMeeting: boolean;
}

export function BookingWizard({ employeeId }: BookingWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  
  const [bookingData, setBookingData] = useState<BookingState>({
    employeeId,
    meetingType: "Quick call",
    selectedDate: new Date(),
    selectedTime: null,
    duration: 30,
    title: "",
    agenda: "",
    priority: "Normal",
    platform: "Google Meet",
    notifyAttendees: true,
    attachInvite: true,
    recordMeeting: false,
  });

  const updateData = (data: Partial<BookingState>) => {
    setBookingData(prev => ({ ...prev, ...data }));
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const cancel = () => router.push("/connect");

  return (
    <div className="w-full h-full min-h-[calc(100vh-200px)]">
      {currentStep === 1 && (
        <SelectTimeStep 
          data={bookingData} 
          updateData={updateData} 
          onNext={nextStep} 
          onCancel={cancel} 
        />
      )}
      {currentStep === 2 && (
        <MeetingDetailsStep 
          data={bookingData} 
          updateData={updateData} 
          onNext={nextStep} 
          onPrev={prevStep} 
        />
      )}
      {currentStep === 3 && (
        <ReviewRequestStep 
          data={bookingData} 
          onNext={nextStep} 
          onPrev={prevStep} 
        />
      )}
      {currentStep === 4 && (
        <ConfirmationStep 
          data={bookingData} 
        />
      )}
    </div>
  );
}
