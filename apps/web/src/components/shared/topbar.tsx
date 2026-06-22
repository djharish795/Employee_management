"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, LogOut, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

export function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    clearSession();
    router.push('/login');
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

  return (
    <header className="h-[72px] px-8 flex items-center justify-between border-b border-slate-200 bg-white sticky top-0 z-10">
      {/* Search Bar */}
      <div className="flex-1 max-w-2xl">
        <div className="relative flex items-center w-full h-10 rounded-lg bg-slate-100/80 px-3 text-slate-500 focus-within:ring-2 focus-within:ring-slate-900/20 focus-within:bg-white transition-all">
          <Search className="w-4 h-4 mr-2.5 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search employees, reports, or modules..."
            className="w-full h-full bg-transparent border-none text-sm font-medium placeholder:text-slate-400 focus:outline-none"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-6 ml-4">
        <div className="flex items-center gap-4 text-slate-600">
          <button onClick={() => {}} className="hover:text-slate-900 transition-colors focus:outline-none">
            <Bell className="w-5 h-5" />
          </button>
          <button onClick={() => {}} className="hover:text-slate-900 transition-colors focus:outline-none">
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-slate-200" />

        {/* Profile Profile with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <div 
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="text-right flex flex-col">
              <span className="text-sm font-bold text-slate-900 leading-tight group-hover:text-slate-900 transition-colors">Pradeep Chandra</span>
              <span className="text-[11px] font-semibold tracking-wide text-slate-500">CEO & Founder</span>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 overflow-hidden flex-shrink-0 border border-slate-200 shadow-sm">
              <img 
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Pradeep&backgroundColor=f1f5f9" 
                alt="Pradeep Chandra" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-3 w-48 bg-white border border-slate-200 rounded-lg shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
              <button 
                onClick={() => setIsDropdownOpen(false)} 
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400" />
                Profile Settings
              </button>
              <div className="h-px bg-slate-100 my-1" />
              <button 
                onClick={handleLogout} 
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
              >
                <LogOut className="w-4 h-4 text-red-500" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
