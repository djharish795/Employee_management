"use client";

import React, { useState } from 'react';
import { Bell, HelpCircle, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Image from "next/image";

export default function PerformanceInputPage() {
  const [rating1, setRating1] = useState(0);
  const [rating2, setRating2] = useState(0);

  return (
    <div className="flex-1 w-full bg-slate-50 min-h-screen flex flex-col font-sans">
      
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <button className="text-slate-500 hover:text-slate-900 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">Performance Input - Karthik R.</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="text-slate-500 hover:text-slate-700 transition-colors">
            <Bell className="w-5 h-5" />
          </button>
          <button className="text-slate-500 hover:text-slate-700 transition-colors">
            <HelpCircle className="w-5 h-5" />
          </button>
          <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center text-white text-xs font-bold overflow-hidden shadow-sm">
            <Image src="https://i.pravatar.cc/100?img=11" alt="AT" className="w-full h-full object-cover" fill style={{ objectFit: "cover" }} />
          </div>
        </div>
      </header>

      {/* Warning Banner */}
      <div className="bg-orange-50 border-b border-orange-200 px-6 py-3 flex items-center gap-2 text-sm font-semibold text-orange-800">
        <Lock className="w-4 h-4" />
        Team Lead Access: This performance module is currently in preview mode. Submission will be enabled in Phase 2.
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Employee Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-900 flex items-center justify-center text-white text-xl font-bold shadow-md">
                KR
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900">Karthik R.</h2>
                <p className="text-sm font-medium text-slate-500 mt-0.5">Software Engineer • Backend</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Input Period</p>
              <p className="text-base font-bold text-slate-900">January 2025</p>
            </div>
          </div>

          {/* Input Form */}
          <div className="bg-white border border-slate-200 rounded-xl p-8 shadow-sm">
            
            <div className="space-y-8">
              {/* Rating 1 */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Task delivery</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">Timeliness and quality of assigned tickets</p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      onClick={() => setRating1(star)}
                      className={`transition-colors p-1 ${rating1 >= star ? 'text-slate-900' : 'text-slate-300 hover:text-slate-400'}`}
                    >
                      <StarIcon filled={rating1 >= star} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Rating 2 */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900">Technical Excellence</h3>
                  <p className="text-xs font-medium text-slate-500 mt-1">Code quality and architectural contributions</p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button 
                      key={star}
                      onClick={() => setRating2(star)}
                      className={`transition-colors p-1 ${rating2 >= star ? 'text-slate-900' : 'text-slate-300 hover:text-slate-400'}`}
                    >
                      <StarIcon filled={rating2 >= star} />
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Area */}
              <div>
                <h3 className="font-bold text-slate-900 mb-3">Qualitative Feedback</h3>
                <textarea 
                  className="w-full bg-white border border-slate-300 rounded-xl p-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent resize-none h-32 shadow-sm"
                  placeholder="Provide specific examples of performance..."
                ></textarea>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-end gap-4">
              <button className="text-sm font-bold text-slate-600 hover:text-slate-900 transition-colors">
                Save Draft
              </button>
              <Button disabled className="bg-slate-900 text-white font-bold px-6 py-2 rounded-lg opacity-90">
                Submit input
              </Button>
            </div>
            
          </div>
        </div>
      </div>

    </div>
  );
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 24 24" 
      className="w-7 h-7"
      fill={filled ? "currentColor" : "none"} 
      stroke="currentColor" 
      strokeWidth={filled ? "0" : "2"}
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
    </svg>
  );
}
