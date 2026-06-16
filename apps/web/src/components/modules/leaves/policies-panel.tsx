"use client";

import React, { useState } from "react";
import { BookOpen, HelpCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { LeavePolicy } from "@/types/leaves";

const MOCK_POLICIES: LeavePolicy[] = [
  {
    type: "Casual Leave (CL)",
    description: "Intended for unexpected personal requirements or short vacations.",
    eligibility: "All regular full-time employees, credited monthly (1.0 day/month).",
    carryForwardDays: 0,
    allocations: 12,
  },
  {
    type: "Sick Leave (SL)",
    description: "Available for medical recovery, illnesses, and doctors appointments.",
    eligibility: "Available from joining date. Medical certificate required for >3 consecutive days.",
    carryForwardDays: 0,
    allocations: 10,
  },
  {
    type: "Earned Leave (EL)",
    description: "Paid annual vacation days accrued based on working days index.",
    eligibility: "Accrues dynamically. Up to 30 unused days can be accumulated overall.",
    carryForwardDays: 15,
    allocations: 20,
  },
  {
    type: "Maternity Leave",
    description: "Fully paid maternity absence for biological/adoptive mothers.",
    eligibility: "Female employees who worked >=80 days in the past 12 months. Up to 26 weeks allowed.",
    carryForwardDays: 0,
    allocations: 180,
  },
  {
    type: "Paternity Leave",
    description: "Paid absences for fathers following childbirth/adoption.",
    eligibility: "Male employees, up to 15 days to be taken within 6 months of delivery.",
    carryForwardDays: 0,
    allocations: 15,
  },
];

export default function PoliciesPanel() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-2">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          Enterprise Time-Off Rules
        </h3>
        <p className="text-xs text-slate-500 font-semibold leading-relaxed">
          Company leave cycles run from January 1st to December 31st. Select a policy card below to review eligibility, accrual rates, and carry-forward allocations.
        </p>
      </div>

      {/* Accordion / List grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_POLICIES.map((policy, idx) => {
          const isExpanded = expandedIndex === idx;

          return (
            <div
              key={idx}
              onClick={() => setExpandedIndex(isExpanded ? null : idx)}
              className={`bg-white border p-5 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer flex flex-col gap-3 relative overflow-hidden ${
                isExpanded ? "border-blue-500 ring-1 ring-blue-500/10" : "border-slate-200"
              }`}
            >
              {/* Top Banner decoration for highlight */}
              {isExpanded && <div className="absolute top-0 left-0 right-0 h-1 bg-blue-600" />}

              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wide">{policy.type}</h4>
                  <p className="text-[10px] font-semibold text-slate-400 mt-0.5">Allocated: {policy.allocations} Days / Year</p>
                </div>
                <BookOpen className={`w-4 h-4 transition-transform ${isExpanded ? "text-blue-500 scale-110" : "text-slate-300"}`} />
              </div>

              <p className="text-xs text-slate-600 font-semibold leading-relaxed">
                {policy.description}
              </p>

              {isExpanded && (
                <div className="border-t border-slate-100 pt-3 space-y-2 text-[11px] font-semibold text-slate-600 animate-in fade-in duration-200">
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Eligibility</span>
                      {policy.eligibility}
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Carry-Forward Limit</span>
                      Maximum {policy.carryForwardDays} days can be carried forward to next calendar year.
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
