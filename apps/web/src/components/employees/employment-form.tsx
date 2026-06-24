import React from 'react';
import { Briefcase, Network, Building2, Calendar, Banknote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

export function EmploymentForm({ onSave }: { onSave: (data: any) => void }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSave(data);
  };

  return (
    <form id="onboarding-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
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
                <select name="resourceType" required className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
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
                <Input name="employeeId" type="text" placeholder="Auto-generated on save" disabled />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Employment Type</label>
                <select name="employeeType" className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Type</option>
                  <option value="FULL_TIME">Full-Time</option>
                  <option value="PART_TIME">Part-Time</option>
                  <option value="CONTRACTOR">Contractor</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Status</label>
                <select name="status" className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Status</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Department</label>
                <select name="departmentId" className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Department</option>
                  {/* Options will be loaded from API */}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Designation</label>
                <select name="designationId" className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Designation</option>
                  {/* Options will be loaded from API */}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Role</label>
                <Input name="jobRole" type="text" placeholder="e.g. Individual Contributor" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Reporting Manager</label>
                <select name="reportingManagerId" className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Manager</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Team Lead</label>
                <select name="teamLeadId" className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
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
                <select className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Location</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Business Unit</label>
                <Input type="text" placeholder="Enter Business Unit" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Cost Center</label>
                <Input type="text" placeholder="Enter Cost Center" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Shift</label>
                <select className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
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
                <Input name="joiningDate" type="date" className="text-slate-500" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Probation Period (Months)</label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Notice Period (Days)</label>
                <Input type="number" placeholder="0" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700 block mb-2">Work Mode</label>
                <div className="flex gap-2">
                  <button type="button" className="flex-1 h-9 rounded-md border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">Office</button>
                  <button type="button" className="flex-1 h-9 rounded-md border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">Hybrid</button>
                  <button type="button" className="flex-1 h-9 rounded-md border border-slate-200 bg-white text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">Remote</button>
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
                  <Input type="number" placeholder="0.00" className="pl-7" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Monthly Salary (Base)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-semibold">$</span>
                  <Input type="number" placeholder="0.00" className="pl-7" />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Currency</label>
                <select className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Currency</option>
                  <option>USD - US Dollar</option>
                  <option>EUR - Euro</option>
                  <option>INR - Indian Rupee</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Pay Grade</label>
                <select className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Grade</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Payroll Group</label>
                <select className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Group</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Bonus Structure</label>
                <Input type="text" placeholder="Enter details" />
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
            <div className="py-8 flex flex-col items-center justify-center text-center">
              <Network className="w-10 h-10 text-slate-300 mb-3" />
              <h4 className="text-sm font-bold text-slate-700">No Manager Assigned</h4>
              <p className="text-xs font-semibold text-slate-500 mt-1 max-w-[200px]">Select a reporting manager to view the organizational hierarchy.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm rounded-xl bg-slate-50">
          <CardContent className="pt-6">
            <h4 className="text-sm font-bold text-slate-800 mb-4">Onboarding Progress</h4>
            <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-2">
              <div className="h-full bg-blue-600" style={{ width: '0%' }} />
            </div>
            <p className="text-xs font-semibold text-slate-500">Step 0 of 8 Completed</p>
          </CardContent>
        </Card>
      </div>
    </form>
  );
}
