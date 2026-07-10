"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, User, Briefcase, ShieldCheck, Monitor, CheckCircle2, ChevronRight, AlertCircle, Save, Loader2 } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { apiClient } from '@/lib/api/client';
import { useRouter } from 'next/navigation';

const STEPS = [
  { id: 1, title: 'Personal Info', icon: User },
  { id: 2, title: 'Employment', icon: Briefcase },
  { id: 3, title: 'Compliance', icon: ShieldCheck },
  { id: 4, title: 'IT & Assets', icon: Monitor },
  { id: 5, title: 'Review', icon: CheckCircle2 }
];

export default function NewOnboardingPage() {
  const role = useAuthStore((state) => state.role);
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', preferredName: '', email: '', phone: '', dob: '', gender: '',
    emergencyName: '', emergencyRelation: '', emergencyPhone: '',
    jobTitle: '', department: '', manager: '', location: '', joinDate: '', employmentType: 'Full-time',
    aadhaar: '', pan: '', bgvStatus: 'Pending', accountNo: '', ifsc: '',
    laptopType: 'MacBook Pro 14"', accessories: [] as string[], software: [] as string[]
  });

  React.useEffect(() => {
    const draftId = localStorage.getItem('onboarding_draft_id');
    if (draftId) {
      apiClient.get(`/employees/onboarding/draft/${draftId}`)
        .then(res => {
          if (res.data && Object.keys(res.data).length > 0) {
            setFormData(prev => ({ ...prev, ...res.data }));
          }
        })
        .catch(err => {
          console.error('Failed to fetch draft from server', err);
          // Fallback to local storage draft
          const localDraft = localStorage.getItem('onboarding_draft');
          if (localDraft) {
            try { setFormData(JSON.parse(localDraft)); } catch (e) {}
          }
        });
    } else {
      const draft = localStorage.getItem('onboarding_draft');
      if (draft) {
        try { setFormData(JSON.parse(draft)); } catch (e) {}
      }
    }
  }, []);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (group: 'accessories' | 'software', value: string) => {
    setFormData(prev => {
      const list = prev[group];
      if (list.includes(value)) {
        return { ...prev, [group]: list.filter(item => item !== value) };
      } else {
        return { ...prev, [group]: [...list, value] };
      }
    });
  };

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));

  const handleInitiateOnboarding = async () => {
    try {
      setIsSubmitting(true);
      await apiClient.post('/onboarding/initiate', formData);
      alert('Onboarding initiated successfully!');
      router.push('/onboarding');
    } catch (error: any) {
      console.error(error);
      const msg = error?.response?.data?.message || 'Failed to initiate onboarding';
      alert(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col h-full font-sans bg-slate-50 overflow-y-auto">
      
      {/* Header */}
      <div className="h-16 border-b border-slate-200 bg-white px-8 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-3 text-slate-600">
          <Link href="/onboarding" className="hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="font-semibold text-slate-900 bg-white">
            Initiate New Onboarding
          </span>
        </div>
        <div className="flex gap-3">
          <button 
            type="button" 
            onClick={async () => {
              try {
                const draftId = localStorage.getItem('onboarding_draft_id') || "";
                const res = await apiClient.post('/employees/onboarding/draft/step', {
                  draftId,
                  stepNumber: currentStep.toString(),
                  payload: formData
                });
                if (typeof window !== 'undefined') {
                  localStorage.setItem('onboarding_draft_id', res.data.draftId);
                }
                alert('Draft saved successfully to server!');
              } catch (err) {
                console.error(err);
                alert('Failed to save draft to server.');
                // Fallback to local storage
                if (typeof window !== 'undefined') {
                  localStorage.setItem('onboarding_draft', JSON.stringify(formData));
                }
              }
            }}
            className="px-4 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
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
              if (isActive) circleClass = "bg-slate-900 border-2 border-slate-900 text-white";
              if (isCompleted) circleClass = "bg-emerald-500 border-2 border-emerald-500 text-white";

              return (
                <div key={step.id} className="flex flex-col relative">
                  {/* Connecting line */}
                  {step.id !== 5 && (
                    <div className={`absolute left-[15px] top-[30px] bottom-[-24px] w-0.5 ${isCompleted ? 'bg-emerald-500' : 'bg-slate-200'}`}></div>
                  )}
                  <div className="flex items-center gap-3 relative z-10 bg-slate-50/50 group cursor-pointer" onClick={() => setCurrentStep(step.id)}>
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
            
            {/* Step 1: Personal Info */}
            {currentStep === 1 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
                  <User className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">Personal & Contact Information</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">First Name *</label>
                      <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors" placeholder="Legal First Name" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Last Name *</label>
                      <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors" placeholder="Legal Last Name" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Name (Optional)</label>
                    <input type="text" name="preferredName" value={formData.preferredName} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors" placeholder="e.g. John" />
                  </div>
                  
                  <hr className="border-slate-100" />
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Personal Email *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors" placeholder="name@example.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Mobile Number *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors" placeholder="+91 9876543210" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Date of Birth</label>
                      <input type="date" name="dob" value={formData.dob} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors text-slate-700" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Gender</label>
                      <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors text-slate-700">
                        <option value="">Select Gender</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                        <option value="Prefer not to say">Prefer not to say</option>
                      </select>
                    </div>
                  </div>
                  
                  <hr className="border-slate-100" />
                  
                  <h3 className="text-sm font-bold text-slate-900">Emergency Contact</h3>
                  <div className="grid grid-cols-3 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Name</label>
                      <input type="text" name="emergencyName" value={formData.emergencyName} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Relation</label>
                      <input type="text" name="emergencyRelation" value={formData.emergencyRelation} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Phone</label>
                      <input type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors" />
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Step 2: Employment */}
            {currentStep === 2 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
                  <Briefcase className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">Employment Details</h2>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Job Title / Designation *</label>
                      <input type="text" name="jobTitle" value={formData.jobTitle} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors" placeholder="e.g. Senior Software Engineer" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Department *</label>
                      <select name="department" value={formData.department} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors text-slate-700">
                        <option value="">Select Department</option>
                        <option value="Engineering">Engineering</option>
                        <option value="Product">Product</option>
                        <option value="Design">Design</option>
                        <option value="Sales">Sales</option>
                        <option value="HR">HR</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Reporting Manager</label>
                      <input type="text" name="manager" value={formData.manager} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors" placeholder="Search employee..." />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Work Location</label>
                      <select name="location" value={formData.location} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors text-slate-700">
                        <option value="">Select Location</option>
                        <option value="Guntur Office">Guntur Office</option>
                        <option value="Remote">Remote</option>
                      </select>
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Date of Joining *</label>
                      <input type="date" name="joinDate" value={formData.joinDate} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors text-slate-700" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Employment Type</label>
                      <select name="employmentType" value={formData.employmentType} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors text-slate-700">
                        <option value="Full-time">Full-time</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                        <option value="Intern">Intern</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Compliance */}
            {currentStep === 3 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">Compliance & Payroll</h2>
                </div>
                <div className="p-6 space-y-6">
                  
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-3 text-blue-800 text-sm mb-6">
                    <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                    <p>All sensitive information collected here (Aadhaar, PAN, Bank Details) will be encrypted at rest using AES-256-GCM according to our strict data privacy policies.</p>
                  </div>

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">National ID (Aadhaar Number)</label>
                      <input type="text" name="aadhaar" value={formData.aadhaar} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors tracking-widest font-mono" placeholder="XXXX-XXXX-XXXX" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Tax ID (PAN Number)</label>
                      <input type="text" name="pan" value={formData.pan} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors uppercase font-mono" placeholder="ABCDE1234F" />
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div className="grid grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Bank Account Number</label>
                      <input type="text" name="accountNo" value={formData.accountNo} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors font-mono" placeholder="Account Number" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Bank IFSC Code</label>
                      <input type="text" name="ifsc" value={formData.ifsc} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors uppercase font-mono" placeholder="IFSC Code" />
                    </div>
                  </div>

                  <hr className="border-slate-100" />

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Background Verification (BGV) Status</label>
                    <select name="bgvStatus" value={formData.bgvStatus} onChange={handleInputChange} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-slate-900 focus:bg-white transition-colors text-slate-700">
                      <option value="Not Initiated">Not Initiated</option>
                      <option value="Pending">Pending / In Progress</option>
                      <option value="Cleared">Cleared</option>
                      <option value="Flagged">Flagged</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: IT & Assets */}
            {currentStep === 4 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
                  <Monitor className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">IT & Asset Provisioning</h2>
                </div>
                <div className="p-6 space-y-8">
                  
                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">Primary Hardware</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { id: 'MacBook Pro 14"', desc: 'Apple M2 Pro, 16GB RAM, 512GB SSD' },
                        { id: 'MacBook Air 15"', desc: 'Apple M2, 16GB RAM, 512GB SSD' },
                        { id: 'Dell XPS 15', desc: 'Intel i7, 16GB RAM, 512GB SSD (Windows)' },
                        { id: 'ThinkPad T14', desc: 'AMD Ryzen 7, 16GB RAM, 512GB SSD (Windows)' },
                        { id: 'None', desc: 'Employee does not require a company laptop' }
                      ].map((laptop) => (
                        <label key={laptop.id} className={`border rounded-xl p-4 cursor-pointer transition-colors ${formData.laptopType === laptop.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200 hover:border-slate-300'}`}>
                          <div className="flex items-center gap-3 mb-1">
                            <input type="radio" name="laptopType" value={laptop.id} checked={formData.laptopType === laptop.id} onChange={handleInputChange} className="w-4 h-4 text-slate-900 focus:ring-slate-900" />
                            <span className="font-bold text-slate-900 text-sm">{laptop.id}</span>
                          </div>
                          <p className="text-xs text-slate-500 ml-7">{laptop.desc}</p>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">Additional Accessories (Optional)</label>
                    <div className="flex flex-wrap gap-3">
                      {['External Monitor (27")', 'External Monitor (32")', 'Magic Keyboard', 'Magic Mouse', 'Ergonomic Mouse', 'Headset', 'Laptop Stand'].map(item => (
                        <label key={item} className={`flex items-center gap-2 px-4 py-2 border rounded-full text-sm font-medium cursor-pointer transition-colors ${formData.accessories.includes(item) ? 'border-slate-900 bg-slate-900 text-white' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                          <input type="checkbox" className="hidden" checked={formData.accessories.includes(item)} onChange={() => handleCheckboxChange('accessories', item)} />
                          {item}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-3">Software Access Required</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['Google Workspace', 'Slack', 'GitHub', 'AWS', 'Figma', 'Jira / Confluence', 'Notion', 'Zoom'].map(item => (
                        <label key={item} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                          <input type="checkbox" className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-600" checked={formData.software.includes(item)} onChange={() => handleCheckboxChange('software', item)} />
                          <span className="text-sm font-semibold text-slate-700">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Step 5: Review */}
            {currentStep === 5 && (
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="bg-slate-900 px-6 py-4 flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-lg font-bold text-white">Review & Submit</h2>
                </div>
                <div className="p-6 space-y-6">
                  
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">1. Personal Info</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-500 font-medium">Name:</span> <span className="font-bold text-slate-900">{formData.firstName} {formData.lastName}</span></div>
                      <div><span className="text-slate-500 font-medium">Email:</span> <span className="font-bold text-slate-900">{formData.email || '—'}</span></div>
                      <div><span className="text-slate-500 font-medium">Phone:</span> <span className="font-bold text-slate-900">{formData.phone || '—'}</span></div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">2. Employment</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-500 font-medium">Title:</span> <span className="font-bold text-slate-900">{formData.jobTitle || '—'}</span></div>
                      <div><span className="text-slate-500 font-medium">Department:</span> <span className="font-bold text-slate-900">{formData.department || '—'}</span></div>
                      <div><span className="text-slate-500 font-medium">Joining:</span> <span className="font-bold text-slate-900">{formData.joinDate || '—'}</span></div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">3. Compliance</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><span className="text-slate-500 font-medium">Aadhaar:</span> <span className="font-bold text-slate-900">{formData.aadhaar ? 'Provided (Encrypted)' : '—'}</span></div>
                      <div><span className="text-slate-500 font-medium">PAN:</span> <span className="font-bold text-slate-900">{formData.pan ? 'Provided (Encrypted)' : '—'}</span></div>
                      <div><span className="text-slate-500 font-medium">BGV Status:</span> <span className="font-bold text-slate-900">{formData.bgvStatus}</span></div>
                    </div>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200 pb-2 mb-3">4. IT & Assets</h3>
                    <div className="grid grid-cols-1 gap-4 text-sm">
                      <div><span className="text-slate-500 font-medium">Hardware:</span> <span className="font-bold text-slate-900">{formData.laptopType}</span></div>
                      <div><span className="text-slate-500 font-medium">Accessories:</span> <span className="font-bold text-slate-900">{formData.accessories.join(', ') || 'None'}</span></div>
                      <div><span className="text-slate-500 font-medium">Software:</span> <span className="font-bold text-slate-900">{formData.software.join(', ') || 'None'}</span></div>
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
                <button 
                  onClick={handleInitiateOnboarding} 
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-2.5 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />} 
                  {isSubmitting ? 'Initiating...' : 'Initiate Onboarding'}
                </button>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
