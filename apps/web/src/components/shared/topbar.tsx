"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, HelpCircle, LogOut, User, Loader2, Monitor, Users, Calendar, LayoutDashboard, Clock, BookOpen, ShieldCheck, History, Network, CheckSquare, MessageSquare, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { useDebounce } from '@/hooks/use-debounce';
import { apiClient } from '@/lib/api/client';

const IconMap: Record<string, React.ElementType> = {
  Monitor, Users, Calendar, LayoutDashboard, Clock, BookOpen, 
  ShieldCheck, History, Network, CheckSquare, MessageSquare, UserPlus, User, Search
};

export function Topbar() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const accessToken = useAuthStore((state) => state.accessToken);
  const role = useAuthStore((state) => state.role);
  const photoUrl = useAuthStore((state) => state.photoUrl);

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

  // --- Search Logic ---
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
        setTimeout(() => inputRef.current?.focus(), 10);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    function handleClickOutsideSearch(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutsideSearch);
    return () => document.removeEventListener("mousedown", handleClickOutsideSearch);
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      if (!debouncedQuery || debouncedQuery.length < 2) {
        setResults([]);
        return;
      }
      setLoading(true);
      try {
        const response = await apiClient.get(`/search?q=${encodeURIComponent(debouncedQuery)}`);
        const searchData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setResults(searchData);
        setSelectedIndex(0);
      } catch (e) {
        console.error('Search failed', e);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };
    if (isSearchOpen) {
      fetchResults();
    }
  }, [debouncedQuery, isSearchOpen]);

  const handleAction = (result: any) => {
    if (result.actionType === 'NAVIGATE' && result.route) {
      router.push(result.route);
    }
    setIsSearchOpen(false);
    setQuery('');
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isSearchOpen) {
      setIsSearchOpen(true);
    }
    if (e.key === 'Escape') {
      setIsSearchOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : prev));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0) {
        handleAction(results[selectedIndex]);
      }
    }
  };

  return (
    // pl-14 on mobile to leave room for the fixed hamburger button (lg:pl-8 resets it)
    <header className="h-14 sm:h-[72px] pl-14 lg:pl-8 pr-4 sm:pr-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 sticky top-0 z-40 transition-colors">
      {/* Search Bar */}
      <div className="hidden sm:flex flex-1 max-w-2xl relative" ref={searchContainerRef}>
        <div 
          className="relative flex items-center w-full h-10 rounded-lg bg-slate-100/80 dark:bg-slate-900/80 px-3 text-slate-500 dark:text-slate-400 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500 border border-transparent transition-all shadow-sm"
          onClick={() => {
            setIsSearchOpen(true);
            inputRef.current?.focus();
          }}
        >
          <Search className="w-4 h-4 mr-2.5 flex-shrink-0 text-slate-400" />
          <input
            ref={inputRef}
            type="text"
            className="flex-1 bg-transparent border-none focus:outline-none text-sm text-slate-900 dark:text-white placeholder:text-slate-400 font-medium"
            placeholder="Search employees, reports, or modules..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            onKeyDown={handleSearchKeyDown}
          />
          {loading ? (
            <Loader2 className="w-4 h-4 ml-2 animate-spin text-slate-400" />
          ) : (
            <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 ml-2 text-[10px] font-bold text-slate-400 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded shadow-sm pointer-events-none">
              <span className="mr-0.5">⌘</span>K
            </kbd>
          )}
        </div>

        {/* Search Dropdown */}
        {isSearchOpen && (query.length >= 2 || results.length > 0) && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden z-50 flex flex-col max-h-[60vh]">
            <div className="flex-1 overflow-y-auto p-2">
              {query.length >= 2 && !loading && results.length === 0 && (
                <div className="p-8 flex flex-col items-center justify-center text-center">
                  <Search className="w-8 h-8 text-slate-300 mb-3" />
                  <p className="text-slate-900 dark:text-white font-medium text-sm">No results found</p>
                  <p className="text-slate-500 text-xs mt-1">Try a different keyword</p>
                </div>
              )}

              {results.length > 0 && (
                <div className="space-y-1">
                  {results.map((item, idx) => {
                    const Icon = IconMap[item.icon] || Search;
                    const isSelected = idx === selectedIndex;
                    
                    return (
                      <button
                        key={item.id}
                        onClick={() => handleAction(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={`w-full flex items-center p-3 rounded-lg transition-colors text-left ${
                          isSelected 
                            ? 'bg-blue-50 dark:bg-blue-900/20 ring-1 ring-blue-500/20' 
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-md flex items-center justify-center flex-shrink-0 ${
                          isSelected ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        
                        <div className="ml-3 flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`text-sm font-bold truncate ${isSelected ? 'text-blue-700 dark:text-blue-300' : 'text-slate-900 dark:text-white'}`}>
                              {item.title}
                            </span>
                            <span className="px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase bg-slate-100 dark:bg-slate-800 text-slate-500 rounded">
                              {item.category}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-slate-500 truncate">
                            <span className="font-semibold text-slate-400">{item.parentModule}</span>
                            <span>•</span>
                            <span className="truncate">{item.description}</span>
                          </div>
                        </div>

                        {isSelected && (
                          <div className="ml-3 hidden sm:flex items-center">
                            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded">
                              Enter
                            </span>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Mobile: show only icon search button */}
      <div className="flex sm:hidden items-center">
        <button 
          onClick={() => {
            setIsSearchOpen(!isSearchOpen);
            setTimeout(() => inputRef.current?.focus(), 10);
          }}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Search className="w-5 h-5" />
        </button>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3 sm:gap-6 ml-auto">
        <div className="flex items-center gap-2 sm:gap-4 text-slate-600 dark:text-slate-400">
          <button onClick={() => {}} className="hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none">
            <Bell className="w-5 h-5" />
          </button>
          <button onClick={() => {}} className="hidden sm:block hover:text-slate-900 dark:hover:text-white transition-colors focus:outline-none">
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
                className="w-full text-left px-4 py-2.5 text-sm font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white flex items-center gap-2 transition-colors"
              >
                <User className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                Profile Settings
              </button>
              <div className="h-px bg-slate-100 dark:bg-slate-800 my-1 transition-colors" />
              <button 
                onClick={handleLogout} 
                className="w-full text-left px-4 py-2.5 text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 flex items-center gap-2 transition-colors"
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
