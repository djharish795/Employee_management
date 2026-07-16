"use client";

import React, { useState } from 'react';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import { Stepper } from '@/components/employees/stepper';
import { PersonalInformationForm } from '@/components/employees/personal-information-form';
import { EmploymentForm } from '@/components/employees/employment-form';
import { IdentityForm } from '@/components/employees/identity-form';
import { BankingForm } from '@/components/employees/banking-form';
import { DocumentsForm } from '@/components/employees/documents-form';
import { EmergencyForm } from '@/components/employees/emergency-form';
import { AssetsForm } from '@/components/employees/assets-form';
import { AccessControlForm } from '@/components/employees/access-control-form';
import { WizardStep } from '@/types/employee';
import { useAuthStore } from '@/store/auth';

const STEPS: WizardStep[] = [
  { num: 1, title: 'Personal Info', active: false, completed: false },
  { num: 2, title: 'Employment', active: false, completed: false },
  { num: 3, title: 'Identity', active: false, completed: false },
  { num: 4, title: 'Banking', active: false, completed: false },
  { num: 5, title: 'Emergency', active: false, completed: false },
  { num: 6, title: 'Assets', active: false, completed: false },
  { num: 7, title: 'Documents', active: false, completed: false },
  { num: 8, title: 'Access Control', active: false, completed: false },
];

export default function AddEmployeePage() {
  const [activeStep, setActiveStep] = useState(1);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);

  const handleStepSave = async (stepData: any) => {
    setIsSubmitting(true);
    try {
      const payload = {
        draftId: draftId || "",
        stepNumber: activeStep.toString(),
        payload: stepData
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${apiUrl}/employees/onboarding/draft/step`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Failed to save draft step");
      }

      const data = await res.json();
      if (data.draftId && !draftId) {
        setDraftId(data.draftId);
      }

      if (activeStep < STEPS.length) {
        setActiveStep(prev => prev + 1);
      } else {
        await completeOnboarding(data.draftId || draftId);
      }
    } catch (error) {
      console.error(error);
      alert("Validation failed or server error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeOnboarding = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
      const res = await fetch(`${apiUrl}/employees/onboarding/draft/complete`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify({ draftId: id })
      });

      if (!res.ok) throw new Error("Failed to finalize employee");
      
      alert('Employee Created Successfully!');
      window.location.href = "/employees";
    } catch (error) {
      console.error(error);
      alert("Failed to complete onboarding.");
    }
  };

  const handlePrev = () => {
    if (activeStep > 1) {
      setActiveStep(prev => prev - 1);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 1: return <PersonalInformationForm onSave={handleStepSave} />;
      case 2: return <EmploymentForm onSave={handleStepSave} />;
      case 3: return <IdentityForm onSave={handleStepSave} />;
      case 4: return <BankingForm onSave={handleStepSave} />;
      case 5: return <EmergencyForm onSave={handleStepSave} />;
      case 6: return <AssetsForm onSave={handleStepSave} />;
      case 7: return <DocumentsForm onSave={handleStepSave} />;
      case 8: return <AccessControlForm onSave={handleStepSave} />;
      default: return null;
    }
  };

  const currentStepTitle = STEPS[activeStep - 1]?.title;
  const currentStepDesc = activeStep === 8 ? "Configure enterprise credentials and application permissions." : "Please fill out the information below to proceed to the next step.";

  return (
    <div className="min-h-full bg-slate-50 flex flex-col font-sans relative">
      
      {/* Top Stepper */}
      <Stepper steps={STEPS} activeStep={activeStep} />

      {/* Main Content Area */}
      <div className="flex-1 p-8 pb-32 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            Step {activeStep} of {STEPS.length}: {currentStepTitle}
          </h2>
          <p className="text-sm font-semibold text-slate-500 mb-8">
            {currentStepDesc}
          </p>

          {renderStepContent()}
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-[260px] right-0 h-16 bg-white border-t border-slate-200 px-8 flex items-center justify-between z-20">
        <div className="flex items-center gap-8">
          <button 
            className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            Save Draft
          </button>
          <span className="text-xs font-semibold text-slate-400">
            Copyright © 2024 Enterprise Corp.
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={handlePrev}
            disabled={activeStep === 1}
            className="flex items-center gap-2 h-10 px-4 bg-transparent hover:bg-slate-50 text-blue-600 rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-4 h-4" />
            Previous
          </button>
          
          <button 
            type="submit"
            form="onboarding-form"
            disabled={isSubmitting}
            className="flex items-center gap-2 h-10 px-6 bg-[#0052CC] hover:bg-[#0047B3] text-white rounded-md text-sm font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : activeStep === STEPS.length ? (
              <>
                Complete Onboarding <CheckCircle className="w-4 h-4 ml-1" />
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
