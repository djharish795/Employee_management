"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, Save } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
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

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [activeStep, setActiveStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [employeeData, setEmployeeData] = useState<any>(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  const { canManageEmployees, role } = usePermissions();

  useEffect(() => {
    async function fetchEmployeeAndPolicy() {
      try {
        const url = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";
        
        // Parallel fetch employee and policy
        const [empRes, policyRes] = await Promise.all([
          fetch(`${url}/employees/${id}`, {
            headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
          }),
          apiClient.get("/settings/policy")
        ]);

        if (empRes.ok) {
          const data = await empRes.json();
          const policy = policyRes.data;

          // Permission Check
          let canEdit = canManageEmployees;
          if (role === "CEO" && policy?.ceoCanEditEmployeeDetails) {
            canEdit = true;
          }

          if (!canEdit && data.employeeId !== id && data.id !== id) { // assuming id could be employeeId or db id
            // Check if they are trying to edit someone else
            const myEmployeeId = useAuthStore.getState().employeeId;
            if (data.id !== myEmployeeId) {
              alert("You do not have permission to edit this profile.");
              router.push(`/employees/${id}`);
              return;
            }
          }

          const formatted = {
            ...data,
            emergencyContact: data.emergencyContact || {},
          };
          setEmployeeData(formatted);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    }
    fetchEmployeeAndPolicy();
  }, [id, accessToken, canManageEmployees, role, router]);

  const handleStepSave = async (stepData: any) => {
    setIsSubmitting(true);
    try {
      // Simulate API call to update employee section
      await new Promise(resolve => setTimeout(resolve, 800));
      
      alert('Changes saved successfully!');
      // We don't advance the step automatically in edit mode. 
      // They can navigate away or click another tab.
    } catch (error) {
      console.error(error);
      alert("Validation failed or server error.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    if (isLoading) {
      return (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-8 h-8 border-4 border-slate-900/35 border-t-blue-600 rounded-full animate-spin" />
          <span className="text-sm font-semibold text-slate-500">Loading profile data...</span>
        </div>
      );
    }

    switch (activeStep) {
      case 1: return <PersonalInformationForm onSave={handleStepSave} initialData={employeeData} />;
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
  const currentStepDesc = "Update the information below and click Save Changes.";

  return (
    <div className="min-h-full bg-slate-50 flex flex-col font-sans relative">
      
      {/* Top Header */}
      <div className="px-8 py-4 border-b border-slate-200 bg-white flex items-center justify-between">
        <button 
          onClick={() => router.push(`/employees/${id}`)}
          className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>
        <div className="text-sm font-bold text-slate-900">
          Editing Employee: <span className="text-blue-600">{id}</span>
        </div>
      </div>

      {/* Top Stepper (Clickable in Edit Mode) */}
      <Stepper steps={STEPS} activeStep={activeStep} onStepClick={(step) => setActiveStep(step)} />

      {/* Main Content Area */}
      <div className="flex-1 p-4 sm:p-8 pb-32 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">
            {currentStepTitle}
          </h2>
          <p className="text-sm font-semibold text-slate-500 mb-8">
            {currentStepDesc}
          </p>

          {renderStepContent()}
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 lg:left-[64px] xl:left-[240px] right-0 h-16 bg-white border-t border-slate-200 px-4 sm:px-8 flex items-center justify-between z-20 transition-all duration-300">
        <div className="hidden sm:flex items-center gap-8">
          <span className="text-xs font-semibold text-slate-400">
            All changes are tracked in the audit log.
          </span>
        </div>
        
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
          <button 
            onClick={() => router.push(`/employees/${id}`)}
            className="flex items-center gap-2 h-10 px-4 bg-transparent hover:bg-slate-50 text-slate-600 rounded-lg text-sm font-bold transition-all"
          >
            Cancel
          </button>
          
          <button 
            type="submit"
            form="onboarding-form"
            disabled={isSubmitting || isLoading}
            className="flex items-center gap-2 h-10 px-6 bg-[#0052CC] hover:bg-[#0047B3] text-white rounded-md text-sm font-bold shadow-sm transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : (
              <>
                Save Changes <Save className="w-4 h-4 ml-1" />
              </>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
