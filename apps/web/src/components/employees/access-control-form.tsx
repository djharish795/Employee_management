import React, { useState } from 'react';
import { User, Shield, Grid, ShieldCheck, Eye, EyeOff, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

interface AccessControlProps {
  onSave: (data: any) => void;
  initialData?: any;
  formId?: string;
}

export function AccessControlForm({ onSave, initialData = {}, formId }: AccessControlProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState(initialData.role || "");
  const [selectedModules, setSelectedModules] = useState<string[]>(initialData.modules || []);
  const [selectedApps, setSelectedApps] = useState<string[]>(initialData.apps || []);

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
  };

  const handleModuleToggle = (moduleName: string) => {
    setSelectedModules(prev => 
      prev.includes(moduleName) ? prev.filter(m => m !== moduleName) : [...prev, moduleName]
    );
  };

  const handleAppToggle = (appName: string) => {
    setSelectedApps(prev => 
      prev.includes(appName) ? prev.filter(a => a !== appName) : [...prev, appName]
    );
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSave(data);
  };

  return (
    <form id="onboarding-form" onSubmit={handleSubmit} className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
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
                    <Input name="password" type={showPassword ? "text" : "password"} placeholder="••••••••" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
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
                <select name="role" value={role} onChange={handleRoleChange} className="w-full h-10 px-3 py-2 rounded-md border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-slate-900/20 outline-none">
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
              {['Dashboard', 'Payroll', 'Recruiting', 'Benefits', 'Time Off', 'Expenses'].map((mod) => (
                <label key={mod} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                  <input type="checkbox" name={`module_${mod.toLowerCase().replace(' ', '_')}`} onChange={() => handleModuleToggle(mod)} checked={selectedModules.includes(mod)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-600" />
                  <span className="text-sm font-semibold text-slate-700">{mod}</span>
                </label>
              ))}
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
              {[
                { id: 'vpn', name: 'VPN Access', desc: 'Enable remote secure tunnel', short: 'VPN' },
                { id: 'slack', name: 'Slack Workspace', desc: 'Auto-join department channels', short: 'Slack' },
                { id: 'jira', name: 'Jira Access', desc: 'Developer portal permissions', short: 'Jira' },
                { id: 'bio', name: 'Biometric Login', desc: 'Hardware-level authentication', short: 'Bio' },
              ].map((app) => (
                <div key={app.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-slate-600">{app.short}</span>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">{app.name}</h4>
                      <p className="text-xs font-medium text-slate-500">{app.desc}</p>
                    </div>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" name={`app_${app.id}`} className="sr-only peer" onChange={() => handleAppToggle(app.name)} checked={selectedApps.includes(app.name)} />
                      <div className="block bg-slate-300 w-10 h-6 rounded-full peer-checked:bg-blue-600 transition-colors"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform peer-checked:translate-x-4"></div>
                    </div>
                  </label>
                </div>
              ))}
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
                <span className="font-bold text-blue-600 capitalize">{role || 'Not assigned'}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Permission Count</span>
                <span className="font-bold text-slate-700">{selectedModules.length} Nodes</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Apps Enabled</span>
                <div className="flex gap-1">
                  <span className="font-bold text-slate-700">{selectedApps.length > 0 ? selectedApps.length : 'None'}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-500">Security Level</span>
                <span className={`px-2 py-0.5 rounded-full font-bold flex items-center gap-1 ${selectedApps.length > 2 ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'}`}>
                  <ShieldCheck className="w-3 h-3" /> {selectedApps.length > 2 ? 'High' : 'Standard'}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-3 border border-slate-200 shadow-sm">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">Active Integration</p>
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <RefreshCw className={`w-3.5 h-3.5 ${selectedApps.length > 0 ? 'text-blue-600' : ''}`} />
                {selectedApps.length > 0 ? <span className="text-blue-600">{selectedApps.join(', ')} syncing</span> : 'No sync active'}
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
