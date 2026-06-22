"use client";

import React from "react";
import { Edit3, Download, Monitor, FileSpreadsheet, ChevronDown, Check, UserPlus } from "lucide-react";
import { FullEmployeeProfile, DirectoryRole } from "@/types/employees";

interface ProfileHeaderProps {
  profile: FullEmployeeProfile;
  activeRole: DirectoryRole;
  onRoleChange: (role: DirectoryRole) => void;
}

export default function ProfileHeader({ profile, activeRole, onRoleChange }: ProfileHeaderProps) {
  // Gating visibility based on roles
  const canEdit = activeRole === "ADMIN" || activeRole === "HR";
  const canAssignAssets = activeRole === "ADMIN" || activeRole === "HR";
  const canGenerateReport = activeRole === "ADMIN" || activeRole === "HR" || activeRole === "CEO" || activeRole === "FINANCE";

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative overflow-hidden">
      {/* Premium Gradient Overlay */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-teal-400 to-indigo-500" />
      
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        {/* Photo and Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Avatar frame */}
          <div className={`w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white shadow-md overflow-hidden flex-shrink-0 relative ${profile.avatarBg}`}>
            <img src={profile.photoUrl} alt={profile.name} className="w-full h-full object-cover" />
            <span className="absolute">{profile.initials}</span>
          </div>

          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-xl font-bold text-slate-900 leading-tight tracking-tight">{profile.name}</h2>
              <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                {profile.id}
              </span>
              <span className="px-2.5 py-0.5 text-[9px] font-bold tracking-wider rounded uppercase text-emerald-700 bg-emerald-50 border border-emerald-200/50">
                {profile.status}
              </span>
            </div>
            
            <p className="text-sm font-semibold text-slate-600 mt-1">
              {profile.designation} <span className="text-slate-300 mx-1.5">•</span> {profile.department}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-slate-500 mt-3 font-semibold">
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Location:</span>
                <span>{profile.location}</span>
              </div>
              {profile.manager && (
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">Reporting to:</span>
                  <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 border border-slate-100 rounded-md">
                    <img src={profile.manager.photoUrl} alt={profile.manager.name} className="w-4 h-4 rounded-full" />
                    <span className="text-slate-700 font-bold text-[11px]">{profile.manager.name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Staging Mode Switcher & Quick Actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto self-stretch xl:self-auto">
          {/* Active Config Selector Dropdown */}
          <div className="relative inline-block text-left group">
            <button className="flex items-center justify-between gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-all shadow-sm w-full">
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse" />
                Active View: <span className="text-slate-900 font-bold">{activeRole}</span>
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 ml-1" />
            </button>
            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 hidden group-hover:block z-50">
              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase border-b border-slate-100">Test Role View</div>
              {(["ADMIN", "HR", "CEO", "MANAGER", "EMPLOYEE", "FINANCE", "CTO"] as DirectoryRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => onRoleChange(role)}
                  className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-slate-50 flex items-center justify-between ${
                    activeRole === role ? "text-slate-900 bg-slate-100/50 font-bold" : "text-slate-600"
                  }`}
                >
                  {role}
                  {activeRole === role && <Check className="w-3.5 h-3.5 text-slate-900" />}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
            {/* Download Profile - Available to all */}
            <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-colors">
              <Download className="w-3.5 h-3.5" />
              Download Profile
            </button>

            {/* Assign Assets - Restricted */}
            {canAssignAssets && (
              <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-colors">
                <Monitor className="w-3.5 h-3.5" />
                Assign Asset
              </button>
            )}

            {/* Generate Report - Restricted */}
            {canGenerateReport && (
              <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-colors">
                <FileSpreadsheet className="w-3.5 h-3.5" />
                Report
              </button>
            )}

            {/* Edit Employee - Restricted */}
            {canEdit && (
              <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors">
                <Edit3 className="w-3.5 h-3.5" />
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
