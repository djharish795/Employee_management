import { ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-10 shadow-2xl relative overflow-hidden">
        
        {/* Animated Background Pulse */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-red-500/10 blur-[100px] rounded-full pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mb-6">
            <ShieldAlert className="w-10 h-10 text-red-600 dark:text-red-500 animate-pulse" />
          </div>
          
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight mb-4">
            System Maintenance
          </h1>
          
          <p className="text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
            Crewbase is currently undergoing critical security upgrades and maintenance. The platform has been temporarily locked by the Master Administrator. 
            <br/><br/>
            Please try logging in again shortly.
          </p>

          <Link 
            href="/login" 
            className="w-full inline-flex justify-center items-center px-6 py-3 border border-transparent text-sm font-medium rounded-xl shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Return to Login
          </Link>
        </div>
      </div>
    </div>
  );
}
