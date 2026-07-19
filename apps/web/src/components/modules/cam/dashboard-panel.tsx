"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  UserPlus, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  AlertCircle, 
  ChevronRight, 
  ChevronDown,
  RefreshCw, 
  Share2, 
  Play, 
  Download,
  ExternalLink,
  CheckCircle2,
  Clock
} from 'lucide-react';

import { PersonalAttendanceWidget } from '@/components/shared/personal-attendance-widget';

export default function CamDashboardPanel() {
  const [filterStatus, setFilterStatus] = useState('ALL STATUS');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Current formatted date
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full font-sans pb-10">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight">Today's Work</h1>
          <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-1">
            Workflow snapshot for {todayFormatted}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 text-xs font-bold capitalize tracking-wide text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
            <Download className="w-4 h-4 text-slate-500" /> Export Report
          </button>

        </div>
      </div>

      <PersonalAttendanceWidget />

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight w-24">
              New Leads Assigned
            </span>
            <UserPlus className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">12</h3>
        </div>

        {/* KPI 2 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight w-24">
              Follow-ups Due
            </span>
            <Phone className="w-4.5 h-4.5 text-slate-400 transform -rotate-90" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">28</h3>
        </div>

        {/* KPI 3 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight w-24">
              Meetings Scheduled
            </span>
            <Calendar className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">06</h3>
        </div>

        {/* KPI 4 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all">
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider leading-tight w-24">
              Qualified for CRM
            </span>
            <ShieldCheck className="w-5 h-5 text-slate-400" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">04</h3>
        </div>

        {/* KPI 5 */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col justify-between hover:border-slate-300 transition-all col-span-2 lg:col-span-1">
          <div className="flex justify-between items-start mb-4">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider leading-tight w-24">
              Overdue Actions
            </span>
            <AlertCircle className="w-5 h-5 text-slate-500" />
          </div>
          <h3 className="text-3xl font-black text-slate-900 tracking-tight">09</h3>
        </div>
      </div>

      {/* Main Grid Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Action Required & Full-width Meetings) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Action Required Card */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Action Required</h2>
              <div className="relative">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500">
                  <span>FILTER BY:</span>
                  <button 
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                    className="text-slate-900 font-semibold flex items-center gap-1 hover:text-slate-700 transition-colors uppercase"
                  >
                    {filterStatus} <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
                
                {showFilterDropdown && (
                  <div className="absolute right-0 mt-2 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 w-44 font-semibold text-xs text-slate-700">
                    {['ALL STATUS', 'INITIAL DISCOVERY', 'QUALIFIED', 'EXPLORATORY', 'MEETING SET'].map(status => (
                      <button 
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setShowFilterDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-slate-50 transition-colors"
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 capitalize bg-slate-50/50">
                    <th className="py-4 px-6">Lead Name</th>
                    <th className="py-4 px-3">Company</th>
                    <th className="py-4 px-3 text-center">Current Stage</th>
                    <th className="py-4 px-3">Next Action</th>
                    <th className="py-4 px-3">Due Date</th>
                    <th className="py-4 px-6 text-right">Priority</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                  {/* Lead 1 */}
                  <tr className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6">
                      <button className="text-left font-bold text-slate-900 hover:text-slate-700 hover:underline flex items-center gap-1.5">
                        Robert Chen
                        <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>
                    <td className="py-4 px-3 text-slate-500 font-medium">Aether Logistics Corp</td>
                    <td className="py-4 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold capitalize tracking-wide">
                        Initial Discovery
                      </span>
                    </td>
                    <td className="py-4 px-3 font-bold text-slate-900">Technical Specs Review</td>
                    <td className="py-4 px-3">
                      <span className="text-slate-900 font-bold">10:00 AM (Overdue)</span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-block px-2.5 py-0.5 bg-slate-900 text-white rounded text-[9px] font-bold tracking-wider uppercase border border-slate-900">
                        High
                      </span>
                    </td>
                  </tr>

                  {/* Lead 2 */}
                  <tr className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6">
                      <button className="text-left font-bold text-slate-900 hover:text-slate-700 hover:underline flex items-center gap-1.5">
                        Elena Markova
                        <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>
                    <td className="py-4 px-3 text-slate-500 font-medium">Stratos Cloud Systems</td>
                    <td className="py-4 px-3 text-center">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded text-[9px] font-bold capitalize tracking-wide border border-slate-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span> Qualified
                      </span>
                    </td>
                    <td className="py-4 px-3 font-medium text-slate-600">CRM Export Confirmation</td>
                    <td className="py-4 px-3 text-slate-500 font-medium">02:30 PM</td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] font-bold tracking-wider uppercase border border-slate-200">
                        Med
                      </span>
                    </td>
                  </tr>

                  {/* Lead 3 */}
                  <tr className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6">
                      <button className="text-left font-bold text-slate-900 hover:text-slate-700 hover:underline flex items-center gap-1.5">
                        David Jenkins
                        <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>
                    <td className="py-4 px-3 text-slate-500 font-medium">Mainframe Solutions Ltd</td>
                    <td className="py-4 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-bold capitalize tracking-wide">
                        Exploratory
                      </span>
                    </td>
                    <td className="py-4 px-3 font-medium text-slate-600">Follow up Call</td>
                    <td className="py-4 px-3 text-slate-500 font-medium">04:00 PM</td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-block px-2.5 py-0.5 bg-slate-50 text-slate-600 rounded text-[9px] font-bold tracking-wider uppercase border border-slate-200">
                        Low
                      </span>
                    </td>
                  </tr>

                  {/* Lead 4 */}
                  <tr className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6">
                      <button className="text-left font-bold text-slate-900 hover:text-slate-700 hover:underline flex items-center gap-1.5">
                        Sarah Miller
                        <ExternalLink className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </button>
                    </td>
                    <td className="py-4 px-3 text-slate-500 font-medium">Apex Global</td>
                    <td className="py-4 px-3 text-center">
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded text-[9px] font-bold capitalize tracking-wide border border-slate-200">
                        Meeting Set
                      </span>
                    </td>
                    <td className="py-4 px-3 font-medium text-slate-600">Prepare Slide Deck</td>
                    <td className="py-4 px-3 text-slate-900 font-bold">Tomorrow</td>
                    <td className="py-4 px-6 text-right">
                      <span className="inline-block px-2.5 py-0.5 bg-slate-900 text-white rounded text-[9px] font-bold tracking-wider uppercase border border-slate-900">
                        High
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bottom Actions Link */}
            <div className="py-4 text-center border-t border-slate-100 bg-slate-50/30">
              <button className="inline-flex items-center gap-1 text-xs font-bold capitalize tracking-wide text-slate-500 hover:text-slate-800 transition-colors">
                View All Active Tasks <ChevronDown className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>

          {/* Today's Meetings Card (Full Width Section Below Action Required) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 flex items-center justify-between border-b border-slate-100 bg-white">
              <h2 className="text-base font-bold text-slate-900">Today's Meetings</h2>
              <span className="text-xs font-semibold text-slate-500 capitalize">
                6 Sessions Scheduled
              </span>
            </div>

            {/* Meetings Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 text-xs font-semibold text-slate-500 capitalize bg-slate-50/50">
                    <th className="py-4 px-6">Client / Entity</th>
                    <th className="py-4 px-3">Time</th>
                    <th className="py-4 px-3">Meeting Type</th>
                    <th className="py-4 px-3">Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs font-semibold text-slate-800">
                  {/* Meeting 1 */}
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">Horizon Ventures</div>
                      <div className="text-[10px] font-medium text-slate-400 mt-0.5">Marcus Aurelius</div>
                    </td>
                    <td className="py-4 px-3 text-slate-900 font-bold">11:00 - 11:45</td>
                    <td className="py-4 px-3 text-slate-500 font-medium">Stakeholder Alignment</td>
                    <td className="py-4 px-3">
                      <span className="inline-block px-2.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-200 rounded text-[9px] font-bold capitalize tracking-wide">
                        Confirmed
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                        Join
                      </button>
                    </td>
                  </tr>

                  {/* Meeting 2 */}
                  <tr className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">Kinetix Group</div>
                      <div className="text-[10px] font-medium text-slate-400 mt-0.5">Sarah Connor</div>
                    </td>
                    <td className="py-4 px-3 text-slate-900 font-bold">13:00 - 13:30</td>
                    <td className="py-4 px-3 text-slate-500 font-medium">Discovery Call</td>
                    <td className="py-4 px-3">
                      <span className="inline-block px-2.5 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded text-[9px] font-bold capitalize tracking-wide">
                        Pending Prep
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button className="px-4 py-1.5 text-[10px] font-bold tracking-widest uppercase text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors shadow-sm">
                        Prepare
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Sidebar Widgets */}
        <div className="space-y-6">
          
          {/* Requirement Status Card (New Widget) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Requirement Status</span>
              <span className="text-[9px] font-bold text-slate-400 capitalize tracking-wide">Active Specs</span>
            </h2>
            
            <div className="grid grid-cols-1 gap-3">
              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-400"></div>
                  <span className="text-xs font-bold text-slate-700">Requirements In Progress</span>
                </div>
                <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">14</span>
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-600 animate-pulse"></div>
                  <span className="text-xs font-bold text-slate-700">Awaiting Approval</span>
                </div>
                <span className="text-xs font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">05</span>
              </div>

              <div className="flex items-center justify-between p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors bg-white shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-slate-900"></div>
                  <span className="text-xs font-bold text-slate-700">Requirements Approved</span>
                </div>
                <span className="text-xs font-bold text-white bg-slate-900 px-2.5 py-0.5 rounded">28</span>
              </div>
            </div>
          </div>

          {/* Client Waiting Too Long Card (New Widget) */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-955 pb-2 border-b border-slate-100 flex items-center justify-between">
              <span>Client Waiting Too Long</span>
              <span className="text-[9px] font-bold text-slate-400 capitalize tracking-wide">Follow Up Alert</span>
            </h2>
            
            <div className="space-y-3">
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5 hover:border-slate-350 transition-all bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-900">Lumina Dynamics</h4>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">Contact: Alex Rivera</p>
                  </div>
                  <span className="text-[9px] font-bold capitalize tracking-wide text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Waiting 9 Days
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400">Last touch: Oct 08</span>
                  <button className="px-3 py-1 text-[9px] font-bold tracking-wider uppercase text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors">
                    Send Follow Up
                  </button>
                </div>
              </div>

              <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-2.5 hover:border-slate-350 transition-all bg-white shadow-sm">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-955">Mainframe Solutions Ltd</h4>
                    <p className="text-[10px] font-medium text-slate-500 mt-0.5">Contact: David Jenkins</p>
                  </div>
                  <span className="text-[9px] font-bold capitalize tracking-wide text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                    Waiting 7 Days
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-semibold text-slate-400">Last touch: Oct 10</span>
                  <button className="px-3 py-1 text-[9px] font-bold tracking-wider uppercase text-slate-700 bg-white border border-slate-200 rounded hover:bg-slate-50 transition-colors">
                    Schedule Sync
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Ready For CRM Assignment */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Ready For CRM Assignment
            </h2>
            
            <div className="space-y-3">
              {/* Card Item 1 */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:border-slate-300 transition-all bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">James Wilson</h4>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">CyberDyne Systems</p>
                  </div>
                  <span className="text-[9px] font-bold capitalize tracking-wide text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Urgent
                  </span>
                </div>

                <div className="text-[10px] space-y-1 text-slate-500 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div><span className="font-bold text-slate-700">Qualified By:</span> Sarah Jenkins (CAM)</div>
                  <div><span className="font-bold text-slate-700">Qualified Date:</span> Oct 23, 2023</div>
                </div>
                
                <div className="flex items-center justify-end mt-1 pt-2 border-t border-slate-100">
                  <button className="px-3.5 py-1.5 text-[10px] font-bold tracking-wider uppercase text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors">
                    Assign To CRM
                  </button>
                </div>
              </div>

              {/* Card Item 2 */}
              <div className="border border-slate-200 rounded-xl p-4 flex flex-col gap-3 hover:border-slate-300 transition-all bg-white">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">Maria Garcia</h4>
                    <p className="text-[11px] font-medium text-slate-500 mt-0.5">Initech Corp</p>
                  </div>
                  <span className="text-[9px] font-bold capitalize tracking-wide text-slate-400 bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
                    Med
                  </span>
                </div>

                <div className="text-[10px] space-y-1 text-slate-500 font-medium bg-slate-50 p-2 rounded-lg border border-slate-100">
                  <div><span className="font-bold text-slate-700">Qualified By:</span> Sarah Jenkins (CAM)</div>
                  <div><span className="font-bold text-slate-700">Qualified Date:</span> Oct 24, 2023</div>
                </div>
                
                <div className="flex items-center justify-end mt-1 pt-2 border-t border-slate-100">
                  <button className="px-3.5 py-1.5 text-[10px] font-bold tracking-wider uppercase text-white bg-slate-900 rounded hover:bg-slate-800 transition-colors">
                    Assign To CRM
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900 pb-2 border-b border-slate-100">
              Recent Activity
            </h2>

            <div className="relative pl-2 border-l border-slate-100 ml-2.5 space-y-6 py-2">
              {/* Activity Item 1 */}
              <div className="relative pl-6">
                <div className="absolute -left-[14.5px] top-0.5 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center border-4 border-white shadow-sm">
                  <Share2 className="w-2.5 h-2.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 leading-snug">
                    New lead <span className="text-slate-900 font-semibold">'Titan Dynamics'</span> assigned via Automation
                  </p>
                  <span className="inline-block text-[10px] font-medium text-slate-400 mt-1">
                    08:42 AM
                  </span>
                </div>
              </div>

              {/* Activity Item 2 */}
              <div className="relative pl-6">
                <div className="absolute -left-[14.5px] top-0.5 w-6 h-6 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center border-4 border-white shadow-sm">
                  <Calendar className="w-2.5 h-2.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 leading-snug">
                    Meeting with Robert Chen rescheduled
                  </p>
                  <span className="inline-block text-[10px] font-medium text-slate-400 mt-1">
                    09:15 AM
                  </span>
                </div>
              </div>

              {/* Activity Item 3 */}
              <div className="relative pl-6">
                <div className="absolute -left-[14.5px] top-0.5 w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center border-4 border-white shadow-sm">
                  <ShieldCheck className="w-2.5 h-2.5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-700 leading-snug">
                    Lead <span className="text-slate-900 font-semibold">'Elena Markova'</span> marked as Qualified
                  </p>
                  <span className="inline-block text-[10px] font-medium text-slate-400 mt-1">
                    10:05 AM
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pending CRM Acceptance Card */}
          <div className="bg-white text-slate-900 rounded-xl shadow-md p-5 flex items-center justify-between border border-slate-200">
            <div>
              <p className="text-xs font-semibold text-slate-500 capitalize">
                Pending CRM Acceptance
              </p>
              <h4 className="text-sm font-bold text-slate-900 mt-1 flex items-center gap-1.5">
                3 Leads Waiting For CRM Acceptance
              </h4>
            </div>
            <button className="w-8 h-8 rounded-full border border-slate-700 flex items-center justify-center hover:bg-slate-800 hover:text-white text-slate-300 transition-colors shadow-inner">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
