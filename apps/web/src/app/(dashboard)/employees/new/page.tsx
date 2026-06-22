"use client";

import React from 'react';
import Link from 'next/link';
import { Camera, ChevronRight, ArrowRight } from 'lucide-react';

const steps = [
  { num: 1, title: 'Personal Info', active: true },
  { num: 2, title: 'Employment', active: false },
  { num: 3, title: 'Identity', active: false },
  { num: 4, title: 'Banking', active: false },
  { num: 5, title: 'Documents', active: false },
];

export default function AddEmployeePage() {
  return (
    <div className="min-h-full bg-slate-50 flex flex-col font-sans">
      
      {/* Stepper Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between relative">
            {/* Connecting Line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-100 -z-0" />
            
            {steps.map((step, idx) => (
              <div key={step.num} className="flex flex-col items-center gap-2 relative z-10 bg-white px-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors ${
                  step.active 
                    ? 'bg-[#0F172A] border-[#0F172A] text-white' 
                    : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {step.num}
                </div>
                <span className={`text-xs font-semibold ${step.active ? 'text-slate-900' : 'text-slate-400'}`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 p-8 pb-32 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white border border-slate-200 rounded-xl shadow-sm p-8">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight mb-8">
            Add new employee — Step 1 of 5: Personal information
          </h2>

          <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            
            {/* Left Column */}
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">First name*</label>
                <input type="text" placeholder="e.g. John" className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Middle name</label>
                <input type="text" placeholder="e.g. Quincy" className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Last name*</label>
                <input type="text" placeholder="e.g. Doe" className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Preferred name</label>
                <input type="text" placeholder="e.g. Johnny" className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Date of birth*</label>
                <input type="date" className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm text-slate-500 focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Gender*</label>
                <select className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all">
                  <option value="">Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Blood group</label>
                <select className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all">
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="O+">O+</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nationality</label>
                <input type="text" placeholder="e.g. American" className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Marital status</label>
                <select className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all">
                  <option value="">Select status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                </select>
              </div>

              {/* Profile Photo Uploader */}
              <div className="pt-4">
                <label className="text-sm font-semibold text-slate-700 block mb-3">Profile Photo</label>
                <div className="flex items-center gap-6">
                  <div className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-100 hover:border-slate-400 transition-colors">
                    <Camera className="w-6 h-6 mb-1" />
                    <span className="text-[10px] font-bold text-center leading-tight">Upload profile<br/>photo</span>
                  </div>
                  <div className="text-xs font-medium text-slate-500 leading-relaxed">
                    Max size 2MB. Format: JPG, PNG.<br/>
                    Recommended size: 400x400px
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Official email*</label>
                <input type="email" placeholder="john.doe@naprocs.com" className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Personal email</label>
                <input type="email" placeholder="john.doe@gmail.com" className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Phone*</label>
                <input type="tel" placeholder="+1 (555) 000-0000" className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Alternate phone</label>
                <input type="tel" placeholder="+1 (555) 000-0000" className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" />
              </div>
              
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Current address</label>
                <textarea placeholder="Enter current residence address" className="w-full h-[90px] p-3.5 rounded-lg border border-slate-200 text-sm resize-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" />
              </div>
              
              <div className="space-y-1.5 relative">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-sm font-semibold text-slate-700">Permanent address</label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input type="checkbox" className="w-3.5 h-3.5 rounded border-slate-300 text-slate-900 focus:ring-slate-900" />
                    <span className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">Same as current address</span>
                  </label>
                </div>
                <textarea placeholder="Enter permanent address" className="w-full h-[90px] p-3.5 rounded-lg border border-slate-200 text-sm resize-none focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Emergency contact name*</label>
                <input type="text" placeholder="Full name" className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Emergency contact phone*</label>
                  <input type="tel" placeholder="+1 (555) 000-0000" className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Relationship*</label>
                  <input type="text" placeholder="e.g. Spouse, Parent" className="w-full h-11 px-3.5 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-slate-900/20 focus:border-slate-700 outline-none transition-all" />
                </div>
              </div>
            </div>

          </form>
        </div>
      </div>

      {/* Fixed Bottom Action Bar */}
      <div className="fixed bottom-0 left-[260px] right-0 h-20 bg-white border-t border-slate-200 px-8 flex items-center justify-between z-20">
        <button className="text-sm font-bold text-slate-700 hover:text-slate-900 transition-colors">
          Save as draft
        </button>
        <div className="text-xs font-semibold text-slate-500 tracking-wide">
          Step 1 of 5 — Personal Information
        </div>
        <button className="flex items-center gap-2 h-11 px-6 bg-[#0F172A] hover:bg-slate-800 text-white rounded-lg text-sm font-bold shadow-sm transition-all active:scale-[0.98]">
          Continue to employment
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

    </div>
  );
}
