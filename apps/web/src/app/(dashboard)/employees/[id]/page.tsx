"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, UserX, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import { FullEmployeeProfile, DirectoryRole, Employee } from "@/types/employees";
import ProfileHeader from "@/components/modules/employees/profile/profile-header";
import ProfileTabs from "@/components/modules/employees/profile/profile-tabs";

import { apiClient } from "@/lib/api/client";

const CACHE_KEY = "naprocs_directory_employees";
export default function EmployeeProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  // React Query Fetch Details matching route ID parameter
  const { data: profile, isLoading, error } = useQuery<FullEmployeeProfile>({
    queryKey: ["employeeProfile", id],
    enabled: Boolean(id && id !== "[id]"),
    staleTime: 5 * 60 * 1000, // 5 minutes cache — prevents 1-2s background refetch cache wipe
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    retry: false,
    queryFn: async () => {
      try {
        const res = await apiClient.get(`/employees/${id}`);
        // Helper to safely parse Prisma Decimal objects if they leak to the frontend
        const parseDecimal = (val: any) => {
          if (val === null || val === undefined) return 0;
          if (typeof val === 'number') return val;
          if (typeof val === 'string') return Number(val);
          // Prisma Decimal object structure { d: [1, 5], e: 0, s: 1 }
          if (typeof val === 'object' && val !== null && 'd' in val) {
            const strVal = val.d.join('');
            return val.s * Number(strVal) * Math.pow(10, val.e - strVal.length + 1);
          }
          return Number(val) || 0;
        };

        const empData = res.data?.data || res.data;

        if (!empData || (!empData.id && !empData.employeeId)) {
          throw new Error("Employee details payload is empty or invalid");
        }

        const formatDate = (val: any) => {
          if (!val) return "N/A";
          const d = new Date(val);
          return isNaN(d.getTime()) ? "N/A" : d.toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' });
        };

        const formatTime = (val: any) => {
          if (!val) return "--:--";
          const d = new Date(val);
          return isNaN(d.getTime()) ? "--:--" : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        };

        const emp: Employee = {
          id: empData.id || empData.employeeId,
          employeeId: empData.employeeId || empData.id,
          name: `${empData.firstName || ""} ${empData.lastName || ""}`.trim() || empData.officialEmail || "Employee",
          email: empData.officialEmail || empData.personalEmail || "N/A",
          photoUrl: empData.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${empData.firstName || 'User'}`,
          initials: `${empData.firstName?.[0] || ""}${empData.lastName?.[0] || ""}`.toUpperCase() || "EMP",
          avatarBg: "bg-blue-100 text-blue-600",
          department: empData.department?.name || empData.departmentId || "Unassigned",
          designation: empData.designation?.title || empData.designationId || "Unassigned",
          status: empData.status || "ACTIVE",
          joinedDate: formatDate(empData.createdAt),
          location: empData.workLocation || "India",
        };

        const fullProfile: FullEmployeeProfile = {
          ...emp,
          personalInfo: {
            dateOfBirth: formatDate(empData.dateOfBirth),
            gender: empData.gender || "Not specified",
            maritalStatus: empData.maritalStatus || "Not specified",
            nationality: empData.nationality || "Indian",
            primaryLanguage: "English", // Default fallback
          },
          contactInfo: {
            mobile: empData.phone || "Not provided",
            workEmail: empData.officialEmail || "Not provided",
            personalEmail: empData.personalEmail || "Not provided",
            currentAddress: empData.currentAddress ? (typeof empData.currentAddress === 'object' ? JSON.stringify(empData.currentAddress) : empData.currentAddress) : "Not specified",
          },
          emergencyContact: empData.emergencyContact ? (empData.emergencyContact as any) : {
            name: "Not specified",
            relationship: "N/A",
            phone: "N/A",
          },
          directReports: (empData.subordinates || []).map((sub: any) => ({
            id: sub.employeeId || sub.id,
            name: `${sub.firstName || ""} ${sub.lastName || ""}`.trim() || "Subordinate",
            designation: sub.designation?.title || "Unassigned",
            photoUrl: sub.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${sub.firstName || 'User'}`,
          })),
          careerMilestones: [
            {
              date: emp.joinedDate,
              event: "Joined Organization",
              department: emp.department,
              designation: emp.designation,
              details: "Started employment at Naprocs Technologies.",
            }
          ],
          attendanceRecords: (empData.attendanceRecords || []).map((att: any) => ({
            date: formatDate(att.date),
            checkIn: formatTime(att.checkInTime),
            checkOut: formatTime(att.checkOutTime),
            duration: att.workHours ? `${att.workHours}h` : "0h",
            status: att.status || "PRESENT",
            remarks: att.notes || "Recorded via system.",
          })),
          leaveBalances: (empData.leaveBalances || []).map((lb: any) => ({
            type: lb.leaveType?.name || "LEAVE",
            allocated: parseDecimal(lb.allocated),
            used: parseDecimal(lb.used),
            available: (parseDecimal(lb.allocated) + parseDecimal(lb.carriedOver)) - parseDecimal(lb.used) || 0,
          })),
          leaveRequests: (empData.leaveRequestsMade || []).map((lr: any) => ({
            id: lr.id,
            type: lr.leaveType?.name || "LEAVE",
            startDate: formatDate(lr.startDate),
            endDate: formatDate(lr.endDate),
            days: parseDecimal(lr.totalDays),
            status: lr.status || "PENDING",
          })),
          assignedAssets: (empData.assetsHeld || []).map((ast: any) => ({
            id: ast.assetTag || ast.id,
            name: ast.name || "Asset",
            category: ast.category || "PERIPHERAL",
            serialNo: ast.serialNumber || "N/A",
            assignedDate: "Assigned",
            status: ast.status || "ACTIVE",
          })),
          assetRequests: [],
          identityDocuments: [],
          complianceRecords: (empData.consentLogsAsSubject || []).map((log: any) => ({
            id: log.id,
            policyName: log.purpose || "Compliance Policy",
            acknowledgedAt: formatDate(log.consentedAt),
            status: "COMPLIANT",
          })),
          timelineEvents: [],
        };

        console.log("Full Profile successfully mapped:", fullProfile);
        return fullProfile;
      } catch (err) {
        console.error("Error fetching or mapping employee profile:", err);
        throw err;
      }
    },
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
        {isLoading && !profile && (
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
        {error && !profile && (
          <div className="py-20 flex flex-col items-center justify-center text-center max-w-md mx-auto">

            <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center border border-rose-100 shadow-sm mb-4">
              <UserX className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Profile Not Found</h3>
            <p className="text-sm font-semibold text-slate-500 mt-1.5 leading-normal">
              We couldn't retrieve profile details for ID <span className="font-mono text-rose-600 bg-rose-50/50 px-1.5 py-0.5 rounded font-bold">{id}</span>.
            </p>
            <p className="text-xs font-mono text-red-500 mt-4 bg-red-50 p-2 rounded w-full text-left overflow-auto">
              {error instanceof Error ? error.message : JSON.stringify(error)}
            </p>
            <button
              onClick={() => router.push("/employees")}
              className="mt-6 inline-flex items-center justify-center h-10 px-5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-sm transition-colors"
            >
              Return to Employees
            </button>
          </div>
        )}

        {/* Profile Content - Persistent once loaded */}
        {profile && (
          <>
            <ProfileHeader
              profile={profile}
            />
            <ProfileTabs profile={profile} />
          </>
        )}
      </div>
    </div>
  );
}
