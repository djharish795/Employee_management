import { Laptop } from "lucide-react";

export function MobileBlocker() {
  return (
    <div className="fixed inset-0 z-[9999] bg-slate-50 flex flex-col items-center justify-center p-6 text-center md:hidden">
      <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-200 flex items-center justify-center mb-6">
        <Laptop className="w-10 h-10 text-slate-700" />
      </div>
      <h2 className="text-[22px] font-bold text-slate-900 tracking-tight mb-3">
        Desktop Experience Required
      </h2>
      <p className="text-[15px] text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
        We're currently perfecting the mobile version of the Naprocs Portal. For now, please access the platform from a desktop or laptop device for the best experience.
      </p>
    </div>
  );
}
