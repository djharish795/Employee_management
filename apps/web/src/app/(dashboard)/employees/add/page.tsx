"use client";
import toast from "react-hot-toast";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, CheckCircle, Loader2 } from 'lucide-react';
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
import { usePermissions } from '@/hooks/use-permissions';
import { AlertCircle } from 'lucide-react';

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
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const activeStep = parseInt(searchParams.get('step') || '1', 10);
  const setActiveStep = (step: number) => {
    router.replace(`${pathname}?step=${step}`);
  };

  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);
  const { role } = usePermissions();

  if (role !== "HR" && role !== "CHRO") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm">Only HR personnel can access the Onboarding Wizard.</p>
      </div>
    );
  }

  const handleStepSave = async (stepData: any) => {
    setIsSubmitting(true);
    try {
      const payload = {
        draftId: draftId || "",
        stepNumber: activeStep.toString(),
        payload: stepData
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
      const res = await fetch(`${apiUrl}/employees/onboarding/draft/step`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ message: 'Unknown error' }));
        const msg = errBody?.message || `Server error ${res.status}`;
        throw new Error(msg);
      }

      const data = await res.json();
      if (data.draftId && !draftId) {
        setDraftId(data.draftId);
      }

      if (activeStep < STEPS.length) {
        setActiveStep(activeStep + 1);
      } else {
        await completeOnboarding(data.draftId || draftId);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(`Error: ${error?.message || 'Validation failed or server error.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeOnboarding = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
      const res = await fetch(`${apiUrl}/employees/onboarding/draft/complete`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        credentials: "include",
        body: JSON.stringify({ draftId: id })
      });

      if (!res.ok) throw new Error("Failed to finalize employee");
      
      toast.success('Employee Created Successfully!');
      window.location.href = "/employees";
    } catch (error) {
      console.error(error);
      toast.error("Failed to complete onboarding.");
    }
  };

  const handlePrev = () => {
    if (activeStep > 1) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleNext = async () => {
    const formElement = document.getElementById(`onboarding-form-${activeStep}`) as HTMLFormElement;
    if (!formElement) return;

    // Explicitly enforce HTML5 validation before advancing
    if (!formElement.reportValidity()) {
      return; // Stop if required fields are missing or invalid
    }

    const formData = new FormData(formElement);
    const stepData: any = Object.fromEntries(formData.entries());
    
    // Convert special nested objects like emergencyContact if needed based on the step
    if (activeStep === 1) {
      stepData.emergencyContact = {
        name: stepData.emergencyContactName,
        phone: stepData.emergencyContactPhone,
        relation: stepData.emergencyContactRelation
      };
      delete stepData.emergencyContactName;
      delete stepData.emergencyContactPhone;
      delete stepData.emergencyContactRelation;
    }

    await handleStepSave(stepData);
  };

  const handleSaveDraft = async () => {
    const formElement = document.getElementById(`onboarding-form-${activeStep}`) as HTMLFormElement;
    if (!formElement) return;
    
    const formData = new FormData(formElement);
    const stepData: any = Object.fromEntries(formData.entries());
    
    // Convert special fields to match onSave logic if needed, but since it's a generic draft save, we just pass the object
    // To match the exact mapping inside the components, we can trigger the form submission but prevent default navigation.
    // However, the cleanest way is to just dispatch a custom event or reuse the API logic.
    setIsSubmitting(true);
    try {
      const payload = {
        draftId: draftId || "",
        stepNumber: activeStep.toString(),
        payload: stepData
      };

      const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
      const res = await fetch(`${apiUrl}/employees/onboarding/draft/step`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {})
        },
        credentials: "include",
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Failed to save draft");
      
      const data = await res.json();
      if (data.draftId && !draftId) setDraftId(data.draftId);
      
      toast.success("Draft saved successfully!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to save draft.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    return (
      <>
        <div className={activeStep === 1 ? 'block' : 'hidden'}><PersonalInformationForm formId="onboarding-form-1" onSave={handleStepSave} /></div>
        <div className={activeStep === 2 ? 'block' : 'hidden'}><EmploymentForm formId="onboarding-form-2" onSave={handleStepSave} /></div>
        <div className={activeStep === 3 ? 'block' : 'hidden'}><IdentityForm formId="onboarding-form-3" onSave={handleStepSave} /></div>
        <div className={activeStep === 4 ? 'block' : 'hidden'}><BankingForm formId="onboarding-form-4" onSave={handleStepSave} /></div>
        <div className={activeStep === 5 ? 'block' : 'hidden'}><EmergencyForm formId="onboarding-form-5" onSave={handleStepSave} /></div>
        <div className={activeStep === 6 ? 'block' : 'hidden'}><AssetsForm formId="onboarding-form-6" onSave={handleStepSave} /></div>
        <div className={activeStep === 7 ? 'block' : 'hidden'}><DocumentsForm formId="onboarding-form-7" onSave={handleStepSave} /></div>
        <div className={activeStep === 8 ? 'block' : 'hidden'}><AccessControlForm formId="onboarding-form-8" onSave={handleStepSave} /></div>
      </>
    );
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
            type="button"
            onClick={handleSaveDraft}
            disabled={isSubmitting}
            className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50 flex items-center gap-2"
          >
            {isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Draft'}
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
            type="button"
            onClick={activeStep === STEPS.length ? () => completeOnboarding(draftId!) : handleNext}
            disabled={isSubmitting || (activeStep === STEPS.length && !draftId)}
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
