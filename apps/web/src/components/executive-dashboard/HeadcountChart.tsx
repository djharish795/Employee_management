import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DepartmentHeadcount } from '../../types/executive-dashboard';

export function HeadcountChart({ data, total }: { data: DepartmentHeadcount[], total: number }) {
  return (
    <Card className="border-slate-200 shadow-sm h-full">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-slate-800">Headcount by department</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col md:flex-row items-center gap-8">
          {/* Circular representation (simplified as a central total) */}
          <div className="relative w-40 h-40 rounded-full border-8 border-slate-100 flex items-center justify-center shrink-0">
            <div className="text-center">
              <span className="block text-4xl font-bold text-slate-900">{total}</span>
              <span className="text-sm text-slate-500 font-medium">Total</span>
            </div>
            {/* Visual colored borders for departments */}
            <div className="absolute inset-0 rounded-full border-t-8 border-r-8 border-slate-900 rotate-45" style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%, 0 100%, 0 0)' }}></div>
          </div>

          <div className="flex-1 w-full space-y-4">
            {data.map((dept) => (
              <div key={dept.department} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${dept.color}`}></div>
                  <span className="text-sm font-medium text-slate-700">{dept.department}</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{dept.count}</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
