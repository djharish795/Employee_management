"use client";

import React, { useState, useEffect } from "react";
import { Joyride, EventData, STATUS, Step, TooltipRenderProps } from "react-joyride";
import { useAuthStore } from "@/store/auth";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Map, UserCircle, BarChart3, Zap, X, ChevronRight, ChevronLeft } from "lucide-react";

// Custom Tooltip Component for Joyride
const CustomTooltip = ({
  index,
  step,
  skipProps,
  primaryProps,
  backProps,
  tooltipProps,
  isLastStep,
}: TooltipRenderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="bg-white/95 backdrop-blur-xl border border-slate-200/60 shadow-2xl rounded-2xl p-5 max-w-[340px] w-full font-sans relative overflow-hidden"
      {...tooltipProps}
    >
      {/* Decorative gradient blur */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

      {step.title && (
        <h3 className="font-bold text-lg text-slate-900 mb-2 relative z-10">{step.title}</h3>
      )}
      
      <div className="text-sm font-medium text-slate-600 leading-relaxed mb-6 relative z-10">
        {step.content}
      </div>

      <div className="flex items-center justify-between mt-4 relative z-10">
        <button
          {...skipProps}
          className="text-[13px] font-bold text-slate-400 hover:text-slate-600 transition-colors px-2 py-1"
        >
          Skip Tour
        </button>

        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              {...backProps}
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          
          <button
            {...primaryProps}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5"
          >
            {isLastStep ? "Finish" : "Next"}
            {!isLastStep && <ChevronRight className="w-3 h-3" />}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default function WelcomeTour() {
  const { isFirstLogin, employeeId } = useAuthStore();
  const [showWelcome, setShowWelcome] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // If not their first login ever, don't show
    if (!employeeId || !isFirstLogin) return;
    
    // Also check local storage in case they skipped/completed it during this first login session
    const tourKey = `naprocs_tour_v2_completed_${employeeId}`;
    const hasSeenTour = localStorage.getItem(tourKey);
    
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setShowWelcome(true);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [employeeId, isFirstLogin]);

  const handleSkip = () => {
    if (!employeeId) return;
    localStorage.setItem(`naprocs_tour_v2_completed_${employeeId}`, "true");
    setShowWelcome(false);
  };

  const handleStartTour = () => {
    setShowWelcome(false);
    setTimeout(() => {
      setRunTour(true);
    }, 400); // wait for modal exit animation
  };

  const handleJoyrideCallback = (data: EventData) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      if (employeeId) {
        localStorage.setItem(`naprocs_tour_v2_completed_${employeeId}`, "true");
      }
    }
  };

  const steps: Step[] = [
    {
      target: "body",
      content: (
        <div className="space-y-3">
          <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-black text-xl text-slate-900 tracking-tight">Let's look around!</h3>
          <p className="text-sm text-slate-500 font-medium leading-relaxed">We've built this dashboard to be fast, beautiful, and easy to use. Here's a quick 4-step overview.</p>
        </div>
      ),
      placement: "center",
      skipBeacon: true,
    },
    {
      target: "#tour-sidebar",
      content: (
        <div>
          <div className="flex items-center gap-2 mb-2 text-sky-600 font-bold">
            <Map className="w-4 h-4" /> Navigation Hub
          </div>
          <p>Access all your modules—Attendance, Leaves, and Assets—right from this sidebar.</p>
        </div>
      ),
      placement: "right",
    },
    {
      target: "#tour-profile-menu",
      content: (
        <div>
          <div className="flex items-center gap-2 mb-2 text-indigo-600 font-bold">
            <UserCircle className="w-4 h-4" /> Profile & Settings
          </div>
          <p>Manage your account settings, view your profile, or securely log out here.</p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: "#tour-dashboard-stats",
      content: (
        <div>
          <div className="flex items-center gap-2 mb-2 text-emerald-600 font-bold">
            <BarChart3 className="w-4 h-4" /> Live Metrics
          </div>
          <p>Your key statistics and daily status update in real-time right at the top.</p>
        </div>
      ),
      placement: "bottom",
    },
    {
      target: "#tour-quick-actions",
      content: (
        <div>
          <div className="flex items-center gap-2 mb-2 text-amber-600 font-bold">
            <Zap className="w-4 h-4" /> Quick Actions
          </div>
          <p>Need to apply for a leave or check pending tasks? These quick action cards have you covered.</p>
        </div>
      ),
      placement: "left",
    }
  ];

  if (!isClient) return null;

  return (
    <>
      {/* ── Welcome Full-Screen Overlay ── */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: -20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-white/90 backdrop-blur-2xl border border-white/60 shadow-[0_0_100px_rgba(0,0,0,0.1)] rounded-[2rem] p-10 max-w-lg w-[90%] text-center overflow-hidden"
            >
              {/* Premium Glow Effects */}
              <div className="absolute -top-32 -left-32 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-sky-500/20 rounded-full blur-3xl pointer-events-none" />

              <motion.button
                onClick={handleSkip}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors z-10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="w-5 h-5" />
              </motion.button>
              
              <motion.div 
                initial={{ rotate: -10, scale: 0.5 }}
                animate={{ rotate: 3, scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className="relative z-10 w-20 h-20 bg-gradient-to-tr from-sky-400 via-indigo-500 to-purple-600 rounded-[1.25rem] mx-auto flex items-center justify-center shadow-lg shadow-indigo-500/30 mb-8"
              >
                <span className="text-4xl text-white font-black drop-shadow-md">N</span>
              </motion.div>
              
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative z-10 text-[32px] font-black text-slate-900 tracking-tight mb-4"
              >
                Welcome aboard!
              </motion.h2>
              
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative z-10 text-[15px] font-medium text-slate-500 mb-10 leading-relaxed max-w-[90%] mx-auto"
              >
                We're thrilled to have you here at Naprocs. Your new Employee Management Portal is designed to make everything from tracking attendance to applying for leaves beautifully simple. 
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="relative z-10 flex flex-col sm:flex-row items-center gap-4 justify-center"
              >
                <button 
                  onClick={handleSkip}
                  className="w-full sm:w-auto px-6 py-3.5 text-[14px] font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100/80 rounded-2xl transition-all"
                >
                  Skip for now
                </button>
                <button 
                  onClick={handleStartTour}
                  className="group relative w-full sm:w-auto px-8 py-3.5 text-[14px] font-bold text-white bg-slate-900 rounded-2xl shadow-xl shadow-slate-900/20 hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-0.5 transition-all overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                  <span className="relative z-10">Start Quick Tour ✨</span>
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Joyride Tutorial ── */}
      {runTour && (
        <Joyride
          steps={steps}
          run={runTour}
          continuous={true}
          onEvent={handleJoyrideCallback}
          tooltipComponent={CustomTooltip}
          options={{
            primaryColor: '#0f172a',
            zIndex: 1000,
            showProgress: false,
            arrowColor: '#ffffff',
          }}
          styles={{
            beaconInner: {
              backgroundColor: '#6366f1',
            },
            beaconOuter: {
              backgroundColor: 'rgba(99, 102, 241, 0.4)',
              borderColor: 'rgba(99, 102, 241, 0.8)',
            }
          }}
        />
      )}
    </>
  );
}
