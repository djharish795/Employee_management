import React from 'react';
import { Laptop, Monitor, Keyboard, Mouse, Smartphone, Badge as IdBadge, Key, Server, Laptop2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';

const ASSET_TYPES = [
  { id: 'laptop', name: 'Laptop', icon: <Laptop className="w-5 h-5 text-slate-700" /> },
  { id: 'monitor', name: 'Monitor', icon: <Monitor className="w-5 h-5 text-slate-700" /> },
  { id: 'keyboard', name: 'Keyboard', icon: <Keyboard className="w-5 h-5 text-slate-700" /> },
  { id: 'mouse', name: 'Mouse', icon: <Mouse className="w-5 h-5 text-slate-700" /> },
  { id: 'phone', name: 'Mobile Phone', icon: <Smartphone className="w-5 h-5 text-slate-700" /> },
  { id: 'idcard', name: 'ID Card', icon: <IdBadge className="w-5 h-5 text-slate-700" /> },
  { id: 'access', name: 'Access Card', icon: <Key className="w-5 h-5 text-slate-700" /> },
];

export function AssetsForm() {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* Left side: Assets Selection */}
      <div className="xl:col-span-2 space-y-6">
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-bold text-slate-800">Hardware & Equipment Assignment</CardTitle>
              <button className="text-sm font-bold text-blue-600 hover:text-blue-700">+ Add Custom Asset</button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100">
              
              {/* Pre-populated standard assets */}
              {/* Laptop Card */}
              <div className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <Laptop2 className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Standard Laptop</h4>
                      <p className="text-xs font-semibold text-slate-500">Employee Workspace Machine</p>
                    </div>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" />
                      <div className="block bg-slate-200 w-10 h-6 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                    </div>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4 pl-13">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Serial Number</label>
                    <Input type="text" placeholder="Enter Serial Number" className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Assigned Date</label>
                    <Input type="date" className="h-8 text-xs" />
                  </div>
                </div>
              </div>

              {/* Monitor Card */}
              <div className="p-5 hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <Monitor className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">External Display</h4>
                      <p className="text-xs font-semibold text-slate-500">Secondary Monitor</p>
                    </div>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" />
                      <div className="block bg-slate-200 w-10 h-6 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                    </div>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4 pl-13">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Serial Number</label>
                    <Input type="text" placeholder="Enter Serial Number" className="h-8 text-xs" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Assigned Date</label>
                    <Input type="date" className="h-8 text-xs" />
                  </div>
                </div>
              </div>

              {/* ID Card */}
              <div className="p-5 hover:bg-slate-50 transition-colors bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                      <IdBadge className="w-5 h-5 text-slate-700" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-800">Employee ID Card</h4>
                      <p className="text-xs font-semibold text-slate-500">HQ Access Badge</p>
                    </div>
                  </div>
                  <label className="flex items-center cursor-pointer">
                    <div className="relative">
                      <input type="checkbox" className="sr-only" />
                      <div className="block bg-slate-200 w-10 h-6 rounded-full"></div>
                      <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Other inactive assets */}
              {['Keyboard', 'Mouse', 'Mobile Phone'].map((asset) => (
                <div key={asset} className="p-5 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                        <Server className="w-5 h-5 text-slate-400" />
                      </div>
                      <h4 className="text-sm font-bold text-slate-700">{asset}</h4>
                    </div>
                    <label className="flex items-center cursor-pointer">
                      <div className="relative">
                        <input type="checkbox" className="sr-only" />
                        <div className="block bg-slate-200 w-10 h-6 rounded-full"></div>
                        <div className="dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition"></div>
                      </div>
                    </label>
                  </div>
                </div>
              ))}
              
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right side: Asset Summary */}
      <div className="space-y-6">
        <Card className="border-slate-200 shadow-sm rounded-xl">
          <CardHeader className="border-b border-slate-100 pb-4 mb-4">
            <CardTitle className="text-lg font-bold text-slate-800">Asset Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-bold text-slate-700">Total Items Assigned</span>
                <span className="text-lg font-black text-slate-900">0</span>
              </div>
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                <div className="h-full bg-slate-200 w-full" />
              </div>
            </div>

            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pending IT Approval</h4>
            <div className="space-y-3">
              <div className="text-center py-4 border border-dashed border-slate-200 rounded-lg">
                <p className="text-xs font-semibold text-slate-500">No assets pending approval</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-blue-50/50 border border-blue-100 rounded-lg">
              <p className="text-xs font-semibold text-blue-800 leading-relaxed">
                Hardware will be provisioned by the IT department upon final completion of this onboarding flow. Asset IDs will be finalized at dispatch.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
