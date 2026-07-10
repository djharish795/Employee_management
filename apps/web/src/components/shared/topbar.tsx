"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, LogOut, User, Users } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const accessToken = useAuthStore((state) => state.accessToken);
  const role = useAuthStore((state) => state.role);
  const photoUrl = useAuthStore((state) => state.photoUrl);
  const isTeamLead = useAuthStore((state) => state.isTeamLead);

  let userEmail = "User";
  if (accessToken) {
    try {
      const payload = JSON.parse(atob(accessToken.split('.')[1]));
      if (payload.email) {
        userEmail = payload.email.split('@')[0];
        // Replace dots with spaces and capitalize
        userEmail = userEmail.split('.').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ');
      }
    } catch (e) {
      // ignore
    }
  }

  const handleLogout = () => {
    setIsDropdownOpen(false);
    clearSession();
    window.location.href = '/login';
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      // Route matching logic
      if (q.includes('employee')) router.push('/employees');
      else if (q.includes('attend')) router.push('/attendance');
      else if (q.includes('leave')) router.push('/leaves');
      else if (q.includes('asset')) router.push('/assets');
      else if (q.includes('complian')) router.push('/compliance');
      else if (q.includes('audit') || q.includes('log')) router.push('/audit');
      else if (q.includes('onboard')) router.push('/onboarding');
      else if (q.includes('offboard')) router.push('/offboarding');
      else if (q.includes('knowledge')) router.push('/knowledge');
      else if (q.includes('workflow')) router.push('/workflows');
      else if (q.includes('recruit')) router.push('/recruitment');
      else if (q.includes('payroll')) router.push('/payroll');
      else if (q.includes('perform')) router.push('/performance');
      else if (q.includes('org') || q.includes('chart')) router.push('/org-chart');
      else if (q.includes('setting')) router.push('/settings');
      else {
        // Fallback for general searches like names, route to employee directory with query
        // This relies on the employee directory handling the query or just navigating there.
        router.push('/employees');
      }
      setSearchQuery(""); // Clear after search
    }
  };

  return (
    // pl-14 on mobile to leave room for the fixed hamburger button (lg:pl-8 resets it)
    <header className="h-14 sm:h-[72px] pl-14 lg:pl-8 pr-4 sm:pr-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-40 transition-colors">
      {/* Search Bar — hidden on very small screens, visible from sm: */}
      <div className="hidden sm:flex flex-1 max-w-2xl">
        <div className="relative flex items-center w-full h-10 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 px-3 text-slate-500 dark:text-slate-400 focus-within:ring-2 focus-within:ring-slate-900/20 dark:focus-within:ring-slate-100/20 focus-within:bg-white dark:focus-within:bg-slate-900 transition-all">
          <Search className="w-4 h-4 mr-2.5 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search employees, reports, or modules..."
            className="w-full h-full bg-transparent border-none text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Mobile: show only icon search button */}
      <div className="flex sm:hidden items-center">
        <button className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-6 ml-auto">
        <div className="flex items-center gap-2 sm:gap-4 text-slate-600 dark:text-slate-400">
          <button onClick={() => { }} className="hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none">
            <Bell className="w-5 h-5" />
          </button>
          <button onClick={() => { }} className="hidden sm:block hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-200 dark:bg-slate-800 transition-colors" />

        {/* Profile with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer group"
          >
            {/* Hide text name on mobile, show only avatar */}
            <div className="hidden sm:flex text-right flex-col">
              <span className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{userEmail}</span>
              <span className="text-[11px] font-semibold tracking-wide text-slate-500 dark:text-slate-400">{role || 'Employee'}</span>
            </div>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex-shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-center text-slate-700 dark:text-slate-300 font-bold text-sm uppercase transition-colors">
              {photoUrl ? (
                <img src={photoUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                userEmail.charAt(0)
              )}
            </div>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <button
                onClick={() => {
                  setIsDropdownOpen(false);
                  router.push('/profile/settings');
                }}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                Profile Settings
              </button>
              {isTeamLead && (
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    router.push('/team-lead/team');
                  }}
                  className="w-full text-left px-4 py-2.5 text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 flex items-center gap-2 transition-colors"
                >
                  <Users className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  Team Lead Portal
                </button>
              )}
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 transition-colors" />
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-500 dark:text-red-400" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
