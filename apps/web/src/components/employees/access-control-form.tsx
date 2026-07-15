import React, { useState } from 'react';
import { User, Shield, Grid, ShieldCheck, Eye, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

interface AccessControlProps {
  onSave: (data: any) => void;
  initialData?: any;
  formId?: string;
}

export function AccessControlForm({ onSave, initialData = {}, formId }: AccessControlProps) {
  const [summary, setSummary] = useState({
    role: 'Not assigned',
    modules: 0,
    apps: 0,
    hasIntegrations: false,
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSave(data);
  };

  const handleFormChange = (e: React.FormEvent<HTMLFormElement>) => {
    const formData = new FormData(e.currentTarget);
    
    const roleValue = formData.get('role') as string;
    const roleMap: Record<string, string> = { EMPLOYEE: 'Standard User', MANAGER: 'Manager', SUPER_ADMIN: 'Admin' };
    const roleName = roleMap[roleValue] || 'Not assigned';

    let modulesCount = 0;
    let appsCount = 0;
    let hasIntegrations = false;

    formData.forEach((value, key) => {
      if (typeof key === 'string' && key.startsWith('module') && value === 'on') modulesCount++;
      if (typeof key === 'string' && key.startsWith('sec') && value === 'on') {
        appsCount++;
        hasIntegrations = true;
      }
    });

    setSummary({
      role: roleName,
      modules: modulesCount,
      apps: appsCount,
      hasIntegrations
    });
  };

  return (
    <form id={formId || "onboarding-form"} onSubmit={handleSubmit} onChange={handleFormChange} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Left Column: Forms */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Account Creation */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-5">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Account Creation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Email Address</label>
                <Input name="email" type="email" placeholder="e.g. employee@company.com" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-slate-700">Username</label>
                  <Input name="username" type="text" placeholder="Generate username" />
                </div>
                <div className="space-y-1.5 relative">
                  <label className="text-sm font-semibold text-slate-700">Password</label>
                  <div className="relative">
                    <Input name="password" type="password" placeholder="••••••••" required />
                    <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Permissions */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-5">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Permissions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Role</label>
                <select name="role" className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Role</option>
                  <option value="EMPLOYEE">Standard User</option>
                  <option value="MANAGER">Manager</option>
                  <option value="SUPER_ADMIN">Admin</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Dept</label>
                <select className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Department</option>
                  <option value="hr">Human Resources</option>
                  <option value="engineering">Engineering</option>
                  <option value="finance">Finance</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-slate-700">Level</label>
                <select className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
                  <option value="">Select Level</option>
                  <option value="1">Level 1</option>
                  <option value="2">Level 2</option>
                  <option value="3">Level 3</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Module Multi-select */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-5">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Grid className="w-5 h-5 text-blue-600" />
              Module Multi-select
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="checkbox" name="moduleDashboard" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                <span className="text-sm font-semibold text-slate-700">Dashboard</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="checkbox" name="modulePayroll" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                <span className="text-sm font-semibold text-slate-700">Payroll</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="checkbox" name="moduleRecruiting" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                <span className="text-sm font-semibold text-slate-700">Recruiting</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="checkbox" name="moduleBenefits" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                <span className="text-sm font-semibold text-slate-700">Benefits</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="checkbox" name="moduleTimeOff" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                <span className="text-sm font-semibold text-slate-700">Time Off</span>
              </label>
              <label className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                <input type="checkbox" name="moduleExpenses" className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                <span className="text-sm font-semibold text-slate-700">Expenses</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Security & Integrations */}
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-2">
            <CardTitle className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Security & Integrations
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              
              <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-slate-600">VPN</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">VPN Access</h4>
                    <p className="text-xs font-medium text-slate-500">Enable remote secure tunnel</p>
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" name="secVpn" className="sr-only peer" />
                    <div className="block bg-slate-200 w-10 h-6 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                  </div>
                </label>
              </div>

              <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-slate-600">Slack</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Slack Workspace</h4>
                    <p className="text-xs font-medium text-slate-500">Auto-join department channels</p>
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" name="secSlack" className="sr-only peer" />
                    <div className="block bg-slate-200 w-10 h-6 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                  </div>
                </label>
              </div>

              <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-slate-500">Jira</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Jira Access</h4>
                    <p className="text-xs font-medium text-slate-500">Developer portal permissions</p>
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" name="secJira" className="sr-only peer" />
                    <div className="block bg-slate-200 w-10 h-6 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                  </div>
                </label>
              </div>

              <div className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-slate-600">Bio</span>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800">Biometric Login</h4>
                    <p className="text-xs font-medium text-slate-500">Hardware-level authentication</p>
                  </div>
                </div>
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input type="checkbox" name="secBio" className="sr-only peer" />
                    <div className="block bg-slate-200 w-10 h-6 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                    <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                  </div>
                </label>
              </div>

            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Column: Summary & Tips */}
      <div className="space-y-6">
        
        {/* Access Summary */}
        <Card className="border-slate-200 bg-slate-50 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-200 pb-4 mb-4">
            <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-700" />
              Access Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-6">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Role</span>
                <span className="font-bold text-slate-800">{summary.role}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Permission Count</span>
                <span className="font-bold text-slate-800">{summary.modules} Nodes</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Apps Enabled</span>
                <div className="flex gap-1">
                  <span className="font-bold text-slate-800">{summary.apps > 0 ? summary.apps : 'None'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Security Level</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> {summary.apps > 0 ? 'Enhanced' : 'Standard'}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Active Integration</p>
              <div className={`flex items-center gap-2 text-xs font-semibold ${summary.hasIntegrations ? 'text-emerald-600' : 'text-slate-400'}`}>
                <RefreshCw className={`w-3.5 h-3.5 ${summary.hasIntegrations ? 'animate-spin' : ''}`} />
                {summary.hasIntegrations ? 'Sync active' : 'No sync active'}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Tip */}
        <Card className="border-0 bg-[#1E293B] shadow-sm rounded-xl text-slate-300">
          <CardContent className="p-5">
            <h4 className="text-sm font-bold text-slate-200 mb-2">Configuration Tip</h4>
            <p className="text-xs font-medium leading-relaxed">
              Multi-factor authentication is mandatory for all users in the Human Resources department to comply with SOC2 standards.
            </p>
          </CardContent>
        </Card>

      </div>
    </form>
  );
}

