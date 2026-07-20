"use client";
import toast from "react-hot-toast";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Monitor, CheckCircle2, ChevronRight, AlertCircle, Briefcase, FileText } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api/client';

const STEPS = [
  { id: 1, title: 'Exit Details', icon: User },
  { id: 2, title: 'Asset Recovery', icon: Monitor },
  { id: 3, title: 'Knowledge Transfer', icon: Briefcase },
  { id: 4, title: 'Settlement', icon: FileText },
  { id: 5, title: 'Review', icon: CheckCircle2 }
];

// Backend API will provide this data. Defining interface for clean data handling.
interface OffboardingFormData {
  employeeId: string;
  resignationDate: string;
  lastWorkingDay: string;
  exitType: string;
  exitReason: string;
  assetsToReturn: string[];
  accessRevocationDate: string;
  ktAssignee: string;
  ktTargetDate: string;
  ktSignoffDate: string;
  ffExpectedDate: string;
  generateLetters: boolean;
  exitInterviewDate: string;
}

export default function NewOffboardingPage() {
  const router = useRouter();
  const role = useAuthStore((state) => state.role);
  const [currentStep, setCurrentStep] = useState(1);
  const [employees, setEmployees] = useState<any[]>([]);
  const [formData, setFormData] = useState<OffboardingFormData>({
    employeeId: '',
    resignationDate: '',
    lastWorkingDay: '',
    exitType: '',
    exitReason: '',
    assetsToReturn: [],
    accessRevocationDate: '',
    ktAssignee: '',
    ktTargetDate: '',
    ktSignoffDate: '',
    ffExpectedDate: '',
    generateLetters: true,
    exitInterviewDate: ''
  });

  const [isLoading, setIsLoading] = useState(false);
  const [assignedAssets, setAssignedAssets] = useState<any[]>([]);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await apiClient.get("/employees?limit=1000");
        if (response.data && Array.isArray(response.data.data)) {
          setEmployees(response.data.data.filter((e: any) => e.status !== "EXITED"));
        } else if (Array.isArray(response.data)) {
          setEmployees(response.data.filter((e: any) => e.status !== "EXITED"));
        }
      } catch (err) {
        console.error("Failed to fetch employees", err);
      }
    };
    fetchEmployees();
  }, []);

  useEffect(() => {
    if (!formData.employeeId) {
      setAssignedAssets([]);
      return;
    }
    const fetchEmployeeAssets = async () => {
      try {
        const response = await apiClient.get(`/employees/${formData.employeeId}`);
        if (response.data && Array.isArray(response.data.assetsHeld)) {
          setAssignedAssets(response.data.assetsHeld);
        } else {
          setAssignedAssets([]);
        }
      } catch (err) {
        console.error("Failed to fetch employee assets", err);
        setAssignedAssets([]);
      }
    };
    fetchEmployeeAssets();
  }, [formData.employeeId]);

  // Protect route: Only HR can access
  if (role !== "HR") {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-slate-50 text-slate-500">
        <AlertCircle className="w-10 h-10 text-rose-400 mb-3" />
        <h2 className="text-xl font-bold text-slate-800">Access Restricted</h2>
        <p className="mt-2 text-sm">Only HR personnel can view this page.</p>
      </div>
    );
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateStep = (stepToValidate: number): boolean => {
    if (stepToValidate === 1) {
      if (!formData.employeeId || !formData.resignationDate || !formData.lastWorkingDay || !formData.exitType) {
        toast.error('Please fill all required (*) fields in Step 1 to proceed.');
        return false;
      }
      if (new Date(formData.resignationDate) > new Date(formData.lastWorkingDay)) {
        toast.error('Resignation Date cannot be after Last Working Day.');
        return false;
      }
    } else if (stepToValidate === 2) {
      if (!formData.accessRevocationDate) {
        toast.error('Please fill all required (*) fields in Step 2 to proceed.');
        return false;
      }
    } else if (stepToValidate === 3) {
      if (!formData.ktAssignee || !formData.ktTargetDate || !formData.ktSignoffDate) {
        toast.error('Please fill all required (*) fields in Step 3 to proceed.');
        return false;
      }
      if (new Date(formData.ktTargetDate) > new Date(formData.ktSignoffDate)) {
        toast.error('Target KT Completion Date cannot be after Target Manager Sign-off Date.');
        return false;
      }
    } else if (stepToValidate === 4) {
      if (!formData.ffExpectedDate) {
        toast.error('Please fill all required (*) fields in Step 4 to proceed.');
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    setCurrentStep(prev => Math.min(prev + 1, 5));
  };

  const handleStepClick = (targetStep: number) => {
    // If going backwards, always allow it
    if (targetStep < currentStep) {
      setCurrentStep(targetStep);
      return;
    }
    
    // If going forwards, validate all steps in between
    for (let i = currentStep; i < targetStep; i++) {
      if (!validateStep(i)) {
        setCurrentStep(i); // Stop at the first invalid step
        return;
      }
    }
    
    setCurrentStep(targetStep);
  };
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const submitForm = async () => {
    setIsLoading(true);
    try {
      const payload = {
        employeeId: formData.employeeId,
        resignationDate: formData.resignationDate ? new Date(formData.resignationDate).toISOString() : undefined,
        lastWorkingDay: formData.lastWorkingDay ? new Date(formData.lastWorkingDay).toISOString() : undefined,
        exitType: formData.exitType,
        exitReason: formData.exitReason || undefined,
        accessRevocationDate: formData.accessRevocationDate ? new Date(formData.accessRevocationDate).toISOString() : undefined,
        ktAssigneeId: formData.ktAssignee || undefined,
        ktTargetDate: formData.ktTargetDate ? new Date(formData.ktTargetDate).toISOString() : undefined,
        ffExpectedDate: formData.ffExpectedDate ? new Date(formData.ffExpectedDate).toISOString() : undefined,
        generateLetters: formData.generateLetters,
        exitInterviewDate: formData.exitInterviewDate ? new Date(formData.exitInterviewDate).toISOString() : undefined,
      };

      await apiClient.post("/lifecycle/offboarding", payload);
      toast.success('Offboarding successfully initiated!');
      router.push('/offboarding');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to initiate offboarding. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3 text-slate-600">
          <Link href="/offboarding" className="hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold text-slate-900">
            Initiate Employee Offboarding
          </span>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
            Save as Draft
          </button>
        </div>
      </div>

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">

        {/* Left Sidebar (Stepper) */}
        <div className="w-64 border-r border-slate-200 bg-slate-50/50 p-6 hidden md:block">
          <h3 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6">Steps</h3>
          <div className="space-y-6">
            {STEPS.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              let circleClass = "bg-white border-2 border-slate-200 text-slate-400";
              if (isActive) circleClass = "bg-rose-700 border-2 border-rose-700 text-white";
              if (isCompleted) circleClass = "bg-rose-500 border-2 border-rose-500 text-white";

              return (
                <div key={step.id} className="flex flex-col relative">
                  {/* Connecting line */}
                  {step.id !== 5 && (
                    <div className={`absolute left-[15px] top-[30px] bottom-[-24px] w-0.5 ${isCompleted ? 'bg-rose-500' : 'bg-slate-200'}`}></div>
                  )}
                  <div className={`flex items-center gap-3 relative z-10 bg-slate-50/50 group ${isCompleted || isActive ? 'cursor-pointer' : 'cursor-pointer hover:opacity-80'}`} onClick={() => handleStepClick(step.id)}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-sm transition-colors ${circleClass}`}>
                      {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.id}
                    </div>
                    <div className={`text-sm font-semibold transition-colors ${isActive ? 'text-slate-900' : isCompleted ? 'text-slate-700' : 'text-slate-500 group-hover:text-slate-700'}`}>
                      {step.title}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8 pb-24">
          <div className="max-w-3xl">

            {/* Step 1: Exit Details */}
            {currentStep === 1 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-rose-700 px-6 py-4 flex items-center gap-3">
                  <User className="w-5 h-5 text-rose-200" />
                  <h2 className="text-lg font-bold text-white">Employee & Exit Details</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Employee *</label>
                    <select name="employeeId" value={formData.employeeId} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-700 focus:bg-white transition-colors text-slate-700">
                      <option value="">Search employee to offboard...</option>
                      {employees.map((emp) => {
                        const name = emp.preferredName || `${emp.firstName} ${emp.lastName}` || emp.personalEmail;
                        return (
                          <option key={emp.id} value={emp.id}>
                            {name} ({emp.personalEmail})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Resignation Date *</label>
                      <input type="date" name="resignationDate" value={formData.resignationDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-700 focus:bg-white transition-colors text-slate-700" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Working Day *</label>
                      <input type="date" name="lastWorkingDay" value={formData.lastWorkingDay} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-700 focus:bg-white transition-colors text-slate-700" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Exit Type *</label>
                      <select name="exitType" value={formData.exitType} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-700 focus:bg-white transition-colors text-slate-700">
                        <option value="">Select Exit Type</option>
                        <option value="Voluntary / Resignation">Voluntary / Resignation</option>
                        <option value="Involuntary / Termination">Involuntary / Termination</option>
                        <option value="End of Contract">End of Contract</option>
                        <option value="Retirement">Retirement</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Exit Reason</label>
                      <select name="exitReason" value={formData.exitReason} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-700 focus:bg-white transition-colors text-slate-700">
                        <option value="">Select Reason</option>
                        <option value="Career Growth / Better Opportunities">Career Growth / Better Opportunities</option>
                        <option value="Personal Reasons">Personal Reasons</option>
                        <option value="Relocation">Relocation</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Asset Recovery */}
            {currentStep === 2 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-rose-700 px-6 py-4 flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-rose-200" />
                  <h2 className="text-lg font-bold text-white">Asset Recovery & Access Revocation</h2>
                </div>
                <div className="p-6 space-y-6">

                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex gap-3 text-amber-800 text-sm mb-6">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p>Asset list below should be pre-populated by the backend API based on the employee's inventory records.</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 mb-3">Assigned Assets to Recover</h3>
                    {/* Rendered from backend list */}
                    <div className="border border-slate-200 rounded-lg divide-y divide-slate-100">
                      {assignedAssets.length === 0 ? (
                        <div className="p-4 text-sm text-slate-500 italic text-center">
                          {!formData.employeeId
                            ? "Please select an employee in Step 1 to see their assigned assets."
                            : "No assets currently assigned to this employee."}
                        </div>
                      ) : (
                        assignedAssets.map((asset) => (
                          <div key={asset.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center">
                                <Monitor className="w-4 h-4 text-slate-600" />
                              </div>
                              <div>
                                <h4 className="text-xs font-bold text-slate-800">{asset.name}</h4>
                                <p className="text-[10px] font-semibold text-slate-500">
                                  {asset.category} • S/N: {asset.serialNumber || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold rounded">
                              {asset.assetTag}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Date for IT Access Revocation *</label>
                    <input type="date" name="accessRevocationDate" value={formData.accessRevocationDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-700 focus:bg-white transition-colors text-slate-700" />
                  </div>

                </div>
              </div>
            )}

            {/* Step 3: Knowledge Transfer */}
            {currentStep === 3 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-rose-700 px-6 py-4 flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-rose-200" />
                  <h2 className="text-lg font-bold text-white">Knowledge Transfer (KT)</h2>
                </div>
                <div className="p-6 space-y-6">

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Assign KT To (Colleague / Manager) *</label>
                    <select name="ktAssignee" value={formData.ktAssignee} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-700 focus:bg-white transition-colors text-slate-700">
                      <option value="">Search employee...</option>
                      {employees.map((emp) => {
                        const name = emp.preferredName || `${emp.firstName} ${emp.lastName}` || emp.personalEmail;
                        return (
                          <option key={emp.id} value={emp.id}>
                            {name} ({emp.personalEmail})
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Target KT Completion Date *</label>
                      <input type="date" name="ktTargetDate" value={formData.ktTargetDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-700 focus:bg-white transition-colors text-slate-700" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Manager Sign-off Date *</label>
                      <input type="date" name="ktSignoffDate" value={formData.ktSignoffDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-700 focus:bg-white transition-colors text-slate-700" />
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Step 4: Settlement */}
            {currentStep === 4 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-rose-700 px-6 py-4 flex items-center gap-3">
                  <FileText className="w-5 h-5 text-rose-200" />
                  <h2 className="text-lg font-bold text-white">Final Settlement & Interview</h2>
                </div>
                <div className="p-6 space-y-6">

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Expected F&F Settlement Date *</label>
                      <input type="date" name="ffExpectedDate" value={formData.ffExpectedDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-700 focus:bg-white transition-colors text-slate-700" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Schedule Exit Interview Date (Optional)</label>
                      <input type="date" name="exitInterviewDate" value={formData.exitInterviewDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-rose-700 focus:bg-white transition-colors text-slate-700" />
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <input type="checkbox" name="generateLetters" checked={formData.generateLetters} onChange={handleInputChange} className="w-4 h-4 rounded text-rose-700 focus:ring-rose-700" />
                    <div>
                      <div className="text-sm font-bold text-slate-900">Automatically generate Experience & Relieving letters</div>
                      <div className="text-xs text-slate-500 mt-0.5">Documents will be generated upon F&F approval.</div>
                    </div>
                  </label>

                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-rose-700 px-6 py-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-rose-200" />
                  <h2 className="text-lg font-bold text-white">Review & Submit</h2>
                </div>
                <div className="p-6 space-y-6">

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">1. Exit Details</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-500 font-medium">Employee:</span> <span className="font-bold text-slate-900">{
                        (() => {
                          const emp = employees.find(e => e.id === formData.employeeId);
                          return emp ? (emp.preferredName || `${emp.firstName} ${emp.lastName}`) : (formData.employeeId || '—');
                        })()
                      }</span></div>
                      <div><span className="text-slate-500 font-medium">Exit Type:</span> <span className="font-bold text-slate-900">{formData.exitType || '—'}</span></div>
                      <div><span className="text-slate-500 font-medium">Last Day:</span> <span className="font-bold text-slate-900">{formData.lastWorkingDay || '—'}</span></div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">2. Workflow Scheduling</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-500 font-medium">IT Revocation:</span> <span className="font-bold text-slate-900">{formData.accessRevocationDate || '—'}</span></div>
                      <div><span className="text-slate-500 font-medium">KT Completion:</span> <span className="font-bold text-slate-900">{formData.ktTargetDate || '—'}</span></div>
                      <div><span className="text-slate-500 font-medium">F&F Settlement:</span> <span className="font-bold text-slate-900">{formData.ffExpectedDate || '—'}</span></div>
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="mt-8 flex items-center justify-between">
              {currentStep > 1 ? (
                <button onClick={prevStep} className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                  Back
                </button>
              ) : (
                <div></div>
              )}

              {currentStep < 5 ? (
                <button onClick={nextStep} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                  Continue to next step <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button onClick={submitForm} disabled={isLoading} className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-rose-700 rounded-lg hover:bg-rose-800 transition-colors shadow-sm disabled:opacity-50">
                  <CheckCircle2 className="w-4 h-4" /> {isLoading ? 'Processing...' : 'Initiate Offboarding'}
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
