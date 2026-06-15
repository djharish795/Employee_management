"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, UserX, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { FullEmployeeProfile, DirectoryRole, Employee } from "@/types/employees";
import ProfileHeader from "@/components/modules/employees/profile/profile-header";
import ProfileTabs from "@/components/modules/employees/profile/profile-tabs";

const CACHE_KEY = "naprocs_directory_employees";

// Enrichment function to construct a Full Profile from basic Employee details
const enrichProfile = (emp: Employee): FullEmployeeProfile => {
  return {
    ...emp,
    personalInfo: {
      dateOfBirth: emp.id === "NAP-9821" ? "12 May 1990" : "28 Aug 1993",
      gender: emp.id === "NAP-9742" ? "Female" : "Male",
      maritalStatus: "Married",
      nationality: "Indian",
      primaryLanguage: "English, Hindi",
    },
    contactInfo: {
      mobile: "+91 98765 43210",
      workEmail: emp.email,
      personalEmail: `${emp.name.toLowerCase().replace(" ", ".")}@personal.com`,
      currentAddress: "12, Outer Ring Road, Bellandur, Bangalore, Karnataka, 560103",
    },
    emergencyContact: {
      name: "Rohan Mehta",
      relationship: "Spouse",
      phone: "+91 99887 76655",
    },
    directReports:
      emp.id === "NAP-9821"
        ? [
            {
              id: "NAP-9082",
              name: "Ravi Kumar",
              designation: "DevOps Engineer",
              photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Ravi",
            },
            {
              id: "NAP-9204",
              name: "Anita M.",
              designation: "Frontend Developer",
              photoUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Anita",
            },
          ]
        : [],
    careerMilestones: [
      {
        date: "01 Jan 2024",
        event: "Performance Promotion",
        department: emp.department,
        designation: emp.designation,
        details: "Promoted due to exceptional delivery on Core Architecture migration project.",
      },
      {
        date: emp.joinedDate,
        event: "Joined Organization",
        department: emp.department,
        designation: "Associate Member of Technical Staff",
        details: "Completed onboarding checks and security induction.",
      },
    ],
    attendanceRecords: [
      {
        date: "15 Jun 2026",
        checkIn: "08:52 AM",
        checkOut: "06:05 PM",
        duration: "9h 13m",
        status: "PRESENT",
        remarks: "Checked in via office network.",
      },
      {
        date: "14 Jun 2026",
        checkIn: "09:15 AM",
        checkOut: "06:00 PM",
        duration: "8h 45m",
        status: "LATE",
        remarks: "Heavy traffic delay.",
      },
      {
        date: "13 Jun 2026",
        checkIn: "09:00 AM",
        checkOut: "05:45 PM",
        duration: "8h 45m",
        status: "WFH",
        remarks: "Approved remote session.",
      },
    ],
    leaveBalances: [
      { type: "SICK LEAVE", allocated: 12, used: 2, available: 10 },
      { type: "CASUAL LEAVE", allocated: 15, used: 3, available: 12 },
      { type: "ANNUAL LEAVE", allocated: 20, used: 5, available: 15 },
    ],
    leaveRequests: [
      {
        id: "L-1021",
        type: "ANNUAL LEAVE",
        startDate: "24 Dec 2025",
        endDate: "30 Dec 2025",
        days: 5,
        status: "APPROVED",
      },
      {
        id: "L-1082",
        type: "SICK LEAVE",
        startDate: "10 Oct 2025",
        endDate: "11 Oct 2025",
        days: 1,
        status: "APPROVED",
      },
    ],
    assignedAssets: [
      {
        id: "AST-8201",
        name: "MacBook Pro 16\" (M3 Max, 64GB RAM, 1TB SSD)",
        category: "LAPTOP",
        serialNo: "C02XYZ123ABC",
        assignedDate: emp.joinedDate,
        status: "ACTIVE",
      },
      {
        id: "AST-8402",
        name: "Dell UltraSharp 32\" 4K USB-C Monitor",
        category: "MONITOR",
        serialNo: "CN-084W2M-744",
        assignedDate: "15 Jan 2024",
        status: "ACTIVE",
      },
    ],
    assetRequests: [
      {
        id: "REQ-401",
        assetName: "Apple Magic Keyboard + Mouse",
        requestedDate: "10 Mar 2024",
        reason: "Requesting ergonomics setup upgrades.",
        status: "APPROVED",
      },
    ],
    identityDocuments: [
      {
        id: "DOC-901",
        name: "Aadhaar Card (UIDAI)",
        type: "AADHAAR",
        maskedValue: "•••• •••• 9812",
        verifiedAt: "15 May 2021",
        status: "VERIFIED",
      },
      {
        id: "DOC-902",
        name: "Permanent Account Number (PAN)",
        type: "PAN",
        maskedValue: "••••• 4021 F",
        verifiedAt: "15 May 2021",
        status: "VERIFIED",
      },
    ],
    complianceRecords: [
      {
        id: "CMP-01",
        policyName: "Digital Personal Data Protection Act (DPDPA) Consent Log",
        acknowledgedAt: "12 May 2021 09:30 AM",
        status: "COMPLIANT",
      },
      {
        id: "CMP-02",
        policyName: "Enterprise Information Security Policy v2.4",
        acknowledgedAt: "12 May 2021 10:15 AM",
        status: "COMPLIANT",
      },
    ],
    timelineEvents: [
      {
        id: "EVT-801",
        timestamp: "15 Jun 2026 08:52 AM",
        category: "ATTENDANCE",
        title: "Checked In (Office Network)",
        description: "Registered check-in event using office gateway.",
        operator: "System Agent",
      },
      {
        id: "EVT-802",
        timestamp: "01 Jan 2024 10:00 AM",
        category: "PROMOTION",
        title: "Promoted to Staff Software Engineer",
        description: "Promoted from Senior Software Engineer.",
        operator: "HR Administrator (HR-003)",
      },
      {
        id: "EVT-803",
        timestamp: "15 Jan 2024 02:30 PM",
        category: "ASSET",
        title: "Asset Issued: Dell UltraSharp Monitor",
        description: "Monitor issued and recorded by IT department.",
        operator: "IT Helpdesk",
      },
    ],
  };
};

export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // Staging Active Role Switcher to support CEO, HR, Manager, Admin configs
  const [activeRole, setActiveRole] = useState<DirectoryRole>("ADMIN");

  // React Query Fetch Details matching route ID parameter
  const { data: profile, isLoading, error } = useQuery<FullEmployeeProfile>({
    queryKey: ["employeeProfile", id],
    queryFn: async () => {
      // Fetch list from localstorage to find matched user details
      let list: Employee[] = [];
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem(CACHE_KEY);
        if (saved) list = JSON.parse(saved);
      }

      const found = list.find((emp) => emp.id === id);
      if (!found) {
        throw new Error("Employee Profile not found in directory.");
      }

      // Simulate network request delay
      await new Promise((resolve) => setTimeout(resolve, 800));

      return enrichProfile(found);
    },
    retry: false,
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="p-8 max-w-[1400px] mx-auto w-full flex-1 flex flex-col gap-6">
        {/* Back Link */}
        <div>
          <Link
            href="/employees"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Directory
          </Link>
        </div>

        {/* Loading Skeletons */}
        {isLoading && (
          <div className="space-y-6 animate-pulse">
            {/* Header Skeleton */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 h-36" />
            {/* Body Tabs Skeleton */}
            <div className="flex flex-col xl:flex-row gap-6 items-start">
              <div className="w-full xl:w-64 bg-white border border-slate-200 rounded-2xl h-60" />
              <div className="flex-1 w-full bg-white border border-slate-200 rounded-2xl h-[500px]" />
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center border border-rose-100 shadow-sm mb-4">
              <UserX className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Profile Not Found</h3>
            <p className="text-sm font-semibold text-slate-500 mt-1.5 leading-normal">
              We couldn't retrieve profile details for ID <span className="font-mono text-rose-600 bg-rose-50/50 px-1.5 py-0.5 rounded font-bold">{id}</span>.
            </p>
            <button
              onClick={() => router.push("/employees")}
              className="mt-6 inline-flex items-center justify-center h-10 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-colors"
            >
              Return to Employees
            </button>
          </div>
        )}

        {/* Profile Content */}
        {!isLoading && profile && (
          <>
            <ProfileHeader
              profile={profile}
              activeRole={activeRole}
              onRoleChange={(role) => setActiveRole(role)}
            />
            <ProfileTabs profile={profile} activeRole={activeRole} />
          </>
        )}
      </div>
    </div>
  );
}
