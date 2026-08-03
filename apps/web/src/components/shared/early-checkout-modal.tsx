"use client";

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, ShieldAlert, Square } from 'lucide-react';

interface EarlyCheckoutModalProps {
  secondsElapsed: number;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPending: boolean;
}

export function formatTimerValue(totalSeconds: number) {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function EarlyCheckoutModal({ secondsElapsed, isOpen, onClose, onConfirm, isPending }: EarlyCheckoutModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className={`h-2 ${secondsElapsed >= 32341 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${secondsElapsed >= 32341 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              {secondsElapsed >= 32341 ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {secondsElapsed >= 32341 ? "9 Hours Completed!" : "Checking Out Early?"}
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                {secondsElapsed >= 32341 
                  ? "You have completed your required shift hours for today." 
                  : "You are checking out before completing 9 hours."}
              </p>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg border border-slate-100 p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Current Session Time</span>
              <span className="text-lg font-mono font-bold text-slate-900">{formatTimerValue(secondsElapsed)}</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 mb-6">
            {secondsElapsed >= 32341 
              ? "Are you sure you want to end your shift and check out now?" 
              : "Checking out now will mark today's attendance as 'Early Checkout'. Are you sure?"}
          </p>

          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isPending}
              className="px-4 py-2 text-sm font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isPending}
              className={`flex items-center gap-2 px-5 py-2 text-sm font-bold text-white rounded-lg transition-colors shadow-sm disabled:opacity-50 ${
                secondsElapsed >= 32341 
                  ? 'bg-emerald-600 hover:bg-emerald-700' 
                  : 'bg-amber-600 hover:bg-amber-700'
              }`}
            >
              <Square className="w-3.5 h-3.5" /> {secondsElapsed >= 32341 ? "Confirm Check Out" : "Check Out Anyway"}
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
