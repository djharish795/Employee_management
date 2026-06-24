import React from "react";
import { Sheet, SheetContent, SheetClose } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Employee } from "@/types/employees";
import { 
  Building2, 
  Mail, 
  MapPin, 
  Phone, 
  Briefcase, 
  CalendarDays, 
  Clock,
  Download,
  Eye,
  FileText,
  Camera,
  X,
  User,
  PowerOff
} from "lucide-react";

interface EmployeeViewDrawerProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
}

export function EmployeeViewDrawer({ employee, isOpen, onClose }: EmployeeViewDrawerProps) {
  if (!employee) return null;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-[600px] overflow-y-auto p-0 bg-white border-l border-slate-200" showCloseButton={false}>
        <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-slate-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-slate-100">
          <X className="h-4 w-4 text-slate-500" />
          <span className="sr-only">Close</span>
        </SheetClose>

        {/* Header Profile Section */}
        <div className="px-6 pt-8 pb-0">
          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="relative">
              <div className="w-20 h-20 rounded-xl bg-slate-900 overflow-hidden shadow-sm flex items-center justify-center">
                {employee.avatarBg ? (
                  <div className={`w-full h-full flex items-center justify-center text-2xl font-bold text-white ${employee.avatarBg}`}>
                    {employee.initials}
                  </div>
                ) : (
                  <img 
                    src={`https://api.dicebear.com/7.x/notionists/svg?seed=${employee.name}`} 
                    alt={employee.name}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <button className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-1.5 rounded-lg shadow-sm border-2 border-white hover:bg-blue-700 transition-colors">
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>
            
            <div className="flex-1 mt-0.5">
              <h2 className="text-[22px] font-bold text-slate-900 tracking-tight leading-none mb-2">
                {employee.name}
              </h2>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {employee.id}
                </span>
                <span className="text-slate-400 text-xs font-semibold">•</span>
                <span className="text-slate-500 text-xs font-semibold">Joined {employee.joinedDate || 'Nov 2020'}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider border border-emerald-100">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {employee.status}
                </div>
                <div className="bg-orange-100/80 text-orange-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  {employee.department.toUpperCase()}
                </div>
                <div className="bg-blue-100/80 text-blue-700 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider">
                  {employee.designation.toUpperCase()}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Details Tabs Section */}
        <div className="mt-8">
          <Tabs defaultValue="overview" className="w-full">
            <div className="px-6 border-b border-slate-200">
              <TabsList className="w-full h-auto flex bg-transparent p-0 space-x-6 justify-start overflow-x-auto no-scrollbar">
                <TabsTrigger 
                  value="overview" 
                  className="px-0 py-3 text-sm font-bold text-slate-500 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none data-[state=active]:shadow-none transition-none"
                >
                  Overview
                </TabsTrigger>
                <TabsTrigger 
                  value="personal" 
                  className="px-0 py-3 text-sm font-bold text-slate-500 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none data-[state=active]:shadow-none transition-none"
                >
                  Personal Information
                </TabsTrigger>
                <TabsTrigger 
                  value="employment" 
                  className="px-0 py-3 text-sm font-bold text-slate-500 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none data-[state=active]:shadow-none transition-none"
                >
                  Employment
                </TabsTrigger>
                <TabsTrigger 
                  value="documents" 
                  className="px-0 py-3 text-sm font-bold text-slate-500 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none data-[state=active]:shadow-none transition-none"
                >
                  Documents
                </TabsTrigger>
                <TabsTrigger 
                  value="attendance" 
                  className="px-0 py-3 text-sm font-bold text-slate-500 data-[state=active]:text-blue-600 data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-blue-600 rounded-none data-[state=active]:shadow-none transition-none"
                >
                  Attendance
                </TabsTrigger>
              </TabsList>
            </div>

            <div className="p-6">
              {/* OVERVIEW TAB */}
              <TabsContent value="overview" className="space-y-4 focus-visible:outline-none mt-0">
                
                {/* Basic Information Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      Basic Information
                    </h3>
                    <button className="text-xs font-bold text-blue-600 hover:text-blue-700">View History</button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Full Name</label>
                      <div className="text-sm font-bold text-slate-900">{employee.name}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Employee ID</label>
                      <div className="text-sm font-bold text-slate-900">{employee.id}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Email Address</label>
                      <div className="text-sm font-bold text-slate-900">{employee.email}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Phone Number</label>
                      <div className="text-sm font-bold text-slate-900">+1 (555) 012-9904</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Gender</label>
                      <div className="text-sm font-bold text-slate-900">Male</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Date of Birth</label>
                      <div className="text-sm font-bold text-slate-900">October 14, 1978</div>
                    </div>
                  </div>
                </div>

                {/* Organization Information Card */}
                <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 mb-5">
                    <Building2 className="w-4 h-4 text-blue-600" />
                    Organization Information
                  </h3>
                  <div className="grid grid-cols-2 gap-y-5 gap-x-4">
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Department</label>
                      <div className="text-sm font-bold text-slate-900">{employee.department}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Designation</label>
                      <div className="text-sm font-bold text-slate-900">{employee.designation}</div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Reporting Manager</label>
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[9px] font-bold text-blue-700">
                          AT
                        </div>
                        <span className="text-sm font-bold text-slate-900">Alex Thompson</span>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Work Location</label>
                      <div className="text-sm font-bold text-slate-900">San Francisco HQ</div>
                    </div>
                    <div className="col-span-2">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1">Employment Type</label>
                      <div className="text-sm font-bold text-slate-900">Full-Time (Permanent)</div>
                    </div>
                  </div>
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-4 gap-3">
                  <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-center">
                    <div className="text-2xl font-black text-blue-600 mb-1 tracking-tight">98.4%</div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Attendance</div>
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-center">
                    <div className="text-2xl font-black text-orange-500 mb-1 tracking-tight">12</div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Leave Bal.</div>
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-center">
                    <div className="text-2xl font-black text-slate-900 mb-1 tracking-tight">4</div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Projects</div>
                  </div>
                  <div className="bg-white border border-slate-200 p-3 rounded-xl shadow-sm text-center">
                    <div className="text-2xl font-black text-slate-900 mb-1 tracking-tight">3.5</div>
                    <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Years</div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="pt-4 pb-2">
                  <div className="flex flex-wrap gap-3">
                    <button className="h-10 px-6 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors shadow-sm">
                      Edit Employee
                    </button>
                    <button className="h-10 px-4 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                      Assign Manager
                    </button>
                    <button className="h-10 px-4 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                      Transfer Dept.
                    </button>
                    <button className="h-10 px-4 rounded-lg bg-white border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors shadow-sm">
                      Change Designation
                    </button>
                    <button className="h-10 px-4 rounded-lg bg-rose-50 text-rose-600 text-sm font-bold flex items-center gap-2 hover:bg-rose-100 transition-colors shadow-sm">
                      <PowerOff className="w-4 h-4" />
                      Reset Password
                    </button>
                  </div>
                </div>

              </TabsContent>

              {/* OTHER TABS (Placeholders for now) */}
              <TabsContent value="personal" className="mt-0">
                <div className="p-10 text-center text-sm font-bold text-slate-500 bg-white rounded-xl border border-slate-200">
                  Personal Information Content
                </div>
              </TabsContent>
              <TabsContent value="employment" className="mt-0">
                <div className="p-10 text-center text-sm font-bold text-slate-500 bg-white rounded-xl border border-slate-200">
                  Employment Content
                </div>
              </TabsContent>
              <TabsContent value="documents" className="mt-0">
                <div className="p-10 text-center text-sm font-bold text-slate-500 bg-white rounded-xl border border-slate-200">
                  Documents Content
                </div>
              </TabsContent>
              <TabsContent value="attendance" className="mt-0">
                <div className="p-10 text-center text-sm font-bold text-slate-500 bg-white rounded-xl border border-slate-200">
                  Attendance Content
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </SheetContent>
    </Sheet>
  );
}
