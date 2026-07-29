"use client";

import React, { useState } from "react";
import {
  User,
  Briefcase,
  CalendarDays,
  Plane,
  Monitor,
  FolderLock,
  ShieldAlert,
  History,
  Phone,
  Mail,
  MapPin,
  Clock,
  Download,
  Upload,
  PlusCircle,
  FileCheck,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { FullEmployeeProfile, DirectoryRole } from "@/types/employees";
import Image from "next/image";
import { usePermissions } from "@/hooks/use-permissions";

interface ProfileTabsProps {
  profile: FullEmployeeProfile;
}

export default function ProfileTabs({ profile }: ProfileTabsProps) {
  const { role, isExecutive } = usePermissions();
  const activeRole = role as DirectoryRole;
  const [activeTab, setActiveTab] = useState<string>("Overview");

  // Determine Tab Visibility based on Role Matrix
  const visibleTabs = React.useMemo(() => {
    const tabs = [
      { name: "Overview", icon: User },
      { name: "Employment", icon: Briefcase },
      { name: "Attendance", icon: CalendarDays },
      { name: "Leave History", icon: Plane },
      { name: "Assets", icon: Monitor },
      { name: "Documents", icon: FolderLock },
      { name: "Compliance", icon: ShieldAlert },
      { name: "Activity Timeline", icon: History },
    ];

    return tabs.filter((tab) => {
      // Executives and Managers cannot see personal Identity Documents tab for security / privacy boundaries
      if (tab.name === "Documents") {
        return !isExecutive && activeRole !== "MANAGER";
      }
      // Managers do not see compliance checks for non-direct reports, Finance doesn't see compliance
      if (tab.name === "Compliance") {
        return activeRole !== "MANAGER" && activeRole !== "FINANCE";
      }
      // Finance only sees overview, employment, assets, and documents
      if (activeRole === "FINANCE") {
        return ["Overview", "Employment", "Assets", "Documents"].includes(tab.name);
      }
      return true;
    });
  }, [activeRole]);

  // Adjust active tab if it becomes hidden due to role switcher
  React.useEffect(() => {
    if (!visibleTabs.some((t) => t.name === activeTab)) {
      setActiveTab(visibleTabs[0]?.name || "Overview");
    }
  }, [visibleTabs, activeTab]);

  return (
    <div className="flex flex-col gap-6 xl:flex-row items-start">
      {/* Dynamic Tab Sub-Navigation List */}
      <div className="w-full xl:w-64 bg-white border border-slate-200 rounded-2xl shadow-sm p-4 flex flex-row xl:flex-col gap-1 overflow-x-auto xl:overflow-x-visible scrollbar-hide flex-shrink-0">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.name;
          return (
            <button
              key={tab.name}
              onClick={() => setActiveTab(tab.name)}
              className={`flex items-center gap-3 px-4 py-3 text-xs font-bold rounded-xl whitespace-nowrap transition-all w-full ${
                isActive
                  ? "bg-slate-100 text-slate-900 font-extrabold shadow-sm"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-slate-900" : "text-slate-400"}`} />
              {tab.name}
            </button>
          );
        })}
      </div>

      {/* Tab Panels Container */}
      <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl shadow-sm p-6 min-h-[500px]">
        {activeTab === "Overview" && <OverviewTab profile={profile} />}
        {activeTab === "Employment" && <EmploymentTab profile={profile} />}
        {activeTab === "Attendance" && <AttendanceTab profile={profile} />}
        {activeTab === "Leave History" && <LeaveTab profile={profile} />}
        {activeTab === "Assets" && <AssetsTab profile={profile} />}
        {activeTab === "Documents" && <DocumentsTab profile={profile} />}
        {activeTab === "Compliance" && <ComplianceTab profile={profile} />}
        {activeTab === "Activity Timeline" && <TimelineTab profile={profile} />}
      </div>
    </div>
  );
}

/* ==========================================
   1. OVERVIEW TAB
   ========================================== */
function OverviewTab({ profile }: { profile: FullEmployeeProfile }) {
  const presentRecords = profile.attendanceRecords.filter((r) => r.status === "PRESENT").length;
  const attendanceRate = Math.round((presentRecords / profile.attendanceRecords.length) * 100) || 98;

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Profile Overview</h3>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</div>
          <div className="text-xl font-bold text-slate-800 mt-1">{attendanceRate}%</div>
          <div className="text-[10px] font-semibold text-emerald-600 mt-1">Excellent standing</div>
        </div>
        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Leave Balance</div>
          <div className="text-xl font-bold text-slate-800 mt-1">
            {profile.leaveBalances.reduce((acc, curr) => acc + curr.available, 0)} Days
          </div>
          <div className="text-[10px] font-semibold text-slate-400 mt-1">Across 3 categories</div>
        </div>
        <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-xl shadow-sm">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Assigned Assets</div>
          <div className="text-xl font-bold text-slate-800 mt-1">
            {profile.assignedAssets.filter((a) => a.status === "ACTIVE").length} Items
          </div>
          <div className="text-[10px] font-semibold text-slate-900 mt-1">IT-managed devices</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            Personal Information
          </h4>
          <div className="grid grid-cols-2 gap-y-3 gap-x-2 text-sm font-medium">
            <div className="text-slate-400 text-xs">Date of Birth</div>
            <div className="text-slate-800 font-bold">{profile.personalInfo.dateOfBirth}</div>
            <div className="text-slate-400 text-xs">Gender</div>
            <div className="text-slate-800 font-bold">{profile.personalInfo.gender}</div>
            <div className="text-slate-400 text-xs">Marital Status</div>
            <div className="text-slate-800 font-bold">{profile.personalInfo.maritalStatus}</div>
            <div className="text-slate-400 text-xs">Nationality</div>
            <div className="text-slate-800 font-bold">{profile.personalInfo.nationality}</div>
            <div className="text-slate-400 text-xs">Languages</div>
            <div className="text-slate-800 font-bold">{profile.personalInfo.primaryLanguage}</div>
          </div>
        </div>

        {/* Contact Details */}
        <div className="space-y-4">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-2 text-sm font-medium">
            <div className="flex items-center gap-2 text-slate-500">
              <Phone className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-400">Mobile</span>
            </div>
            <div className="text-slate-800 font-bold">{profile.contactInfo.mobile}</div>
            <div className="flex items-center gap-2 text-slate-500">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-400">Work Email</span>
            </div>
            <div className="text-slate-800 font-bold truncate">{profile.contactInfo.workEmail}</div>
            <div className="flex items-center gap-2 text-slate-500">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-400">Personal Email</span>
            </div>
            <div className="text-slate-800 font-bold truncate">{profile.contactInfo.personalEmail}</div>
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-400">Current Address</span>
            </div>
            <div className="text-slate-800 font-bold text-xs leading-normal">{profile.contactInfo.currentAddress}</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
        {/* Emergency Contact */}
        <div className="space-y-3 bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <h4 className="text-xs font-bold text-slate-800">Emergency Contact</h4>
          <div className="text-sm font-medium space-y-1.5">
            <div className="flex justify-between">
              <span className="text-slate-400 text-xs">Name</span>
              <span className="text-slate-800 font-bold">{profile.emergencyContact.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-xs">Relationship</span>
              <span className="text-slate-600 font-semibold">{profile.emergencyContact.relationship}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 text-xs">Phone</span>
              <span className="text-slate-800 font-mono font-bold">{profile.emergencyContact.phone}</span>
            </div>
          </div>
        </div>

        {/* Direct Reports */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Direct Reports</h4>
          {profile.directReports.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No direct reports assigned.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {profile.directReports.map((report) => (
                <div
                  key={report.id}
                  className="flex items-center gap-2.5 p-2 bg-slate-50 rounded-lg border border-slate-100"
                >
                  <div className="relative w-8 h-8 rounded-full border border-slate-200 shadow-sm overflow-hidden flex-shrink-0">
                    <Image src={report.photoUrl} alt={report.name} fill style={{ objectFit: "cover" }} />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-slate-900 truncate">{report.name}</div>
                    <div className="text-[10px] font-semibold text-slate-400 truncate mt-0.5">{report.designation}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   2. EMPLOYMENT TAB
   ========================================== */
function EmploymentTab({ profile }: { profile: FullEmployeeProfile }) {
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Employment Details</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Joining Date</div>
          <div className="text-sm font-bold text-slate-800 mt-1">{profile.joinedDate}</div>
        </div>
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Employment Type</div>
          <div className="text-sm font-bold text-slate-800 mt-1">Full-time Regular</div>
        </div>
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Department</div>
          <div className="text-sm font-bold text-slate-800 mt-1">{profile.department}</div>
        </div>
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Designation</div>
          <div className="text-sm font-bold text-slate-800 mt-1">{profile.designation}</div>
        </div>
      </div>

      {/* Reporting Hierarchy */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-1">
          Reporting Structure
        </h4>
        <div className="flex flex-col items-start gap-1 p-4 bg-slate-50 rounded-xl border border-slate-100">
          {profile.manager && (
            <>
              <div className="flex items-center gap-3 bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-sm w-full max-w-sm">
                <Image src={profile.manager.photoUrl} alt={profile.manager.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover" />
                <div>
                  <div className="text-xs font-bold text-slate-900">{profile.manager.name}</div>
                  <div className="text-[9px] font-semibold text-slate-400 mt-0.5">Manager • {profile.manager.id}</div>
                </div>
              </div>
              <div className="w-0.5 h-6 bg-slate-200 ml-6" />
            </>
          )}
          <div className="flex items-center gap-3 bg-slate-100/50 border border-slate-300/60 p-2.5 rounded-lg w-full max-w-sm shadow-sm ring-1 ring-slate-900/10">
            <Image src={profile.photoUrl} alt={profile.name} width={32} height={32} className="w-8 h-8 rounded-full border border-blue-300 object-cover" />
            <div>
              <div className="text-xs font-bold text-slate-950">{profile.name}</div>
              <div className="text-[9px] font-bold text-slate-700 uppercase tracking-wide mt-0.5">
                {profile.designation} (You)
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Career Milestones */}
      <div className="space-y-4">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Career & Promotion History</h4>
        <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6">
          {profile.careerMilestones.map((milestone, idx) => (
            <div key={idx} className="relative">
              {/* Bullet */}
              <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 bg-slate-900 rounded-full border-[3px] border-white ring-4 ring-blue-50 shadow-sm" />
              <div>
                <span className="text-[10px] font-bold text-slate-900 uppercase bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-md">
                  {milestone.date}
                </span>
                <h5 className="text-sm font-bold text-slate-900 mt-2">{milestone.event}</h5>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">
                  {milestone.designation} <span className="text-slate-300">•</span> {milestone.department}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-2 bg-slate-50 p-2 rounded-lg leading-normal max-w-2xl border border-slate-100">
                  {milestone.details}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   3. ATTENDANCE TAB
   ========================================== */
function AttendanceTab({ profile }: { profile: FullEmployeeProfile }) {
  const records = profile.attendanceRecords;
  const present = records.filter((r) => r.status === "PRESENT").length;
  const wfh = records.filter((r) => r.status === "WFH").length;
  const late = records.filter((r) => r.status === "LATE").length;
  const absent = records.filter((r) => r.status === "ABSENT").length;
  const rate = Math.round(((present + wfh + late) / records.length) * 100) || 100;

  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Attendance Records</h3>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{rate}%</div>
        </div>
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Late Arrivals</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{late} Days</div>
        </div>
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">WFH Sessions</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{wfh} Days</div>
        </div>
        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Days Logged</div>
          <div className="text-xl font-bold text-slate-900 mt-1">{records.length} Days</div>
        </div>
      </div>

      {/* Attendance Log Table */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent Logs</h4>
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Check-In</th>
                <th className="px-5 py-3">Check-Out</th>
                <th className="px-5 py-3">Duration</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Remarks</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-slate-700 divide-y divide-slate-100">
              {records.map((rec, idx) => {
                let badge = "text-slate-600 bg-slate-100";
                if (rec.status === "PRESENT") badge = "text-emerald-700 bg-emerald-50 border border-emerald-200/50";
                else if (rec.status === "LATE") badge = "text-amber-700 bg-amber-50 border border-amber-200/50";
                else if (rec.status === "WFH") badge = "text-slate-900 bg-slate-100 border border-slate-300/50";
                else if (rec.status === "ABSENT") badge = "text-rose-700 bg-rose-50 border border-rose-200/50";

                return (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-xs text-slate-900">{rec.date}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{rec.checkIn}</td>
                    <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{rec.checkOut}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold">{rec.duration}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wider rounded uppercase ${badge}`}>
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 font-medium">{rec.remarks}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   4. LEAVE TAB
   ========================================== */
function LeaveTab({ profile }: { profile: FullEmployeeProfile }) {
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Leaves & Balances</h3>

      {/* Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {profile.leaveBalances.map((balance, idx) => (
          <div key={idx} className="bg-slate-50/50 p-4 border border-slate-200/60 rounded-xl shadow-sm">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{balance.type}</div>
            <div className="text-xl font-bold text-slate-800 mt-1">{balance.available} Days</div>
            <div className="flex justify-between items-center text-[10px] font-semibold text-slate-500 mt-2">
              <span>Allocated: {balance.allocated}</span>
              <span>Used: {balance.used}</span>
            </div>
          </div>
        ))}
      </div>

      {/* History */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Leave Application History</h4>
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-5 py-3">Leave Type</th>
                <th className="px-5 py-3">Start Date</th>
                <th className="px-5 py-3">End Date</th>
                <th className="px-5 py-3">Days</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-slate-700 divide-y divide-slate-100">
              {profile.leaveRequests.map((req) => {
                let badge = "text-slate-600 bg-slate-100";
                if (req.status === "APPROVED") badge = "text-emerald-700 bg-emerald-50 border border-emerald-200/50";
                else if (req.status === "PENDING") badge = "text-amber-700 bg-amber-50 border border-amber-200/50";
                else if (req.status === "REJECTED") badge = "text-rose-700 bg-rose-50 border border-rose-200/50";

                return (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-xs text-slate-950">{req.type}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold">{req.startDate}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold">{req.endDate}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-900 font-bold">{req.days} Days</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wider rounded uppercase ${badge}`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   5. ASSETS TAB
   ========================================== */
function AssetsTab({ profile }: { profile: FullEmployeeProfile }) {
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Company Assets</h3>

      {/* Assigned List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assigned Equipment</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.assignedAssets.map((asset) => (
            <div key={asset.id} className="bg-slate-50/50 p-4 border border-slate-200 rounded-xl flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-900 flex items-center justify-center border border-slate-200/50 flex-shrink-0">
                <Monitor className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">{asset.category}</span>
                  <span className="px-2 py-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/50 rounded uppercase">
                    {asset.status}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-slate-900 mt-1 truncate">{asset.name}</h5>
                <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-3">
                  <span>Serial: <span className="font-mono text-[10px] font-bold bg-white px-1.5 py-0.5 rounded border">{asset.serialNo}</span></span>
                  <span>Assigned: {asset.assignedDate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Requests */}
      <div className="space-y-3 pt-4 border-t border-slate-100">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Asset Action Requests</h4>
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-5 py-3">Asset Required</th>
                <th className="px-5 py-3">Requested Date</th>
                <th className="px-5 py-3">Reason</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-slate-700 divide-y divide-slate-100">
              {profile.assetRequests.map((req) => {
                let badge = "text-slate-600 bg-slate-100";
                if (req.status === "APPROVED") badge = "text-emerald-700 bg-emerald-50 border border-emerald-200/50";
                else if (req.status === "PENDING") badge = "text-amber-700 bg-amber-50 border border-amber-200/50";
                else if (req.status === "REJECTED") badge = "text-rose-700 bg-rose-50 border border-rose-200/50";

                return (
                  <tr key={req.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-xs text-slate-950">{req.assetName}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-600 font-semibold">{req.requestedDate}</td>
                    <td className="px-5 py-3.5 text-xs text-slate-500 leading-normal font-semibold max-w-[200px] truncate">
                      {req.reason}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 text-[9px] font-bold tracking-wider rounded uppercase ${badge}`}>
                        {req.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   6. DOCUMENTS TAB (PII Boundary)
   ========================================== */
function DocumentsTab({ profile }: { profile: FullEmployeeProfile }) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-slate-100 pb-3">
        <div>
          <h3 className="text-base font-bold text-slate-900">Encrypted Document Vault</h3>
          <p className="text-xs text-slate-400 font-semibold mt-0.5">
            PII data is AES-256 encrypted at application layer.
          </p>
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 hover:text-slate-800 font-bold text-xs rounded-lg shadow-sm transition-all">
          <Upload className="w-3.5 h-3.5" />
          Upload Document
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profile.identityDocuments.map((doc) => (
          <div key={doc.id} className="bg-slate-50/50 p-4 border border-slate-200 rounded-xl flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-slate-100 text-slate-500 border border-slate-200/50 flex items-center justify-center flex-shrink-0">
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wide">{doc.type}</span>
                <h5 className="text-sm font-bold text-slate-900 mt-0.5">{doc.name}</h5>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs font-mono font-bold text-slate-600 bg-white px-2 py-0.5 border border-slate-100 rounded">
                    {doc.maskedValue}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                </div>
              </div>
            </div>
            <button className="p-2 hover:bg-slate-100 text-slate-400 hover:text-slate-700 rounded-lg transition-colors">
              <Download className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ==========================================
   7. COMPLIANCE TAB
   ========================================== */
function ComplianceTab({ profile }: { profile: FullEmployeeProfile }) {
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Compliance & Policy Records</h3>

      {/* Status Indicators */}
      <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0">
          <FileCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-emerald-950">DPDPA & Security Compliant</h4>
          <p className="text-xs text-emerald-600 font-semibold mt-0.5">
            Consent Log is ACTIVE. All key security policies are signed and acknowledged.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Signed Policies</h4>
        <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 text-[10px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-5 py-3">Policy Document</th>
                <th className="px-5 py-3">Signed Date</th>
                <th className="px-5 py-3">Consent Status</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-slate-700 divide-y divide-slate-100">
              {profile.complianceRecords.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-xs text-slate-950">{rec.policyName}</td>
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-600">{rec.acknowledgedAt}</td>
                  <td className="px-5 py-3.5">
                    <span className="px-2.5 py-0.5 text-[9px] font-bold tracking-wider rounded uppercase bg-emerald-50 border border-emerald-200/50 text-emerald-700">
                      {rec.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ==========================================
   8. ACTIVITY TIMELINE TAB
   ========================================== */
function TimelineTab({ profile }: { profile: FullEmployeeProfile }) {
  return (
    <div className="space-y-6">
      <h3 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Activity & Profile Timelines</h3>

      <div className="relative border-l-2 border-slate-100 ml-4 pl-6 space-y-6">
        {profile.timelineEvents.map((ev) => {
          let categoryColor = "bg-slate-100 text-slate-600";
          if (ev.category === "PROFILE") categoryColor = "bg-slate-100 text-slate-900 border border-slate-200";
          else if (ev.category === "ATTENDANCE") categoryColor = "bg-emerald-50 text-emerald-600 border border-emerald-100";
          else if (ev.category === "LEAVE") categoryColor = "bg-amber-50 text-amber-600 border border-amber-100";
          else if (ev.category === "ASSET") categoryColor = "bg-purple-50 text-purple-600 border border-purple-100";
          else if (ev.category === "PROMOTION") categoryColor = "bg-rose-50 text-rose-600 border border-rose-100";

          return (
            <div key={ev.id} className="relative">
              {/* Bullet */}
              <div className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 bg-slate-700 rounded-full border-[3px] border-white ring-4 ring-blue-50 shadow-sm" />
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400">{ev.timestamp}</span>
                  <span className={`px-2 py-0.5 text-[9px] font-bold rounded uppercase ${categoryColor}`}>
                    {ev.category}
                  </span>
                </div>
                <h5 className="text-sm font-bold text-slate-900 mt-2">{ev.title}</h5>
                <p className="text-xs font-medium text-slate-500 mt-0.5">{ev.description}</p>
                <div className="text-[10px] font-semibold text-slate-400 mt-2">
                  Operator: <span className="text-slate-600 font-bold">{ev.operator}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
