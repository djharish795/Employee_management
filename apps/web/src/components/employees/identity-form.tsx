import React, { useState } from 'react';
import { FileBadge, Landmark, Globe, UploadCloud, CheckCircle2, FileText, Image as ImageIcon, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

interface IdentityProps {
  onSave: (data: any) => void;
  initialData?: any;
  formId?: string;
}

export function IdentityForm({ onSave, initialData = {}, formId }: IdentityProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSave(data);
  };

  return (
    <form id={formId || "onboarding-form"} onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        
        {/* Government IDs */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-5 flex flex-row items-center gap-2">
            <FileBadge className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-bold text-slate-800">Government IDs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5 mb-8">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Aadhaar Number*</label>
                <Input name="aadhaar" type="text" placeholder="1234 5678 9012" required pattern="^\d{4}\s?\d{4}\s?\d{4}$" title="Enter a valid 12-digit Aadhaar number" maxLength={14} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">PAN Number*</label>
                <Input name="pan" type="text" placeholder="ABCDE1234F" required pattern="^[A-Z]{5}[0-9]{4}[A-Z]{1}$" title="Enter a valid PAN number (e.g., ABCDE1234F)" maxLength={10} className="uppercase" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Passport Number</label>
                <Input name="passport" type="text" placeholder="A1234567" pattern="^[A-Z][0-9]{7}$" title="Enter a valid Indian Passport number" maxLength={8} className="uppercase" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Driving License</label>
                <Input name="drivingLicense" type="text" placeholder="KA-01-2023-1234567" pattern="^[A-Z]{2}[-\s]?[0-9]{2}[-\s]?[0-9]{4}[-\s]?[0-9]{7}$" title="Enter a valid Driving License (e.g. KA-01-2023-1234567)" maxLength={20} className="uppercase" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Voter ID (Optional)</label>
                <Input name="voterId" type="text" placeholder="EPIC Number" pattern="^[A-Z]{3}[0-9]{7}$" title="Enter a valid 10-character Voter ID" maxLength={10} className="uppercase" />
              </div>
            </div>

            {/* Document Upload Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Aadhaar Upload */}
              <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center h-28 cursor-pointer hover:bg-slate-100 transition-colors">
                <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-sm font-bold text-slate-700">Aadhaar Card</span>
                <span className="text-xs font-medium text-slate-500">Drag or Click to upload</span>
              </div>

              {/* PAN Upload */}
              <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center h-28 cursor-pointer hover:bg-slate-100 transition-colors">
                <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-sm font-bold text-slate-700">PAN Card</span>
                <span className="text-xs font-medium text-slate-500">Drag or Click to upload</span>
              </div>

              {/* Passport Upload */}
              <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center h-28 cursor-pointer hover:bg-slate-100 transition-colors">
                <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-sm font-bold text-slate-700">Passport Scan</span>
                <span className="text-xs font-medium text-slate-500">Drag or Click to upload</span>
              </div>

              {/* Driving License Upload */}
              <div className="border border-slate-200 bg-slate-50 rounded-xl p-4 flex flex-col items-center justify-center h-28 cursor-pointer hover:bg-slate-100 transition-colors">
                <UploadCloud className="w-6 h-6 text-slate-400 mb-2" />
                <span className="text-sm font-bold text-slate-700">Driving License</span>
                <span className="text-xs font-medium text-slate-500">Required for field roles</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Side Cards */}
      <div className="space-y-6">
        
        {/* Tax Info */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-5 flex flex-row items-center gap-2">
            <Landmark className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-bold text-slate-800">Tax Info</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Tax Regime</label>
                <select className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option>New Tax Regime (Default)</option>
                  <option>Old Tax Regime</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">UAN Number</label>
                <Input type="text" placeholder="100XXXXXXXXXX" pattern="^\d{12}$" title="Enter a valid 12-digit UAN number" maxLength={12} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">PF Account</label>
                <Input type="text" placeholder="MH/BAN/0000000/000/0000000" maxLength={25} className="uppercase" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">ESI Number</label>
                <Input type="text" placeholder="17-00-000000-000-0000" pattern="^\d{2}-?\d{2}-?\d{6}-?\d{3}-?\d{4}$" maxLength={22} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Citizenship */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-5 flex flex-row items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600" />
            <CardTitle className="text-lg font-bold text-slate-800">Citizenship</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Nationality</label>
                <Input type="text" placeholder="Indian" required pattern="[A-Za-z\s]+" maxLength={50} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Residency Status</label>
                <select className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option>Citizen</option>
                  <option>Permanent Resident</option>
                  <option>Work Visa</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Visa Type</label>
                  <Input type="text" placeholder="N/A" disabled className="bg-slate-50" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Expiry</label>
                  <Input type="text" placeholder="N/A" disabled className="bg-slate-50" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </form>
  );
}
