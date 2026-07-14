import React from 'react';
import { Wallet, Info, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

interface BankingProps {
  onSave: (data: any) => void;
  initialData?: any;
  formId?: string;
}

export function BankingForm({ onSave, initialData = {}, formId }: BankingProps) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSave(data);
  };

  return (
    <form id={formId || "onboarding-form"} onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div className="xl:col-span-2 space-y-6">
        
        {/* Banking Information */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-5">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-600" />
              Bank Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              
              <div className="flex items-center gap-4">
                <label className="text-sm font-semibold text-slate-700 w-1/3">Account Holder Name</label>
                <div className="w-2/3">
                  <Input name="accountHolderName" type="text" placeholder="Legal name as per bank record" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Bank Name</label>
                  <Input name="bankName" type="text" placeholder="e.g. JPMorgan Chase" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Branch Name</label>
                  <Input name="branchName" type="text" placeholder="City or Branch Code" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Account Number</label>
                  <Input name="bankAccount" type="password" placeholder="••••••••••••" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Confirm Account Number</label>
                  <Input type="text" placeholder="Re-enter for security" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">IFSC Code</label>
                  <Input name="bankIfsc" type="text" placeholder="11-digit alphanumeric" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">SWIFT / BIC Code</label>
                  <Input name="swiftCode" type="text" placeholder="8 or 11 characters" />
                </div>
              </div>

              <div className="h-px bg-slate-100 w-full my-6" />

              <h4 className="text-sm font-bold text-slate-800 mb-4">Payment Processing</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Payment Mode</label>
                  <select className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                    <option>Direct Deposit</option>
                    <option>Cheque</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Frequency</label>
                  <select className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                    <option>Monthly</option>
                    <option>Bi-weekly</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Account Type</label>
                  <select className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                    <option>Savings</option>
                    <option>Checking</option>
                    <option>Current</option>
                  </select>
                </div>
              </div>

            </div>
          </CardContent>
        </Card>

        {/* Verification Alert */}
        <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h5 className="text-sm font-bold text-slate-800">Verification Required</h5>
            <p className="text-xs font-semibold text-slate-600 mt-1 leading-relaxed">
              Please ensure the bank details provided match your official bank statement. Incorrect details may result in delayed payroll processing.
            </p>
          </div>
        </div>

      </div>

      {/* Right Side Cards */}
      <div className="space-y-6">
        
        {/* Salary Summary Card */}
        <Card className="bg-[#0F172A] text-white border-0 shadow-lg rounded-xl overflow-hidden">
          <CardHeader className="border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-white">Salary Summary</CardTitle>
              <Wallet className="w-5 h-5 text-slate-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-300">Basic Salary</span>
                <span className="font-bold text-white">$0.00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-300">HRA</span>
                <span className="font-bold text-white">$0.00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-300">Allowances</span>
                <span className="font-bold text-white">$0.00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-300">Performance Bonus</span>
                <span className="font-bold text-white">$0.00</span>
              </div>
              <div className="h-px bg-slate-800 w-full my-2" />
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-300">PF Contribution</span>
                <span className="font-bold text-red-400">-$0.00</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold text-slate-300">Taxes (Estimated)</span>
                <span className="font-bold text-red-400">-$0.00</span>
              </div>
            </div>
            
            <div className="bg-slate-800/50 rounded-lg p-4 flex items-center justify-between">
              <span className="text-sm font-semibold text-blue-300">Net Pay</span>
              <span className="text-2xl font-black text-white tracking-tight">$0.00</span>
            </div>
          </CardContent>
        </Card>

        {/* Support Card */}
        <Card className="border-slate-200 bg-slate-50 shadow-sm rounded-xl">
          <CardContent className="p-6 text-center">
            <h4 className="text-sm font-bold text-slate-800 mb-2">Need Help?</h4>
            <p className="text-xs font-semibold text-slate-500 mb-4 leading-relaxed">
              Our payroll team is available to assist with international banking queries or direct deposit setups.
            </p>
            <button className="w-full h-10 bg-white border border-slate-200 rounded-lg text-sm font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-sm">
              Contact Support
            </button>
          </CardContent>
        </Card>

      </div>
    </form>
  );
}
