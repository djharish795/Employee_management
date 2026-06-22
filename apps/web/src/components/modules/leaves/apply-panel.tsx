"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, FileText, CheckCircle2, ChevronRight, AlertTriangle, ArrowLeft } from "lucide-react";
import { LeaveRequest, LeaveBalance } from "@/types/leaves";

interface ApplyPanelProps {
  activeRole: "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
}

const BALANCES: LeaveBalance[] = [
  { type: "CASUAL_LEAVE", allocated: 12, used: 4, available: 8, pendingApproval: 0 },
  { type: "SICK_LEAVE", allocated: 10, used: 2, available: 8, pendingApproval: 1 },
  { type: "EARNED_LEAVE", allocated: 20, used: 5, available: 15, pendingApproval: 6 },
];

const CACHE_KEY = "naprocs_leave_requests";

export default function ApplyPanel({ activeRole }: ApplyPanelProps) {
  const queryClient = useQueryClient();
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);

  // Form Fields State
  const [leaveType, setLeaveType] = useState<"CASUAL_LEAVE" | "SICK_LEAVE" | "EARNED_LEAVE">("CASUAL_LEAVE");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [reason, setReason] = useState("");
  const [fileName, setFileName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [delegateName, setDelegateName] = useState("");

  const [dateError, setDateError] = useState("");

  const activeBalance = BALANCES.find((b) => b.type === leaveType);

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  };

  const leaveDays = calculateDays();

  // Validate date range parameters
  const validateStep1 = () => {
    setDateError("");
    if (!startDate || !endDate) {
      setDateError("Please enter both start and end dates.");
      return false;
    }
    const days = calculateDays();
    if (days <= 0) {
      setDateError("End date must be on or after the start date.");
      return false;
    }
    if (activeBalance && days > activeBalance.available) {
      setDateError(`Requested days (${days}) exceeds your available balance (${activeBalance.available} days).`);
      return false;
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && !validateStep1()) return;
    setStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setStep((prev) => prev - 1);
  };

  // Submit mutations to save in cache
  const fetchLeaveRequests = async (): Promise<LeaveRequest[]> => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(CACHE_KEY);
      if (saved) return JSON.parse(saved);
    }
    return [];
  };

  const { data: requests = [] } = useQuery<LeaveRequest[]>({
    queryKey: ["leaveRequests"],
    queryFn: fetchLeaveRequests,
  });

  const applyMutation = useMutation({
    mutationFn: async (newReq: LeaveRequest) => {
      const updated = [newReq, ...requests];
      if (typeof window !== "undefined") {
        localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
      }
      return updated;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["leaveRequests"], data);
      setSuccess(true);
    },
  });

  const handleSubmit = () => {
    const newRequest: LeaveRequest = {
      id: `L-${Math.floor(100 + Math.random() * 900)}`,
      type: leaveType,
      startDate: new Date(startDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      endDate: new Date(endDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      days: leaveDays,
      reason,
      status: "PENDING",
      attachmentName: fileName || undefined,
      emergencyContact: emergencyPhone,
      delegateName: delegateName || undefined,
      submittedDate: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }),
      employeeName: "Alex Thompson", // Mock user name
      department: "Engineering",
    };

    applyMutation.mutate(newRequest);
  };

  if (success) {
    return (
      <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm max-w-md mx-auto text-center space-y-4">
        <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-sm mx-auto">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 font-sans">Application Submitted</h3>
        <p className="text-xs text-slate-500 font-semibold leading-normal">
          Your leave request for {leaveDays} days has been successfully submitted and forwarded to your reporting manager (Alex Thompson) for review.
        </p>
        <button
          onClick={() => {
            setSuccess(false);
            setStep(1);
            setStartDate("");
            setEndDate("");
            setReason("");
            setEmergencyPhone("");
            setDelegateName("");
            setFileName("");
          }}
          className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer"
        >
          Apply for Another Leave
        </button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Form Wizard Card */}
      <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col gap-6">
        
        {/* Step Indicators */}
        <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
          <span className={step === 1 ? "text-slate-900 font-extrabold" : "text-emerald-600"}>1. Details</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={step === 2 ? "text-slate-900 font-extrabold" : step > 2 ? "text-emerald-600" : ""}>2. Continuity</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className={step === 3 ? "text-slate-900 font-extrabold" : ""}>3. Review</span>
        </div>

        {/* STEP 1: Details */}
        {step === 1 && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Leave Type</label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as any)}
                className="w-full h-10 px-3.5 border border-slate-200 rounded-lg bg-white text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              >
                <option value="CASUAL_LEAVE">Casual Leave</option>
                <option value="SICK_LEAVE">Sick Leave</option>
                <option value="EARNED_LEAVE">Earned Leave</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full h-10 px-3.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                />
              </div>
            </div>

            {dateError && (
              <div className="flex items-center gap-2 text-rose-600 bg-rose-50/50 border border-rose-100 p-3 rounded-lg text-[11px] leading-relaxed font-bold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                {dateError}
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Reason</label>
              <textarea
                rows={4}
                required
                placeholder="Details of your leave request..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-3.5 border border-slate-200 rounded-lg text-xs leading-normal focus:outline-none focus:ring-2 focus:ring-slate-900/20 resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Attach Document (Optional)</label>
              <input
                type="text"
                placeholder="e.g. medical_certificate.pdf"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                className="w-full h-10 px-3.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>

            <button
              onClick={handleNextStep}
              className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Continuity Details */}
        {step === 2 && (
          <div className="space-y-4 text-xs font-semibold text-slate-700">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Emergency Phone Number</label>
              <input
                type="text"
                required
                placeholder="e.g. +91 98765 43210"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                className="w-full h-10 px-3.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Delegate Tasks to Employee</label>
              <input
                type="text"
                placeholder="e.g. Arjun Mehta"
                value={delegateName}
                onChange={(e) => setDelegateName(e.target.value)}
                className="w-full h-10 px-3.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/20"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrevStep}
                className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                onClick={handleNextStep}
                className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                Review Application <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Review */}
        {step === 3 && (
          <div className="space-y-5 text-xs font-semibold text-slate-700">
            <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl space-y-3">
              <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide border-b border-slate-200 pb-1">
                Summary of Application
              </h4>
              <div className="grid grid-cols-2 gap-y-2.5 text-xs font-semibold">
                <span className="text-slate-400">Leave Category</span>
                <span className="text-slate-800 font-bold uppercase">{leaveType.replace("_", " ")}</span>
                <span className="text-slate-400">Duration</span>
                <span className="text-slate-800 font-bold">
                  {startDate} to {endDate} ({leaveDays} Days)
                </span>
                <span className="text-slate-400">Reason</span>
                <span className="text-slate-600 font-medium leading-relaxed">{reason}</span>
                <span className="text-slate-400">Emergency Phone</span>
                <span className="text-slate-800 font-mono font-bold">{emergencyPhone}</span>
                {delegateName && (
                  <>
                    <span className="text-slate-400">Delegate Tasks</span>
                    <span className="text-slate-800 font-bold">{delegateName}</span>
                  </>
                )}
              </div>
            </div>

            {/* Reporting Manager Warning Check */}
            <div className="p-4 bg-slate-100/50 border border-slate-300 rounded-xl">
              <h5 className="text-[10px] font-bold text-slate-950 uppercase tracking-wide">Reviewing Authority</h5>
              <p className="text-slate-500 font-semibold text-[11px] mt-1">
                This request will be forwarded to your manager <span className="text-slate-900 font-bold">Alex Thompson (CEO)</span> for sign-off.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handlePrevStep}
                className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-4 h-4" /> Edit
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                Submit Application <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Leave Entitlement Info Card (Right Side) */}
      <div className="space-y-6">
        <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
          <h4 className="text-xs font-bold text-slate-800 uppercase border-b border-slate-100 pb-2 tracking-wide">
            Remaining Balances
          </h4>
          <div className="space-y-3">
            {BALANCES.map((bal, index) => {
              const isActiveType = bal.type === leaveType;
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border transition-all ${
                    isActiveType ? "border-slate-700 bg-slate-100/10" : "border-slate-100 bg-slate-50/20"
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                    <span className="font-bold">{bal.type.replace("_", " ")}</span>
                    <span className="font-bold text-slate-900">{bal.available} / {bal.allocated} Days</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isActiveType ? "bg-slate-900" : "bg-slate-400"}`}
                      style={{ width: `${(bal.available / bal.allocated) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
