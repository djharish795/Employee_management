import React from 'react';
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
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className={`h-2 ${secondsElapsed >= 32400 ? 'bg-emerald-500' : 'bg-amber-500'}`} />
        <div className="p-6">
          <div className="flex items-start gap-4 mb-2">
            <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${secondsElapsed >= 32400 ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
              {secondsElapsed >= 32400 ? <CheckCircle2 className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mt-1">
                {secondsElapsed >= 32400 ? "9 Hours Completed!" : "Checking Out Early?"}
              </h3>
              <p className="text-sm font-semibold text-slate-500 mt-1.5 leading-relaxed">
                {secondsElapsed >= 32400 
                  ? "You have successfully met your 9-hour daily requirement. Great job today! Are you ready to log off?" 
                  : `You have only logged ${formatTimerValue(secondsElapsed)}. Checking out now means you will need to make up this time later to hit your 45-hour weekly goal.`}
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end mt-8">
            <button 
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={onConfirm}
              disabled={isPending}
              className={`px-5 py-2.5 rounded-lg text-xs font-bold text-white transition-colors flex items-center gap-2 ${
                secondsElapsed >= 32400 
                  ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20 shadow-lg" 
                  : "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20 shadow-lg"
              }`}
            >
              <Square className="w-3.5 h-3.5" /> {secondsElapsed >= 32400 ? "Confirm Check Out" : "Check Out Anyway"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
