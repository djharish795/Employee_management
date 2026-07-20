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
    queryFn: async () => {
      try {
        const { data: empData } = await apiClient.get(`/employees/${id}`);
        console.log("Fetched Employee Data:", empData);

        const emp: Employee = {
          id: empData.id,
          employeeId: empData.employeeId,
          name: `${empData.firstName || ""} ${empData.lastName || ""}`.trim(),
          email: empData.officialEmail,
          photoUrl: empData.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${empData.firstName}`,
          initials: `${empData.firstName?.[0] || ""}${empData.lastName?.[0] || ""}`.toUpperCase(),
          avatarBg: "bg-blue-100 text-blue-600",
          department: empData.department?.name || empData.departmentId || "Unassigned",
          designation: empData.designation?.title || empData.designationId || "Unassigned",
          status: empData.status || "ACTIVE",
          joinedDate: new Date(empData.createdAt).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
          location: empData.workLocation || "India",
        };

        const fullProfile: FullEmployeeProfile = {
          ...emp,
          personalInfo: {
            dateOfBirth: empData.dateOfBirth ? new Date(empData.dateOfBirth).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }) : "Not specified",
            gender: empData.gender || "Not specified",
            maritalStatus: empData.maritalStatus || "Not specified",
            nationality: empData.nationality || "Indian",
            primaryLanguage: "English", // Default fallback
          },
          contactInfo: {
            mobile: empData.phone || "Not provided",
            workEmail: empData.officialEmail,
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
            name: `${sub.firstName} ${sub.lastName}`.trim(),
            designation: sub.designation?.title || "Unassigned",
            photoUrl: sub.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${sub.firstName}`,
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
            date: new Date(att.date).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
            checkIn: att.checkInTime ? new Date(att.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--",
            checkOut: att.checkOutTime ? new Date(att.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--",
            duration: att.workHours ? `${att.workHours}h` : "0h",
            status: att.status || "PRESENT",
            remarks: att.notes || "Recorded via system.",
          })),
          leaveBalances: (empData.leaveBalances || []).map((lb: any) => ({
            type: lb.leaveType?.name || "LEAVE",
            allocated: Number(lb.allocated) || 0,
            used: Number(lb.used) || 0,
            available: (Number(lb.allocated) + Number(lb.carriedOver)) - Number(lb.used) || 0,
          })),
          leaveRequests: (empData.leaveRequestsMade || []).map((lr: any) => ({
            id: lr.id,
            type: lr.leaveType?.name || "LEAVE",
            startDate: new Date(lr.startDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
            endDate: new Date(lr.endDate).toLocaleDateString("en-GB", { day: '2-digit', month: 'short', year: 'numeric' }),
            days: Number(lr.totalDays) || 0,
            status: lr.status || "PENDING",
          })),
          assignedAssets: (empData.assetsHeld || []).map((ast: any) => ({
            id: ast.assetTag,
            name: ast.name,
            category: ast.category || "PERIPHERAL",
            serialNo: ast.serialNumber || "N/A",
            assignedDate: "Assigned",
            status: ast.status || "ACTIVE",
          })),
          assetRequests: [],
          identityDocuments: [],
          complianceRecords: (empData.consentLogsAsSubject || []).map((log: any) => ({
            id: log.id,
            policyName: log.purpose,
            acknowledgedAt: new Date(log.consentedAt).toLocaleString("en-GB", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
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

        {/* Profile Content */}
        {!isLoading && profile && (
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
