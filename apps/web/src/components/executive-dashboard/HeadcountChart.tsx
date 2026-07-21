import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DepartmentHeadcount } from '../../types/executive-dashboard';

export function HeadcountChart({ data, total }: { data: DepartmentHeadcount[], total: number }) {
  return (
    <Card className="border-slate-200/70 shadow-sm shadow-slate-200/50 h-full relative overflow-hidden bg-white/80 backdrop-blur-md">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-800">Headcount by department</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Circular representation (simplified as a central total) */}
          <div className="relative w-40 h-40 rounded-full border-8 border-slate-50 flex items-center justify-center shrink-0 shadow-inner">
            <div className="text-center">
              <span className="block text-4xl font-bold text-slate-900">{total}</span>
              <span className="text-sm text-slate-500 font-medium">Total</span>
            </div>
            {/* Visual colored borders for departments */}
            <div className="absolute inset-0 rounded-full border-t-8 border-r-8 border-slate-800 rotate-45 opacity-20" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 0)' }}></div>
          </div>

          <div className="flex-1 w-full space-y-1">
            {data.map((dept) => (
              <div key={dept.department} className="flex items-center justify-between p-2.5 -mx-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-default">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full shadow-sm ${dept.color}`}></div>
                  <span className="text-sm font-medium text-slate-700">{dept.department}</span>
                </div>
                <span className="text-sm font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-sm border border-slate-100">{dept.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
