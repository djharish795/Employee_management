"use client";
import toast from "react-hot-toast";
import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, CheckCircle, Loader2, AlertCircle } from 'lucide-react';
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
import { apiClient } from '@/lib/api/client';

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

const LS_DRAFT_ID_KEY = 'ems_onboarding_draftId';
const LS_DRAFT_DATA_KEY = 'ems_onboarding_draftData';
const SS_SESSION_KEY = 'ems_onboarding_session_active';

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key: string, value: any) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { }
}

function clearDraftStorage() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(LS_DRAFT_ID_KEY);
  localStorage.removeItem(LS_DRAFT_DATA_KEY);
}

export default function AddEmployeePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  
  const activeStep = parseInt(searchParams.get('step') || '1', 10);
  const setActiveStep = (step: number) => {
    router.replace(`${pathname}?step=${step}`);
  };

  const [draftId, setDraftId] = useState<string | null>(() => loadFromStorage<string | null>(LS_DRAFT_ID_KEY, null));
  const [draftData, setDraftData] = useState<any>(() => loadFromStorage<any>(LS_DRAFT_DATA_KEY, {}));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResumePrompt, setShowResumePrompt] = useState(false);
  const { role } = usePermissions();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const existingDraftId = loadFromStorage<string | null>(LS_DRAFT_ID_KEY, null);
    const sessionActive = sessionStorage.getItem(SS_SESSION_KEY);
    if (existingDraftId && !sessionActive) {
      setShowResumePrompt(true);
    } else {
      sessionStorage.setItem(SS_SESSION_KEY, '1');
    }
  }, []);

  useEffect(() => {
    if (draftId) saveToStorage(LS_DRAFT_ID_KEY, draftId);
  }, [draftId]);

  useEffect(() => {
    if (Object.keys(draftData).length > 0) saveToStorage(LS_DRAFT_DATA_KEY, draftData);
  }, [draftData]);

  if (role !== "HR" && role !== "CHRO") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm">Only HR personnel can access the Onboarding Wizard.</p>
      </div>
    );
  }

  if (showResumePrompt) {
    const saved = loadFromStorage<any>(LS_DRAFT_DATA_KEY, {});
    const employeeName = [saved.firstName, saved.lastName].filter(Boolean).join(' ') || 'Unknown Employee';
    return (
      <div className="min-h-full bg-slate-50 flex items-center justify-center">
        <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-14 h-14 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Unsaved Draft Found</h2>
          <p className="text-sm text-slate-500 mb-1">
            You have an incomplete onboarding draft for:
          </p>
          <p className="text-base font-bold text-slate-800 mb-6">{employeeName}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                sessionStorage.setItem(SS_SESSION_KEY, '1');
                setShowResumePrompt(false);
              }}
              className="w-full h-11 bg-[#0052CC] hover:bg-[#0047B3] text-white rounded-lg text-sm font-bold transition-all"
            >
              Resume Draft
            </button>
            <button
              onClick={() => {
                clearDraftStorage();
                setDraftId(null);
                setDraftData({});
                setActiveStep(1);
                sessionStorage.setItem(SS_SESSION_KEY, '1');
                setShowResumePrompt(false);
              }}
              className="w-full h-11 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm font-bold transition-all"
            >
              Discard & Start New Onboarding
            </button>
          </div>
        </div>
      </div>
    );
  }

  const getStepData = () => {
    const formElement = document.getElementById(`onboarding-form-${activeStep}`) as HTMLFormElement;
    if (!formElement) return null;
    
    const formData = new FormData(formElement);
    const stepData: any = Object.fromEntries(formData.entries());
    
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
    return stepData;
  };

  const handleFormChange = () => {
    const stepData = getStepData();
    if (stepData) {
      // 1. Instantly save to short-term memory (localStorage)
      const currentStorage = loadFromStorage<any>(LS_DRAFT_DATA_KEY, {});
      const updated = { ...currentStorage, ...stepData };
      saveToStorage(LS_DRAFT_DATA_KEY, updated);

      // 2. Debounce the backend save (2 seconds after last typing)
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const payload = {
            draftId: draftId || "",
            stepNumber: activeStep.toString(),
            payload: stepData
          };
          const res = await apiClient.post("/employees/onboarding/draft/step", payload);
          if (res.data?.draftId && !draftId) {
            setDraftId(res.data.draftId);
            saveToStorage(LS_DRAFT_ID_KEY, res.data.draftId);
          }
        } catch (e) {
          console.warn("Background auto-save failed", e);
        }
      }, 2000);
    }
  };

  const mergeDraftData = (stepData: any) => {
    const updated = { ...draftData, ...stepData };
    setDraftData(updated);
    saveToStorage(LS_DRAFT_DATA_KEY, updated);
  };

  const handleStepSave = async (stepData: any, direction: 'next' | 'prev' = 'next') => {
    setIsSubmitting(true);
    mergeDraftData(stepData);
    
    try {
      const payload = {
        draftId: draftId || "",
        stepNumber: activeStep.toString(),
        payload: stepData
      };

      const res = await apiClient.post("/employees/onboarding/draft/step", payload);
      const data = res.data;

      if (data.draftId && !draftId) {
        setDraftId(data.draftId);
        saveToStorage(LS_DRAFT_ID_KEY, data.draftId);
      }

      if (direction === 'next') {
        if (activeStep < STEPS.length) {
          setActiveStep(activeStep + 1);
        } else {
          await completeOnboarding(data.draftId || draftId);
        }
      } else if (direction === 'prev') {
        if (activeStep > 1) {
          setActiveStep(activeStep - 1);
        }
      }
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || error?.message || 'Validation failed or server error.';
      toast.error(`Error: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const completeOnboarding = async (id: string) => {
    try {
      await apiClient.post("/employees/onboarding/draft/complete", { draftId: id });
      clearDraftStorage();
      toast.success('Employee Created Successfully!');
      window.location.href = "/employees";
    } catch (error: any) {
      console.error("Complete Onboarding Error:", error);
      const msg = error.response?.data?.message || error?.message || "Failed to complete onboarding.";
      toast.error(`Error: ${msg}`);
    }
  };

  const handlePrev = async () => {
    if (activeStep > 1) {
      const stepData = getStepData();
      if (stepData) {
        await handleStepSave(stepData, 'prev');
      } else {
        setActiveStep(activeStep - 1);
      }
    }
  };

  const handleNext = async () => {
    const formElement = document.getElementById(`onboarding-form-${activeStep}`) as HTMLFormElement;
    if (!formElement) return;

    if (!formElement.reportValidity()) {
      return;
    }

    const stepData = getStepData();
    if (stepData) {
      await handleStepSave(stepData, 'next');
    }
  };

  const handleSaveDraft = async () => {
    const stepData = getStepData();
    if (!stepData) return;
    
    mergeDraftData(stepData);
    setIsSubmitting(true);
    try {
      const payload = {
        draftId: draftId || "",
        stepNumber: activeStep.toString(),
        payload: stepData
      };

      const res = await apiClient.post("/employees/onboarding/draft/step", payload);
      const data = res.data;

      if (data.draftId && !draftId) {
        setDraftId(data.draftId);
        saveToStorage(LS_DRAFT_ID_KEY, data.draftId);
      }
      
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
        <div className={activeStep === 1 ? 'block' : 'hidden'}><PersonalInformationForm formId={`onboarding-form-1`} onSave={handleStepSave} initialData={draftData} /></div>
        <div className={activeStep === 2 ? 'block' : 'hidden'}><EmploymentForm formId={`onboarding-form-2`} onSave={handleStepSave} initialData={draftData} /></div>
        <div className={activeStep === 3 ? 'block' : 'hidden'}><IdentityForm formId={`onboarding-form-3`} onSave={handleStepSave} initialData={draftData} /></div>
        <div className={activeStep === 4 ? 'block' : 'hidden'}><BankingForm formId={`onboarding-form-4`} onSave={handleStepSave} initialData={draftData} /></div>
        <div className={activeStep === 5 ? 'block' : 'hidden'}><EmergencyForm formId={`onboarding-form-5`} onSave={handleStepSave} initialData={draftData} /></div>
        <div className={activeStep === 6 ? 'block' : 'hidden'}><AssetsForm formId={`onboarding-form-6`} onSave={handleStepSave} initialData={draftData} /></div>
        <div className={activeStep === 7 ? 'block' : 'hidden'}><DocumentsForm formId={`onboarding-form-7`} onSave={handleStepSave} initialData={draftData} /></div>
        <div className={activeStep === 8 ? 'block' : 'hidden'}><AccessControlForm formId={`onboarding-form-8`} onSave={handleStepSave} initialData={draftData} /></div>
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

          <div onChange={handleFormChange} onBlur={handleFormChange}>
            {renderStepContent()}
          </div>
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
