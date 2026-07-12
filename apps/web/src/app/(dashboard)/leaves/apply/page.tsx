"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, ChevronRight, AlertCircle, FileUp, Calendar as CalendarIcon } from "lucide-react";
import LeavesLayout from "@/components/modules/leaves/leaves-layout";
import { useAuthStore } from "@/store/auth";
import { applyLeave, calculateLeave, fetchMyLeaveKpi } from "@/lib/api/leaves";
import { useQuery } from "@tanstack/react-query";

export default function ApplyLeavePage() {
  const role = useAuthStore((state) => state.role) ?? "EMPLOYEE";
  const employeeId = useAuthStore((state) => state.employeeId);
  const activeRole = role.toUpperCase() as "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Form State
  const [leaveTypes, setLeaveTypes] = useState<string[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [halfDaySession, setHalfDaySession] = useState<string>("FIRST_DAY");

  // Fetch real KPI data for balances
  const { data: kpiData, isLoading: isKpiLoading } = useQuery({
    queryKey: ["leave-kpi", employeeId],
    queryFn: () => fetchMyLeaveKpi(employeeId!),
    enabled: !!employeeId,
  });

  // Calculation State
  const [isCalculating, setIsCalculating] = useState(false);
  const [calcResult, setCalcResult] = useState<{ totalDays: number; paidDays: number; unpaidDays: number; deductionAmount: number } | null>(null);

  const handleNext = async () => {
    setErrorMsg("");
    if (step === 2) {
      if (!employeeId) return;
      setIsCalculating(true);
      try {
        const result = await calculateLeave({
          employeeId,
          leaveTypeIds: leaveTypes,
          startDate,
          endDate,
          isHalfDay: leaveTypes.includes("CL_HALF"),
          halfDaySession: leaveTypes.includes("CL_HALF") ? halfDaySession : null,
          reason: ""
        });
        setCalcResult(result);
        setStep(3);
      } catch (err: any) {
        setErrorMsg(err.response?.data?.message || "Failed to calculate leave.");
      } finally {
        setIsCalculating(false);
      }
    } else {
      setStep((s) => Math.min(s + 1, 3));
    }
  };

  const handlePrev = () => {
    setErrorMsg("");
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId) return;
    setErrorMsg("");
    setIsSubmitting(true);
    try {
      await applyLeave({
        employeeId,
        leaveTypeIds: leaveTypes,
        startDate,
        endDate,
        reason,
        isHalfDay: leaveTypes.includes("CL_HALF"),
        halfDaySession: leaveTypes.includes("CL_HALF") ? halfDaySession : null
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || "Failed to apply for leave.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderPageContent = () => {
    if (isSuccess) {
      return (
        <div className="bg-white border border-slate-200 p-10 rounded-xl shadow-sm text-center max-w-lg mx-auto mt-10">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Request Submitted!</h2>
          <p className="text-slate-500 mb-8">
            Your request from {startDate} to {endDate} has been successfully sent to your manager for approval.
          </p>
          <Link href="/leaves" className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition-colors">
            Return to Leaves Dashboard
          </Link>
        </div>
      );
    }

    return (
      <div className="max-w-3xl mx-auto mt-6">
        {/* Back Link */}
        <Link href="/leaves" className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-900 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Header */}
          <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50/50">
            <h1 className="text-2xl font-bold text-slate-900">Apply for Leave</h1>
            <p className="text-sm text-slate-500 mt-1">Submit a new time-off request for manager approval.</p>
            
            {/* Stepper */}
            <div className="flex items-center mt-8 gap-2">
              {[1, 2, 3].map((i) => (
                <React.Fragment key={i}>
                  <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                    step >= i ? "bg-slate-900 text-white" : "bg-slate-200 text-slate-500"
                  }`}>
                    {i}
                  </div>
                  {i < 3 && (
                    <div className={`h-1 w-12 rounded-full ${step > i ? "bg-slate-900" : "bg-slate-200"}`} />
                  )}
                </React.Fragment>
              ))}
              <div className="ml-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                {step === 1 ? "Leave Type" : step === 2 ? "Dates & Details" : "Review & Submit"}
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6 md:p-8">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Select Leave Type</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { 
                      id: "CL_FULL", 
                      title: "Paid Leave (Full Day)", 
                      desc: "Regular paid leave with carry-forward.", 
                      bal: kpiData ? (() => {
                        const b = kpiData.details.find(d => d.leaveType.code === 'CL_FULL');
                        if (!b) return "0 Days Available";
                        const avail = Number(b.allocated) + Number(b.carriedOver) - Number(b.used) - Number(b.pending);
                        return `${avail} Days (Total: ${b.allocated}, Carry: ${b.carriedOver})`;
                      })() : "Loading..."
                    },
                    { 
                      id: "CL_HALF", 
                      title: "Half Day Leave", 
                      desc: "For half day absences.", 
                      bal: kpiData ? (() => {
                        const b = kpiData.details.find(d => d.leaveType.code === 'CL_HALF');
                        if (!b) return "0 Days Available";
                        const avail = Number(b.allocated) + Number(b.carriedOver) - Number(b.used) - Number(b.pending);
                        return `${avail} Days Available`;
                      })() : "Loading..."
                    },
                    { 
                      id: "OPTIONAL", 
                      title: "Optional Holiday", 
                      desc: "Festival holidays of your choice.", 
                      bal: kpiData ? (() => {
                        const b = kpiData.details.find(d => d.leaveType.code === 'OPTIONAL');
                        if (!b) return "0 Days Available";
                        const avail = Number(b.allocated) + Number(b.carriedOver) - Number(b.used) - Number(b.pending);
                        return `${avail} Days Available`;
                      })() : "Loading..."
                    },
                    { 
                      id: "WFH", 
                      title: "Work From Home", 
                      desc: "Remote work days.", 
                      bal: "Max 1 per Month" 
                    },
                    { 
                      id: "UNPAID", 
                      title: "Loss of Pay", 
                      desc: "When all other balances are exhausted.", 
                      bal: "Unlimited" 
                    },
                  ].map((type) => (
                    <label 
                      key={type.id} 
                      className={`relative flex flex-col p-5 border-2 rounded-xl cursor-pointer transition-all ${
                        leaveTypes.includes(type.id)
                          ? "border-slate-900 bg-slate-100/30" 
                          : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      } ${isKpiLoading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <input 
                        type="checkbox" 
                        name="leaveType" 
                        value={type.id} 
                        checked={leaveTypes.includes(type.id)} 
                        onChange={(e) => {
                          if (e.target.checked) {
                            setLeaveTypes(prev => [...prev, e.target.value]);
                          } else {
                            setLeaveTypes(prev => prev.filter(t => t !== e.target.value));
                          }
                        }} 
                        className="sr-only" 
                      />
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-bold text-slate-900">{type.title}</span>
                        {leaveTypes.includes(type.id) && <CheckCircle2 className="w-5 h-5 text-slate-900" />}
                      </div>
                      <span className="text-xs text-slate-500 mb-4">{type.desc}</span>
                      <span className="mt-auto text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded">
                        {type.bal}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Dates & Details</h3>
                
                {errorMsg && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                    {errorMsg}
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Start Date</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="date" 
                        value={startDate} 
                        onChange={(e) => setStartDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">End Date</label>
                    <div className="relative">
                      <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input 
                        type="date" 
                        value={endDate} 
                        onChange={(e) => setEndDate(e.target.value)}
                        min={startDate || new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {leaveTypes.includes("CL_HALF") && startDate !== endDate && startDate && endDate && (
                  <div className="flex flex-col gap-2 mb-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                    <label className="text-sm font-bold text-slate-900">Which date is the half day?</label>
                    <select
                      value={halfDaySession}
                      onChange={(e) => setHalfDaySession(e.target.value)}
                      className="w-full max-w-sm px-4 py-2 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                    >
                      <option value="FIRST_DAY">First Day ({startDate})</option>
                      <option value="LAST_DAY">Last Day ({endDate})</option>
                    </select>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Reason for Leave</label>
                  <textarea 
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={4} 
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none"
                    placeholder="Please provide a brief reason for your manager to review..."
                  />
                </div>

                {leaveTypes.includes("SICK_LEAVE") && (
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-lg flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-amber-800">Medical Certificate Required</p>
                      <p className="text-[11px] text-amber-700/80 mt-1 mb-3">
                        Sick leaves exceeding 2 consecutive days require a valid medical certificate per company policy.
                      </p>
                      <button className="flex items-center gap-2 text-xs font-bold text-amber-700 bg-white border border-amber-200 px-3 py-1.5 rounded-md hover:bg-amber-100 transition-colors">
                        <FileUp className="w-3.5 h-3.5" /> Upload Document
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-bold text-slate-900 mb-2">Review & Submit</h3>
                
                {errorMsg && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
                    {errorMsg}
                  </div>
                )}

                <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 space-y-4">
                  <div className="flex justify-between pb-4 border-b border-slate-200/60">
                    <span className="text-sm font-medium text-slate-500">Leave Types</span>
                    <span className="text-sm font-bold text-slate-900">{leaveTypes.join(", ").replace(/_/g, " ")}</span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-slate-200/60">
                    <span className="text-sm font-medium text-slate-500">Duration</span>
                    <span className="text-sm font-bold text-slate-900">{startDate} to {endDate} {leaveTypes.includes("CL_HALF") ? "(Includes Half Day)" : ""}</span>
                  </div>
                  <div className="flex justify-between pb-4 border-b border-slate-200/60">
                    <span className="text-sm font-medium text-slate-500">Total Days</span>
                    <span className="text-sm font-bold text-slate-900">{calcResult?.totalDays || 0} Days</span>
                  </div>
                  
                  {calcResult && (
                    <div className="grid grid-cols-2 gap-4 pb-4 border-b border-slate-200/60">
                      <div>
                         <span className="block text-xs font-medium text-emerald-600 mb-1">Paid Days</span>
                         <span className="text-sm font-bold text-slate-900">{calcResult.paidDays} Days</span>
                      </div>
                      <div>
                         <span className="block text-xs font-medium text-rose-600 mb-1">Unpaid Days</span>
                         <span className="text-sm font-bold text-slate-900">{calcResult.unpaidDays} Days</span>
                      </div>
                    </div>
                  )}

                  {calcResult && calcResult.deductionAmount > 0 && (
                    <div className="flex justify-between pb-4 border-b border-slate-200/60 bg-rose-50 p-3 rounded-lg border-rose-100">
                      <span className="text-sm font-bold text-rose-700">Estimated Deduction</span>
                      <span className="text-sm font-bold text-rose-700">₹{calcResult.deductionAmount.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 pt-2">
                    <span className="text-sm font-medium text-slate-500">Reason Provided</span>
                    <p className="text-sm font-medium text-slate-900 bg-white p-3 border border-slate-100 rounded-lg">
                      {reason || "No reason provided."}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
            <button 
              onClick={handlePrev} 
              disabled={step === 1 || isSubmitting}
              className={`px-5 py-2.5 text-sm font-bold rounded-lg transition-colors ${
                step === 1 ? "opacity-0 pointer-events-none" : "text-slate-600 hover:bg-slate-200"
              }`}
            >
              Back
            </button>
            
            {step < 3 ? (
              <button 
                onClick={handleNext} 
                disabled={isCalculating || (step === 1 && leaveTypes.length === 0) || (step === 2 && (!startDate || !endDate))}
                className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:hover:bg-slate-900 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
              >
                {isCalculating ? "Calculating..." : "Continue"} <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-70 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
              >
                {isSubmitting ? "Submitting..." : "Submit Request"}
                {!isSubmitting && <CheckCircle2 className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <LeavesLayout activeRole={activeRole}>
      {renderPageContent()}
    </LeavesLayout>
  );
}
