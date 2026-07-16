"use client";

import React from "react";
import { ShieldAlert, Fingerprint, Lock, AlertTriangle, AlertOctagon } from "lucide-react";
import { AuditRole } from "@/types/audit";

interface SecurityEventsPanelProps {
  activeRole: AuditRole;
}

const THREAT_FEED = [
  {
    id: "SEC-100",
    time: "2 mins ago",
    type: "MULTIPLE_FAILURES",
    title: "Brute Force Attempt Blocked",
    description: "15 failed login attempts for user 'admin@naprocs.com' from IP 192.168.1.45.",
    severity: "CRITICAL",
    ip: "192.168.1.45",
    location: "Unknown",
    status: "BLOCKED"
  },
  {
    id: "SEC-101",
    time: "1 hour ago",
    type: "UNUSUAL_LOCATION",
    title: "Impossible Travel Detected",
    description: "User 'sarah.q@naprocs.com' logged in from San Francisco and Singapore within 1 hour.",
    severity: "HIGH",
    ip: "112.198.2.1",
    location: "Singapore, SG",
    status: "INVESTIGATING"
  },
  {
    id: "SEC-102",
    time: "4 hours ago",
    type: "PRIVILEGE_ESCALATION",
    title: "Sensitive Permission Granted",
    description: "User 'tejesh@naprocs.com' granted 'Super Admin' to 'arjun.m@naprocs.com'.",
    severity: "MEDIUM",
    ip: "10.0.0.12",
    location: "Hyderabad, IN",
    status: "REVIEWED"
  },
  {
    id: "SEC-103",
    time: "1 day ago",
    type: "DATA_EXFILTRATION",
    title: "Large Data Export",
    description: "User 'sarah.q@naprocs.com' exported full employee directory (400+ records).",
    severity: "MEDIUM",
    ip: "76.104.22.1",
    location: "San Francisco, US",
    status: "REVIEWED"
  }
];

export default function SecurityEventsPanel({ activeRole }: SecurityEventsPanelProps) {
  // HR and CEO shouldn't be dealing with raw security events in this view, 
  // but if they navigate here somehow via URL, we show an access message.
  if (activeRole === "HR" || activeRole === "CEO") {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] bg-white border border-slate-200 rounded-xl shadow-sm">
        <Lock className="w-12 h-12 text-slate-300 mb-4" />
        <h2 className="text-lg font-bold text-slate-900">Restricted Security View</h2>
        <p className="text-sm font-medium text-slate-500 mt-2 max-w-md text-center">
          Raw security incident feeds are restricted to IT Administrators and Compliance Officers. Please view the dashboard for high-level summaries.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* ── Threat Overview ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-rose-900 border border-rose-800 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
          <AlertOctagon className="w-24 h-24 absolute -right-4 -bottom-4 text-rose-800/50" />
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-rose-300 uppercase tracking-wider mb-2">Critical Threats</h3>
            <div className="text-4xl font-black mb-1">1</div>
            <p className="text-xs font-medium text-rose-200">Require immediate intervention</p>
          </div>
        </div>
        
        <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl shadow-sm relative overflow-hidden">
          <AlertTriangle className="w-24 h-24 absolute -right-4 -bottom-4 text-amber-100/50" />
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-amber-700 uppercase tracking-wider mb-2">Anomalies Detected</h3>
            <div className="text-4xl font-black text-amber-900 mb-1">3</div>
            <p className="text-xs font-medium text-amber-700">Flagged for investigation</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl shadow-lg text-white relative overflow-hidden">
          <ShieldAlert className="w-24 h-24 absolute -right-4 -bottom-4 text-slate-800/50" />
          <div className="relative z-10">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">System Posture</h3>
            <div className="text-lg font-bold text-emerald-400 mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              ACTIVE MONITORING
            </div>
            <p className="text-xs font-medium text-slate-400 mt-3">All WAF rules and MFA policies enforced.</p>
          </div>
        </div>
      </div>

      {/* ── Threat Feed Grid ───────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Security Incident Feed</h2>
            <p className="text-xs font-medium text-slate-500 mt-0.5">Automated detection of anomalous or malicious activities.</p>
          </div>
          <button className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
            Acknowledge All
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {THREAT_FEED.map((incident) => (
            <div key={incident.id} className="p-6 hover:bg-slate-50/50 transition-colors flex flex-col md:flex-row gap-6 items-start">
              
              {/* Status/Severity Badge */}
              <div className="flex-shrink-0 w-32">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">{incident.time}</div>
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${
                  incident.severity === "CRITICAL" ? "bg-rose-100 text-rose-800 border-rose-200" :
                  incident.severity === "HIGH" ? "bg-amber-100 text-amber-800 border-amber-200" :
                  "bg-slate-100 text-slate-700 border-slate-200"
                }`}>
                  {incident.severity}
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-1">
                  {incident.title}
                  <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">
                    {incident.type}
                  </span>
                </h3>
                <p className="text-sm font-medium text-slate-600 leading-relaxed mb-4">
                  {incident.description}
                </p>

                {/* Metadata Row */}
                <div className="flex flex-wrap items-center gap-4 text-[11px] font-semibold text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Fingerprint className="w-3.5 h-3.5 text-slate-400" />
                    IP: <span className="text-slate-900 font-mono bg-slate-100 px-1 rounded">{incident.ip}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    Geo: <span className="text-slate-900">{incident.location}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    Status: <span className={`px-2 py-0.5 rounded-full border ${
                      incident.status === "BLOCKED" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                      incident.status === "INVESTIGATING" ? "bg-amber-50 text-amber-700 border-amber-200" :
                      "bg-slate-100 text-slate-700 border-slate-200"
                    }`}>{incident.status}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex flex-col gap-2 w-full md:w-auto mt-4 md:mt-0">
                <button className="w-full md:w-32 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors">
                  Investigate
                </button>
                <button className="w-full md:w-32 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-lg shadow-sm transition-colors">
                  Dismiss
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
