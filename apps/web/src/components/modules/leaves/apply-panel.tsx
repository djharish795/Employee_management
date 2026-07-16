"use client";
import { usePermissions } from "@/hooks/use-permissions";


import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, CheckCircle2, ChevronRight, AlertTriangle, ArrowLeft, Loader2, Home, FileText } from "lucide-react";
import { applyLeave, fetchMyLeaveKpi, ApiLeaveKpi } from "@/lib/api/leaves";
import { applyWfh, fetchMyWfh, ApiWfhRequest } from "@/lib/api/wfh";
import { useAuthStore } from "@/store/auth";
import { useSearchParams } from "next/navigation";

interface ApplyPanelProps {
  activeRole: "ADMIN" | "HR" | "CEO" | "MANAGER" | "EMPLOYEE";
}

type ActiveTab = "leave" | "wfh";

export default function ApplyPanel() {
  const { role } = usePermissions();
  const activeRole = role as any;
  const queryClient = useQueryClient();
  const { employeeId } = useAuthStore();
  const searchParams = useSearchParams();

  // Tab state — can be driven by ?tab=wfh query param
  const [activeTab, setActiveTab] = useState<ActiveTab>(
    searchParams?.get("tab") === "wfh" ? "wfh" : "leave"
  );

  // ── Leave Form State ────────────────────────────────────────────────────
  const [leaveStep, setLeaveStep] = useState(1);
  const [leaveSuccess, setLeaveSuccess] = useState(false);
  const [leaveTypeCode, setLeaveTypeCode] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [leaveReason, setLeaveReason] = useState("");
  const [fileName, setFileName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [delegateName, setDelegateName] = useState("");
  const [dateError, setDateError] = useState("");
  const [leaveSubmitError, setLeaveSubmitError] = useState("");

  // ── WFH Form State ──────────────────────────────────────────────────────
  const [wfhDate, setWfhDate] = useState("");
  const [wfhReason, setWfhReason] = useState("");
  const [wfhSuccess, setWfhSuccess] = useState(false);
  const [wfhError, setWfhError] = useState("");

  // ── Fetch leave balances ────────────────────────────────────────────────
  const { data: kpiData, isLoading: isLoadingKpi } = useQuery<ApiLeaveKpi>({
    queryKey: ["leaves-kpi", employeeId],
    queryFn: () => fetchMyLeaveKpi(employeeId!),
    enabled: !!employeeId,
  });

  // ── Fetch WFH requests ──────────────────────────────────────────────────
  const { data: wfhHistory } = useQuery<ApiWfhRequest[]>({
    queryKey: ["wfh-my", employeeId],
    queryFn: () => fetchMyWfh(employeeId!),
    enabled: !!employeeId,
  });

  const balances = kpiData?.details || [];

  // Set default leave type once loaded
  useEffect(() => {
    if (balances.length > 0 && !leaveTypeCode) {
      // Default to CL_FULL, not CL_HALF
      const fullDay = balances.find(b => b.leaveType.code === "CL_FULL") ?? balances[0];
      setLeaveTypeCode(fullDay.leaveType.code);
    }
  }, [balances, leaveTypeCode]);

  const selectedBalance = balances.find((b) => b.leaveType.code === leaveTypeCode);
  const isHalfDayType = leaveTypeCode === "CL_HALF";

  // WFH eligibility check
  const now = new Date();
  const wfhThisMonth = (wfhHistory ?? []).filter(w => {
    const d = new Date(w.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
      && (w.status === "APPROVED" || w.status === "PENDING");
  });
  const wfhLimitReached = wfhThisMonth.length >= 1;

  const calculateDays = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = end.getTime() - start.getTime();
    if (diffTime < 0) return 0;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return isHalfDayType ? 0.5 : diffDays;
  };

  const leaveDays = calculateDays();

  const validateLeaveStep1 = () => {
    setDateError("");
    if (!startDate || !endDate) { setDateError("Please enter both start and end dates."); return false; }
    const days = calculateDays();
    if (days <= 0) { setDateError("End date must be on or after the start date."); return false; }
    if (isHalfDayType && startDate !== endDate) { setDateError("Half day leave must be a single date."); return false; }
    if (selectedBalance) {
      const available = Number(selectedBalance.allocated) + Number(selectedBalance.carriedOver) - Number(selectedBalance.used) - Number(selectedBalance.pending);
      if (days > available) { setDateError(`Requested ${days} days exceeds your balance (${available} available).`); return false; }
    }
    return true;
  };

  // ── Leave Apply Mutation ────────────────────────────────────────────────
  const leaveMutation = useMutation({
    mutationFn: async () => {
      if (!employeeId) throw new Error("No employee ID.");
      return applyLeave({
        employeeId,
        leaveTypeIds: [leaveTypeCode],
        startDate,
        endDate,
        reason: `${leaveReason}${emergencyPhone ? ` | Emergency: ${emergencyPhone}` : ""}${delegateName ? ` | Delegate: ${delegateName}` : ""}`,
        isHalfDay: isHalfDayType,
        halfDaySession: isHalfDayType ? "FIRST_DAY" : null
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["leaves-kpi", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["leaves-calendar"] });
      setLeaveSuccess(true);
      setLeaveSubmitError("");
    },
    onError: (err: any) => {
      setLeaveSubmitError(err?.response?.data?.message || err.message || "Failed to submit leave.");
    },
  });

  // ── WFH Apply Mutation ──────────────────────────────────────────────────
  const wfhMutation = useMutation({
    mutationFn: async () => {
      if (!employeeId) throw new Error("No employee ID.");
      if (!wfhDate) throw new Error("Please select a date.");
      if (!wfhReason.trim()) throw new Error("Please provide a reason.");
      return applyWfh({ employeeId, date: wfhDate, reason: wfhReason });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wfh-my", employeeId] });
      setWfhSuccess(true);
      setWfhError("");
    },
    onError: (err: any) => {
      setWfhError(err?.response?.data?.message || err.message || "Failed to submit WFH request.");
    },
  });

  const resetLeaveForm = () => {
    setLeaveSuccess(false); setLeaveStep(1); setStartDate(""); setEndDate("");
    setLeaveReason(""); setEmergencyPhone(""); setDelegateName(""); setFileName("");
  };
  const resetWfhForm = () => {
    setWfhSuccess(false); setWfhDate(""); setWfhReason("");
  };

  if (isLoadingKpi) {
    return (
      <div className="p-16 text-center text-slate-500 flex flex-col items-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
        <p className="text-sm font-bold">Loading your leave entitlements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* ── Tab Switcher ────────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab("leave")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === "leave" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
        >
          <FileText className="w-3.5 h-3.5" /> Apply Leave
        </button>
        <button
          onClick={() => setActiveTab("wfh")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-xs font-bold transition-all ${activeTab === "wfh" ? "bg-white text-sky-700 shadow-sm" : "text-slate-500 hover:text-slate-900"}`}
        >
          <Home className="w-3.5 h-3.5" /> Apply WFH
        </button>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* LEAVE TAB                                                       */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === "leave" && (
        leaveSuccess ? (
          <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm max-w-md mx-auto text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Application Submitted</h3>
            <p className="text-xs text-slate-500 font-semibold leading-normal">
              Your leave request for <strong>{leaveDays} days</strong> is submitted and forwarded to your manager for review.
            </p>
            <button onClick={resetLeaveForm} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer">
              Apply for Another Leave
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Form */}
            <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col gap-6">

              {/* Step Indicators */}
              <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3">
                <span className={leaveStep === 1 ? "text-slate-900 font-extrabold" : "text-emerald-600"}>1. Details</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className={leaveStep === 2 ? "text-slate-900 font-extrabold" : leaveStep > 2 ? "text-emerald-600" : ""}>2. Continuity</span>
                <ChevronRight className="w-3.5 h-3.5" />
                <span className={leaveStep === 3 ? "text-slate-900 font-extrabold" : ""}>3. Review</span>
              </div>

              {/* STEP 1 */}
              {leaveStep === 1 && (
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Leave Type</label>
                    <select
                      value={leaveTypeCode}
                      onChange={(e) => {
                        setLeaveTypeCode(e.target.value);
                        if (e.target.value === "CL_HALF" && startDate) setEndDate(startDate);
                      }}
                      className="w-full h-10 px-3.5 border border-slate-200 rounded-lg bg-white text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/20"
                    >
                      {balances.map(b => (
                        <option key={b.leaveType.code} value={b.leaveType.code}>{b.leaveType.name}</option>
                      ))}
                    </select>
                  </div>

                  {isHalfDayType && (
                    <div className="flex items-center gap-2 text-indigo-700 bg-indigo-50 border border-indigo-100 p-3 rounded-lg text-[11px] font-bold">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      Half day — start & end dates must be the same single day.
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Start Date</label>
                      <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); if (isHalfDayType) setEndDate(e.target.value); }}
                        className="w-full h-10 px-3.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/20" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                        End Date {isHalfDayType && <span className="text-indigo-500">(same as start)</span>}
                      </label>
                      <input type="date" value={endDate} disabled={isHalfDayType} onChange={(e) => setEndDate(e.target.value)}
                        className="w-full h-10 px-3.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/20 disabled:bg-slate-50 disabled:text-slate-400" />
                    </div>
                  </div>

                  {dateError && (
                    <div className="flex items-center gap-2 text-rose-600 bg-rose-50/50 border border-rose-100 p-3 rounded-lg text-[11px] font-bold">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {dateError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Reason</label>
                    <textarea rows={4} required placeholder="Details of your leave request..." value={leaveReason} onChange={(e) => setLeaveReason(e.target.value)}
                      className="w-full p-3.5 border border-slate-200 rounded-lg text-xs leading-normal focus:outline-none focus:ring-2 focus:ring-slate-900/20 resize-none" />
                  </div>

                  <button onClick={() => { if (validateLeaveStep1()) setLeaveStep(2); }}
                    className="w-full h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2 */}
              {leaveStep === 2 && (
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Emergency Phone Number</label>
                    <input type="text" placeholder="e.g. +91 98765 43210" value={emergencyPhone} onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full h-10 px-3.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/20" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Delegate Tasks To (Optional)</label>
                    <input type="text" placeholder="e.g. Arjun Mehta" value={delegateName} onChange={(e) => setDelegateName(e.target.value)}
                      className="w-full h-10 px-3.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900/20" />
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setLeaveStep(1)} className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={() => setLeaveStep(3)} className="flex-1 h-10 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                      Review Application <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3 */}
              {leaveStep === 3 && (
                <div className="space-y-5 text-xs font-semibold text-slate-700">
                  <div className="bg-slate-50 border border-slate-200/50 p-4 rounded-xl space-y-3">
                    <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wide border-b border-slate-200 pb-1">Summary of Application</h4>
                    <div className="grid grid-cols-2 gap-y-2.5 text-xs font-semibold">
                      <span className="text-slate-400">Leave Type</span>
                      <span className="text-slate-800 font-bold">{selectedBalance?.leaveType.name}</span>
                      <span className="text-slate-400">Duration</span>
                      <span className="text-slate-800 font-bold">{startDate} → {endDate} ({leaveDays} {leaveDays === 0.5 ? "half day" : "days"})</span>
                      <span className="text-slate-400">Reason</span>
                      <span className="text-slate-600 font-medium leading-relaxed">{leaveReason}</span>
                      {emergencyPhone && <><span className="text-slate-400">Emergency</span><span className="text-slate-800 font-mono font-bold">{emergencyPhone}</span></>}
                      {delegateName && <><span className="text-slate-400">Delegate</span><span className="text-slate-800 font-bold">{delegateName}</span></>}
                    </div>
                  </div>

                  {leaveSubmitError && (
                    <div className="flex items-center gap-2 text-rose-600 bg-rose-50/50 border border-rose-100 p-3 rounded-lg text-[11px] font-bold">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {leaveSubmitError}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <button onClick={() => setLeaveStep(2)} disabled={leaveMutation.isPending}
                      className="flex-1 h-10 border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50">
                      <ArrowLeft className="w-4 h-4" /> Edit
                    </button>
                    <button onClick={() => leaveMutation.mutate()} disabled={leaveMutation.isPending}
                      className="flex-1 h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5 disabled:opacity-50">
                      {leaveMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Submit Application <Send className="w-3.5 h-3.5" /></>}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Balance Sidebar */}
            <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-4">
              <h4 className="text-xs font-bold text-slate-800 uppercase border-b border-slate-100 pb-2 tracking-wide">Remaining Balances</h4>
              <div className="space-y-3">
                {balances.map((bal) => {
                  const isActive = bal.leaveType.code === leaveTypeCode;
                  const available = Number(bal.allocated) + Number(bal.carriedOver) - Number(bal.used) - Number(bal.pending);
                  const allocated = Number(bal.allocated) + Number(bal.carriedOver);
                  return (
                    <div key={bal.leaveType.code} className={`p-3 rounded-lg border transition-all ${isActive ? "border-slate-700 bg-slate-50" : "border-slate-100 bg-slate-50/20"}`}>
                      <div className="flex justify-between items-center text-xs font-semibold text-slate-700">
                        <span className="font-bold">{bal.leaveType.name}</span>
                        <span className={`font-bold ${available <= 0 ? "text-rose-600" : "text-slate-900"}`}>{available} / {allocated}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                        <div className={`h-full rounded-full ${isActive ? "bg-slate-900" : "bg-slate-400"}`}
                          style={{ width: `${Math.max(0, allocated > 0 ? (available / allocated) * 100 : 0)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )
      )}

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* WFH TAB                                                         */}
      {/* ════════════════════════════════════════════════════════════════ */}
      {activeTab === "wfh" && (
        wfhSuccess ? (
          <div className="bg-white border border-slate-200 p-8 rounded-xl shadow-sm max-w-md mx-auto text-center space-y-4">
            <div className="w-12 h-12 bg-sky-50 text-sky-600 rounded-full flex items-center justify-center border border-sky-100 mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">WFH Request Submitted</h3>
            <p className="text-xs text-slate-500 font-semibold leading-normal">
              Your Work From Home request has been submitted and is awaiting manager approval.
            </p>
            <button onClick={resetWfhForm} className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-lg transition-colors shadow-sm cursor-pointer">
              Apply for Another WFH
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-2 bg-white border border-slate-200 p-6 rounded-xl shadow-sm space-y-5">

              <div className="flex items-center gap-2 p-3 bg-sky-50 border border-sky-100 rounded-lg text-xs font-bold text-sky-700">
                <Home className="w-4 h-4 flex-shrink-0" />
                Work From Home — 1 day allowed per calendar month per employee.
              </div>

              {wfhLimitReached ? (
                <div className="p-6 text-center space-y-2">
                  <div className="w-12 h-12 bg-rose-50 rounded-full flex items-center justify-center mx-auto border border-rose-100">
                    <AlertTriangle className="w-6 h-6 text-rose-500" />
                  </div>
                  <p className="text-sm font-bold text-slate-900">Monthly WFH Limit Reached</p>
                  <p className="text-xs text-slate-500">
                    You already have a WFH request ({wfhThisMonth.length > 0 && wfhThisMonth[0]?.status}) for this month.
                    You can apply again next month.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 text-xs font-semibold text-slate-700">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">WFH Date</label>
                    <input type="date" value={wfhDate} onChange={(e) => setWfhDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full h-10 px-3.5 border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20" />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Reason for WFH</label>
                    <textarea rows={4} placeholder="Why are you working from home today?" value={wfhReason} onChange={(e) => setWfhReason(e.target.value)}
                      className="w-full p-3.5 border border-slate-200 rounded-lg text-xs leading-normal focus:outline-none focus:ring-2 focus:ring-sky-500/20 resize-none" />
                  </div>

                  {wfhError && (
                    <div className="flex items-center gap-2 text-rose-600 bg-rose-50/50 border border-rose-100 p-3 rounded-lg text-[11px] font-bold">
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {wfhError}
                    </div>
                  )}

                  <button onClick={() => wfhMutation.mutate()} disabled={wfhMutation.isPending || !wfhDate || !wfhReason.trim()}
                    className="w-full h-10 bg-sky-600 hover:bg-sky-700 disabled:opacity-50 text-white font-bold text-xs rounded-lg shadow-sm transition-colors cursor-pointer flex items-center justify-center gap-1.5">
                    {wfhMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-3.5 h-3.5" /> Submit WFH Request</>}
                  </button>
                </div>
              )}
            </div>

            {/* WFH Sidebar */}
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase border-b border-slate-100 pb-2 tracking-wide">WFH Policy</h4>
                <div className="space-y-2 text-xs font-semibold text-slate-600">
                  <div className="flex justify-between"><span className="text-slate-400">Max per Month</span><span className="font-bold">1 Day</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Team Cap</span><span className="font-bold">3 per project</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Approval Needed</span><span className="font-bold text-amber-600">Yes (Manager + HR)</span></div>
                </div>
              </div>

              {(wfhHistory ?? []).length > 0 && (
                <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-sm space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase border-b border-slate-100 pb-2 tracking-wide">Recent WFH History</h4>
                  <div className="space-y-2">
                    {(wfhHistory ?? []).slice(0, 4).map(w => {
                      const badge = w.status === "APPROVED" ? "text-emerald-700 bg-emerald-50 border-emerald-100"
                        : w.status === "PENDING" ? "text-amber-700 bg-amber-50 border-amber-100"
                          : "text-rose-700 bg-rose-50 border-rose-100";
                      return (
                        <div key={w.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg">
                          <div>
                            <p className="text-xs font-bold text-slate-900">{new Date(w.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</p>
                            <p className="text-[10px] text-slate-400 truncate max-w-[120px]">{w.reason}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase border ${badge}`}>{w.status}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}
