import { Metadata } from "next";
import { Lock, Wifi, ShieldCheck, Laptop } from "lucide-react";
import { Button } from "../../components/ui/button";

export const metadata: Metadata = { 

  
  title: "Access Restricted | Naprocs EMS",
  description: "Naprocs EMS is only accessible from within the corporate VPC network or VPN.",
};

export default function AccessRestrictedPage() {
  return (
    <div className="flex flex-col justify-between w-full h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-8 py-4 bg-white border-b border-slate-100 select-none">
        <div className="flex items-center space-x-2">
          <span className="font-bold text-base tracking-wider text-slate-800">
            Naprocs EMS
          </span>
        </div>
        <span className="text-xs font-semibold text-slate-400 font-mono uppercase tracking-wider">
          Security Protocol v4.2
        </span>
      </header>

      {/* Main Card Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-[500px] bg-white border border-slate-100 rounded-2xl shadow-sm p-8 text-center">
          {/* Padlock Icon */}
          <div className="flex items-center justify-center mx-auto mb-6 w-14 h-14 bg-slate-100 text-slate-700 border border-slate-200/50 rounded-full">
            <Lock className="w-6 h-6" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Access restricted
          </h2>
          <p className="text-sm text-slate-500 mt-2.5 font-medium leading-relaxed px-4">
            Naprocs EMS is only accessible from the company network or VPN.
          </p>

          {/* Requirements Box */}
          <div className="mt-8 p-5 border border-slate-150 bg-slate-50/50 rounded-xl text-left">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              Requirements to access:
            </h3>
            <ul className="space-y-3.5">
              <li className="flex items-center space-x-3 text-slate-600">
                <Wifi className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                <span className="text-sm font-medium">
                  Connect to Naprocs office network
                </span>
              </li>
              <li className="flex items-center space-x-3 text-slate-600">
                <ShieldCheck className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                <span className="text-sm font-medium">
                  Connect to company VPN
                </span>
              </li>
              <li className="flex items-center space-x-3 text-slate-600">
                <Laptop className="w-4.5 h-4.5 text-blue-500 shrink-0" />
                <span className="text-sm font-medium">Use a registered device</span>
              </li>
            </ul>
          </div>

          {/* Actions */}
          <div className="mt-8 flex flex-col gap-3">
            <Button className="w-full text-sm font-semibold tracking-wide bg-slate-900 hover:bg-slate-800 text-white shadow-none">
              {"I'm connected — try again"}
            </Button>
            <button
              type="button"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors py-1 block"
            >
              Contact IT support
            </button>
          </div>
        </div>
      </main>

      {/* Bottom Footer Bar */}
      <footer className="flex flex-col sm:flex-row items-center justify-between px-8 py-5 bg-white border-t border-slate-100 text-[11px] font-semibold text-slate-400 select-none">
        <div className="mb-2 sm:mb-0">
          Naprocs EMS <span className="font-normal text-slate-300">|</span> © 2024
          Naprocs EMS. Internal Enterprise Use Only.
        </div>
        <div className="flex items-center space-x-4">
          <a href="#" className="hover:text-slate-600 transition-colors">
            Security Standards
          </a>
          <a href="#" className="hover:text-slate-600 transition-colors">
            Legal Policy
          </a>
          <a href="#" className="hover:text-slate-600 transition-colors">
            Privacy
          </a>
          <a href="#" className="hover:text-slate-600 transition-colors">
            Support
          </a>
        </div>
      </footer>
    </div>
  );
}
