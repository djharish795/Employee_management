import React from 'react';
import CrmDashboardView from '@/components/modules/crm/crm-dashboard-view';

export default function CrmDashboardPage() {
  return (
    <div className="flex-1 w-full p-6 md:p-8 bg-slate-50 min-h-screen font-sans">
      <CrmDashboardView />
    </div>
  );
}
