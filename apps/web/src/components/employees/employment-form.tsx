import React, { useState, useEffect } from 'react';
import Image from "next/image";
import { Briefcase, Network, Building2, Calendar, Banknote } from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

interface EmploymentProps {
  onSave: (data: any) => void;
  initialData?: any;
  formId?: string;
}

export function EmploymentForm({ onSave, initialData = {}, formId }: EmploymentProps) {
  const [departments, setDepartments] = useState<any[]>([]);
  const [designations, setDesignations] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  const [managerSearch, setManagerSearch] = useState('');
  const [selectedManager, setSelectedManager] = useState<any>(initialData.reportingManagerId ? { id: initialData.reportingManagerId, name: initialData.manager?.name } : null);
  const [isManagerDropdownOpen, setIsManagerDropdownOpen] = useState(false);
  const accessToken = useAuthStore((state) => state.accessToken);

  // Debounced manager search
  useEffect(() => {
    if (!accessToken) return;
    const delayDebounceFn = setTimeout(async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
        const query = managerSearch ? `&search=${encodeURIComponent(managerSearch)}` : '';
        const empRes = await fetch(`${apiUrl}/employees?page=1&limit=20&status=ACTIVE${query}`, { headers: { Authorization: `Bearer ${accessToken}` } });
        if (empRes.ok) {
          const empJson = await empRes.json();
          setManagers(empJson.data || []);
        }
      } catch (e) {
        console.error("Failed to load managers", e);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [managerSearch, accessToken]);

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL!;
        
        // Fetch departments
        const deptRes = await fetch(`${apiUrl}/departments?page=1&limit=100`, { headers: { Authorization: `Bearer ${accessToken}` } });
        if (deptRes.ok) {
          const json = await deptRes.json();
          setDepartments(json.data || []);
        }

        // Fetch designations
        const desigRes = await fetch(`${apiUrl}/departments/all-designations`, { headers: { Authorization: `Bearer ${accessToken}` } });
        if (desigRes.ok) {
          const desigJson = await desigRes.json();
          setDesignations(desigJson.data || []);
        }
      } catch (e) {
        console.error("Failed to load master data", e);
      }
    };
    if (accessToken) {
      fetchMasterData();
    }
  }, [accessToken]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSave(data);
  };

  return (
    <form id={formId || "onboarding-form"} onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        
        {/* Job Details */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-5 flex flex-row items-center gap-2">
            <Briefcase className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-bold text-slate-800">Job Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Resource Type</label>
                <select name="resourceType" defaultValue={initialData.resourceType || ""} required className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Resource Type</option>
                  <option value="TR">Technical Resources (TR)</option>
                  <option value="AR">Admin Resources (AR)</option>
                  <option value="OR">Operational Resources (OR)</option>
                  <option value="SR">Services Resources (SR)</option>
                  <option value="HR">Human Resources (HR)</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Employee ID</label>
                <Input name="employeeId" type="text" defaultValue={initialData.employeeId} placeholder="Auto-generated on save" disabled />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Employment Type</label>
                <select name="employeeType" defaultValue={initialData.employeeType || ""} className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Type</option>
                  <option value="FULL_TIME">Full-Time</option>
                  <option value="PART_TIME">Part-Time</option>
                  <option value="CONTRACT">Contractor</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Status</label>
                <select name="status" defaultValue={initialData.status || ""} className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Department</label>
                <select name="departmentId" defaultValue={initialData.departmentId || ""} className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Department</option>
                  {departments.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                  {initialData.departmentId && !departments.find((d: any) => d.id === initialData.departmentId) && (
                    <option value={initialData.departmentId}>{initialData.department}</option>
                  )}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Designation</label>
                <select name="designationId" defaultValue={initialData.designationId || ""} className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Designation</option>
                  {designations.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                  {initialData.designationId && !designations.find((d: any) => d.id === initialData.designationId) && (
                    <option value={initialData.designationId}>{initialData.designation}</option>
                  )}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Role</label>
                <Input name="jobRole" type="text" defaultValue={initialData.jobRole} placeholder="e.g. Individual Contributor" />
              </div>
              <div className="space-y-1.5 relative">
                <label className="text-sm font-semibold text-slate-700">Reporting Manager</label>
                <input type="hidden" name="reportingManagerId" value={selectedManager?.id || ""} />
                
                <div className="relative">
                  <Input 
                    type="text" 
                    placeholder="Search and select manager..." 
                    value={isManagerDropdownOpen ? managerSearch : (selectedManager?.name || selectedManager?.firstName || managerSearch)}
                    onChange={(e) => {
                      setManagerSearch(e.target.value);
                      setIsManagerDropdownOpen(true);
                      if (e.target.value === '') setSelectedManager(null);
                    }}
                    onFocus={() => setIsManagerDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsManagerDropdownOpen(false), 200)}
                    className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none"
                  />
                  
                  {isManagerDropdownOpen && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {managers.length === 0 ? (
                        <div className="px-3 py-2 text-sm text-slate-500">No managers found.</div>
                      ) : (
                        managers.map((m: any) => (
                          <div 
                            key={m.id} 
                            className="px-3 py-2 text-sm hover:bg-slate-50 cursor-pointer"
                            onClick={() => {
                              setSelectedManager(m);
                              setManagerSearch('');
                              setIsManagerDropdownOpen(false);
                            }}
                          >
                            {m.firstName} {m.lastName} ({m.employeeId})
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Team Lead</label>
                <select name="teamLeadId" defaultValue={initialData.teamLeadId || ""} className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Team Lead</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Context */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-5 flex flex-row items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-bold text-slate-800">Organization Context</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Work Location</label>
                <select defaultValue={initialData.location || ""} className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Location</option>
                  <option value={initialData.location}>{initialData.location}</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Business Unit</label>
                <Input type="text" defaultValue={initialData.businessUnit} placeholder="Enter Business Unit" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Cost Center</label>
                <Input type="text" defaultValue={initialData.costCenter} placeholder="Enter Cost Center" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Shift</label>
                <select defaultValue={initialData.shift || ""} className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Shift</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lifecycle & Mode */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-5 flex flex-row items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-bold text-slate-800">Lifecycle & Mode</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Start Date</label>
                <Input name="joiningDate" type="date" defaultValue={initialData.joinedDate ? new Date(initialData.joinedDate).toISOString().split('T')[0] : ''} className="text-slate-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Probation Period (Months)</label>
                <Input type="number" defaultValue={initialData.probationPeriod} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Notice Period (Days)</label>
                <Input type="number" defaultValue={initialData.noticePeriod} placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 block mb-2">Work Mode</label>
                <div className="flex gap-2">
                  <button type="button" className={`flex-1 h-9 rounded-md border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-colors ${initialData.workMode === 'Office' ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-white text-slate-700'}`}>Office</button>
                  <button type="button" className={`flex-1 h-9 rounded-md border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-colors ${initialData.workMode === 'Hybrid' ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-white text-slate-700'}`}>Hybrid</button>
                  <button type="button" className={`flex-1 h-9 rounded-md border border-slate-200 text-sm font-semibold hover:bg-slate-50 transition-colors ${initialData.workMode === 'Remote' ? 'bg-slate-100 text-slate-900 border-slate-300' : 'bg-white text-slate-700'}`}>Remote</button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Compensation & Payroll */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-5 flex flex-row items-center gap-2">
            <Banknote className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-bold text-slate-800">Compensation & Payroll</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Annual CTC</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                  <Input type="number" defaultValue={initialData.annualCtc} placeholder="0.00" className="pl-7" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Monthly Salary (Base)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                  <Input type="number" defaultValue={initialData.monthlySalary} placeholder="0.00" className="pl-7" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Currency</label>
                <select defaultValue={initialData.currency || ""} className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Currency</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="INR">INR - Indian Rupee</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Pay Grade</label>
                <select defaultValue={initialData.payGrade || ""} className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Grade</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Payroll Group</label>
                <select defaultValue={initialData.payrollGroup || ""} className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Group</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Bonus Structure</label>
                <Input type="text" defaultValue={initialData.bonusStructure} placeholder="Enter details" />
              </div>
            </div>
          </CardContent>
        </Card>

      </div>

      {/* Right Side Cards */}
      <div className="space-y-6">
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-5 flex flex-row items-center gap-2">
            <Network className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-bold text-slate-800">Reporting Hierarchy</CardTitle>
          </CardHeader>
          <CardContent>
            {initialData.manager ? (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full overflow-hidden mb-3 border-2 border-white shadow-sm">
                  <Image src={initialData.manager.photoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${initialData.manager.name}`} alt="Manager" className="w-full h-full object-cover" fill style={{ objectFit: "cover" }} />
                </div>
                <h4 className="text-sm font-bold text-slate-900">{initialData.manager.name}</h4>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">Manager</p>
              </div>
            ) : (
              <div className="py-8 flex flex-col items-center justify-center text-center">
                <Network className="w-10 h-10 text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-700">No Manager Assigned</h4>
                <p className="text-xs font-semibold text-slate-500 mt-1 max-w-[200px]">Select a reporting manager to view the organizational hierarchy.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm rounded-xl bg-slate-50">
          <CardContent className="pt-6">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Onboarding Progress</h4>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
            </div>
            <p className="text-xs font-semibold text-slate-500">Employee Edit Mode</p>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
