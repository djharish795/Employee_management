"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Edit3, Download, Monitor, FileSpreadsheet, ChevronDown, Check, Camera, FileText } from "lucide-react";
import { FullEmployeeProfile, DirectoryRole } from "@/types/employees";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from "@/components/ui/dropdown-menu";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ProfileHeaderProps {
  profile: FullEmployeeProfile;
  activeRole: DirectoryRole;
  onRoleChange: (role: DirectoryRole) => void;
}

export default function ProfileHeader({ profile, activeRole, onRoleChange }: ProfileHeaderProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [avatarHovered, setAvatarHovered] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Gating visibility based on roles
  const canEdit = activeRole === "ADMIN" || activeRole === "HR";
  const canAssignAssets = activeRole === "ADMIN" || activeRole === "HR";
  const canGenerateReport = activeRole === "ADMIN" || activeRole === "HR" || activeRole === "CEO" || activeRole === "FINANCE";

  // Handle photo file selection — shows local preview (actual upload will be wired by backend team)
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  // Navigate to the edit page for this employee
  const handleEditProfile = () => {
    router.push(`/employees/${profile.id}/edit`);
  };

  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      doc.setFontSize(18);
      doc.text("Employee Profile", 14, 22);

      doc.setFontSize(11);
      doc.setTextColor(100);
      doc.text(`Generated on ${new Date().toLocaleDateString()}`, 14, 30);

      autoTable(doc, {
        startY: 40,
        head: [['Field', 'Details']],
        body: [
          ['Name', profile.name || ''],
          ['Employee ID', profile.employeeId || profile.id || ''],
          ['Designation', profile.designation || ''],
          ['Department', profile.department || ''],
          ['Status', profile.status || ''],
          ['Location', profile.location || ''],
          ['Reporting Manager', profile.manager?.name || 'N/A'],
        ],
        theme: 'striped',
        headStyles: { fillColor: [15, 23, 42] },
      });

      doc.save(`${profile.name.replace(/\s+/g, '_')}_Profile.pdf`);
    } catch (error) {
      console.error("PDF generation failed:", error);
    }
  };

  const handleDownloadExcel = () => {
    try {
      const data = [
        {
          "Name": profile.name || '',
          "Employee ID": profile.employeeId || profile.id || '',
          "Designation": profile.designation || '',
          "Department": profile.department || '',
          "Status": profile.status || '',
          "Location": profile.location || '',
          "Reporting Manager": profile.manager?.name || 'N/A',
        }
      ];
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Profile");
      XLSX.writeFile(workbook, `${profile.name.replace(/\s+/g, '_')}_Profile.xlsx`);
    } catch (error) {
      console.error("Excel generation failed:", error);
    }
  };

  const displayPhotoUrl = previewUrl || profile.photoUrl;

  return (
    // NOTE: overflow-hidden removed — it clips the dropdown. The gradient bar is now rounded separately.
    <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 relative">
      {/* Premium Gradient Overlay — uses rounded corners independently */}
      <div className="absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl bg-gradient-to-r from-blue-500 via-teal-400 to-indigo-500" />

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        {/* Photo and Info */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 w-full xl:w-auto">
          {/* Avatar frame with camera overlay */}
          <div
            className="relative flex-shrink-0 cursor-pointer group"
            onMouseEnter={() => setAvatarHovered(true)}
            onMouseLeave={() => setAvatarHovered(false)}
            onClick={() => canEdit && photoInputRef.current?.click()}
            title={canEdit ? "Change profile photo" : undefined}
          >
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-2xl sm:text-3xl font-bold border-4 border-white shadow-md overflow-hidden ${profile.avatarBg}`}>
              {displayPhotoUrl ? (
                <img src={displayPhotoUrl} alt={profile.name} className="w-full h-full object-cover" />
              ) : (
                <span>{profile.initials}</span>
              )}
            </div>

            {/* Camera icon overlay — only visible if user can edit */}
            {canEdit && (
              <div className={`absolute inset-0 rounded-full flex items-center justify-center bg-black/40 transition-opacity duration-200 ${avatarHovered ? "opacity-100" : "opacity-0"}`}>
                <div className="flex flex-col items-center gap-0.5">
                  <Camera className="w-5 h-5 text-white" />
                  <span className="text-[9px] font-bold text-white tracking-wide">CHANGE</span>
                </div>
              </div>
            )}

            {/* Small camera badge in corner */}
            {canEdit && (
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-slate-900 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                <Camera className="w-3 h-3 text-white" />
              </div>
            )}

            {/* Hidden file input */}
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoChange}
            />
          </div>

          <div className="text-center sm:text-left min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-tight tracking-tight">{profile.name}</h2>
              <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md border border-slate-200/50">
                {profile.employeeId || profile.id}
              </span>
              <span className="px-2.5 py-0.5 text-[9px] font-bold tracking-wider rounded uppercase text-emerald-700 bg-emerald-50 border border-emerald-200/50">
                {profile.status}
              </span>
            </div>

            <p className="text-sm font-semibold text-slate-600 mt-1 truncate">
              {profile.designation} <span className="text-slate-300 mx-1.5">•</span> {profile.department}
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-slate-500 mt-2 font-semibold">
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

        {/* Actions Row */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full xl:w-auto">
          {/* Click-based Role Switcher Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              className="flex items-center justify-between gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg transition-all shadow-sm w-full"
            >
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-pulse" />
                Active View: <span className="text-slate-900 font-bold">{activeRole}</span>
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-slate-400 ml-1 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {isDropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-44 bg-white border border-slate-200 rounded-lg shadow-xl py-1 z-[100]">
                <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">Test Role View</div>
                {(["ADMIN", "HR", "CEO", "MANAGER", "EMPLOYEE", "FINANCE", "CTO"] as DirectoryRole[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => { onRoleChange(role); setIsDropdownOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium hover:bg-slate-50 flex items-center justify-between transition-colors ${
                      activeRole === role ? "text-slate-900 bg-slate-100/50 font-bold" : "text-slate-600"
                    }`}
                  >
                    {role}
                    {activeRole === role && <Check className="w-3.5 h-3.5 text-slate-900" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Action Buttons — wrap on small screens */}
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-colors whitespace-nowrap outline-none focus:ring-2 focus:ring-slate-200">
                  <Download className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>Download</span>
                  <ChevronDown className="w-3 h-3 text-slate-400 ml-0.5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white z-[100] border-slate-200 shadow-xl rounded-xl">
                <DropdownMenuItem onClick={handleDownloadPDF} className="cursor-pointer font-semibold text-xs py-2 hover:bg-slate-50 outline-none">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center text-red-600">
                      <FileText className="w-3 h-3" />
                    </div>
                    Download as PDF
                  </div>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleDownloadExcel} className="cursor-pointer font-semibold text-xs py-2 hover:bg-slate-50 outline-none">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                      <FileSpreadsheet className="w-3 h-3" />
                    </div>
                    Download as Excel
                  </div>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {canAssignAssets && (
              <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-colors whitespace-nowrap">
                <Monitor className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Assign Asset</span>
              </button>
            )}

            {canGenerateReport && (
              <button className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs shadow-sm transition-colors whitespace-nowrap">
                <FileSpreadsheet className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Report</span>
              </button>
            )}

            {canEdit && (
              <button
                onClick={handleEditProfile}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 h-9 px-4 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-sm transition-colors whitespace-nowrap"
              >
                <Edit3 className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Edit Profile</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
