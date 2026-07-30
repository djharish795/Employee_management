"use client";

import React, { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useAuthStore } from "@/store/auth";
import { useUiStore } from "@/store/ui";

const Joyride = dynamic(() => import("react-joyride").then(mod => mod.Joyride), { ssr: false });
import { 
  motion, AnimatePresence, Variants, 
  useMotionValue, useSpring, useTransform, useMotionTemplate 
} from "framer-motion";
import { 
  Sparkles, Map, UserCircle, BarChart3, Zap, X, 
  ChevronRight, ChevronLeft, CalendarClock, Briefcase, HandCoins, ArrowRight 
} from "lucide-react";

// --- Minimal Framer Motion Variants for Modals ---
const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } }
};

const exitVariants: Variants = {
  hidden: { opacity: 0, scale: 0.9, y: -20 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 25 } 
  },
  exit: { opacity: 0, scale: 0.95, z: -100, transition: { duration: 0.3 } }
};

const listContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.3 }
  }
};

const listItemVariants: Variants = {
  hidden: { opacity: 0, x: -10, z: -20 },
  visible: { opacity: 1, x: 0, z: 0, transition: { type: "spring", stiffness: 300, damping: 25 } }
};

// Custom Tooltip Component for Joyride (Clean Light UI)
const CustomTooltip = ({
  index,
  step,
  skipProps,
  primaryProps,
  backProps,
  tooltipProps,
  isLastStep,
}: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className="bg-white border border-slate-200 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] rounded-2xl p-6 max-w-[340px] w-full font-sans relative overflow-hidden"
      {...tooltipProps}
    >
      {step.title && (
        <h3 className="font-bold text-[17px] text-slate-900 mb-2 relative z-10">{step.title}</h3>
      )}
      
      <div className="text-[14px] font-medium text-slate-500 leading-relaxed mb-6 relative z-10">
        {step.content}
      </div>

      <div className="flex items-center justify-between mt-4 relative z-10">
        <button
          {...skipProps}
          className="text-[13px] font-bold text-slate-400 hover:text-slate-700 transition-colors px-2 py-1"
        >
          Skip Tour
        </button>

        <div className="flex items-center gap-2">
          {index > 0 && (
            <button
              {...backProps}
              className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-50 border border-transparent hover:border-slate-200 rounded-lg transition-all"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          
          <button
            {...primaryProps}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[13px] font-bold rounded-lg shadow-sm transition-all"
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
  const { setWelcomeTourActive } = useUiStore();
  const [showWelcome, setShowWelcome] = useState(false);
  const [runTour, setRunTour] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // --- 3D Spatial Physics Logic ---
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  const springConfig = { damping: 40, stiffness: 200, mass: 1.5 };
  const springX = useSpring(mouseX, springConfig);
  const springY = useSpring(mouseY, springConfig);

  const rotateX = useTransform(springY, [0, 1], [8, -8]);
  const rotateY = useTransform(springX, [0, 1], [-8, 8]);

  const glareX = useTransform(springX, [0, 1], ["0%", "100%"]);
  const glareY = useTransform(springY, [0, 1], ["0%", "100%"]);
  
  const glareBackground = useMotionTemplate`radial-gradient(circle at ${glareX} ${glareY}, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 50%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
  };

  useEffect(() => {
    setIsClient(true);
    if (!isFirstLogin || !employeeId) {
      setWelcomeTourActive(false);
      return;
    }
    
    // Check if they've already seen or completed it
    const hasSeenTour = localStorage.getItem(`naprocs_tour_v2_completed_${employeeId}`);
    
    if (!hasSeenTour) {
      setWelcomeTourActive(true);
      const timer = setTimeout(() => {
        setShowWelcome(true);
        // Mark it so it doesn't show again on reload before they finish
        localStorage.setItem(`naprocs_tour_v2_completed_${employeeId}`, "true");

        // Fire party poppers
        import('canvas-confetti').then((confettiModule) => {
          const confetti = confettiModule.default;
          const duration = 3 * 1000;
          const animationEnd = Date.now() + duration;
          const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 99999 };
          const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;
          const interval: any = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) {
              return clearInterval(interval);
            }
            const particleCount = 50 * (timeLeft / duration);
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } }));
            confetti(Object.assign({}, defaults, { particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } }));
          }, 250);
        });
      }, 600);
      return () => clearTimeout(timer);
    } else {
      setWelcomeTourActive(false);
    }
  }, [employeeId, isFirstLogin, setWelcomeTourActive]);

  const handleSkip = () => {
    if (employeeId) {
      localStorage.setItem(`naprocs_tour_v2_completed_${employeeId}`, "true");
    }
    setShowWelcome(false);
    setWelcomeTourActive(false);
  };

  const handleStartTour = () => {
    setShowWelcome(false);
    setTimeout(() => {
      setRunTour(true);
    }, 400); // wait for modal exit animation completely
  };

  const handleJoyrideCallback = (data: any) => {
    const { status } = data;
    const finishedStatuses: string[] = ['finished', 'skipped'];
    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      setWelcomeTourActive(false);
      if (employeeId) {
        localStorage.setItem(`naprocs_tour_v2_completed_${employeeId}`, "true");
      }
    }
  };

  const steps: any[] = [
    {
      target: "body",
      content: (
        <div className="space-y-3">
          <div className="w-10 h-10 bg-slate-100 text-slate-900 rounded-xl flex items-center justify-center mb-3 border border-slate-200 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-[18px] text-slate-900 tracking-tight">Let's look around!</h3>
          <p className="text-[14px] text-slate-500 font-medium leading-relaxed">We've built this dashboard to be fast, beautiful, and easy to use. Here's a quick 4-step overview.</p>
        </div>
      ),
      placement: "center",
      skipBeacon: true,
    },
    {
      target: "#tour-sidebar",
      content: (
        <div>
          <div className="flex items-center gap-2 mb-2 text-slate-900 font-bold">
            <Map className="w-4 h-4 text-slate-500" /> Navigation Hub
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
          <div className="flex items-center gap-2 mb-2 text-slate-900 font-bold">
            <UserCircle className="w-4 h-4 text-slate-500" /> Profile & Settings
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
          <div className="flex items-center gap-2 mb-2 text-slate-900 font-bold">
            <BarChart3 className="w-4 h-4 text-slate-500" /> Live Metrics
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
          <div className="flex items-center gap-2 mb-2 text-slate-900 font-bold">
            <Zap className="w-4 h-4 text-slate-500" /> Quick Actions
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
      {/* ── Welcome Full-Screen Overlay (Spatial 3D Marvel) ── */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div 
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/30 backdrop-blur-[6px]"
            style={{ perspective: 1200 }}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <motion.div 
              variants={exitVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              style={{
                rotateX,
                rotateY,
                transformStyle: "preserve-3d",
              }}
              className="relative bg-white/70 backdrop-blur-3xl border border-white/60 shadow-[0_40px_100px_-20px_rgba(15,23,42,0.25),inset_0_1px_0_rgba(255,255,255,1)] rounded-3xl p-8 sm:p-12 max-w-[850px] w-[95%] flex flex-col md:flex-row gap-10 items-stretch"
            >
              {/* Dynamic Glare Effect */}
              <motion.div 
                className="absolute inset-0 z-0 pointer-events-none rounded-3xl mix-blend-overlay opacity-60"
                style={{
                  background: glareBackground
                }}
              />
              
              <button
                onClick={handleSkip}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-full transition-all z-20 backdrop-blur-sm"
                aria-label="Close"
                style={{ transform: "translateZ(30px)" }}
              >
                <X className="w-5 h-5" />
              </button>
              
              {/* Left Side: Typography & Intro (Floating in 3D) */}
              <div 
                className="flex-1 flex flex-col items-start justify-center text-left z-10 w-full pr-0 md:pr-4"
                style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
              >
                {/* 3D Company Logo Placeholder */}
                <div 
                  className="w-16 h-16 bg-gradient-to-tr from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(15,23,42,0.3),inset_0_2px_0_rgba(255,255,255,0.2)] mb-8 border border-slate-700 relative overflow-hidden"
                  style={{ transform: "translateZ(20px)" }}
                >
                  <div className="absolute inset-0 bg-white/10" style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }} />
                  <span className="text-3xl text-white font-black tracking-tighter relative z-10 drop-shadow-md">N</span>
                </div>
                
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4 drop-shadow-sm">
                  Welcome to <br />Naprocs
                </h2>
                
                <p className="text-[16px] font-medium text-slate-600 mb-10 leading-relaxed max-w-sm drop-shadow-sm">
                  Experience your new Employee Portal. Meticulously crafted for speed, elegance, and beautiful simplicity.
                </p>

                <div 
                  className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-auto"
                  style={{ transform: "translateZ(20px)" }}
                >
                  <button 
                    onClick={handleStartTour}
                    className="group relative w-full sm:w-auto px-7 py-3 text-[14px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-[0_10px_20px_rgba(15,23,42,0.2)] hover:shadow-[0_15px_30px_rgba(15,23,42,0.3)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 ease-in-out" />
                    <span className="relative z-10 flex items-center gap-2">Start Quick Tour <ArrowRight className="w-4 h-4" /></span>
                  </button>
                  <button 
                    onClick={handleSkip}
                    className="w-full sm:w-auto px-6 py-3 text-[14px] font-bold text-slate-500 hover:text-slate-900 bg-white/50 hover:bg-white border border-slate-200/50 hover:border-slate-300 rounded-xl transition-all shadow-sm"
                  >
                    Skip for now
                  </button>
                </div>
              </div>

              {/* Right Side: Clean Structured List (Floating in 3D) */}
              <motion.div 
                variants={listContainerVariants}
                initial="hidden"
                animate="visible"
                className="flex-1 w-full flex flex-col justify-center gap-5 z-10 pt-6 md:pt-0 relative"
                style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
              >
                {/* Subtle divider in 3D */}
                <div className="hidden md:block absolute left-[-20px] top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent opacity-50" />
                
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-2 ml-2" style={{ transform: "translateZ(10px)" }}>Platform Highlights</h4>
                
                {/* List Item 1 */}
                <motion.div variants={listItemVariants} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/40 transition-colors cursor-default border border-transparent hover:border-white/50 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-xl">
                  <div className="w-12 h-12 shrink-0 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                    <CalendarClock className="w-5 h-5" />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="text-slate-900 font-bold text-[15px] mb-1">Track Attendance</h4>
                    <p className="text-[13.5px] text-slate-500 font-medium leading-snug">Real-time biometrics, smooth check-ins, and perfect history tracking.</p>
                  </div>
                </motion.div>

                {/* List Item 2 */}
                <motion.div variants={listItemVariants} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/40 transition-colors cursor-default border border-transparent hover:border-white/50 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-xl">
                  <div className="w-12 h-12 shrink-0 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                    <Briefcase className="w-5 h-5" />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="text-slate-900 font-bold text-[15px] mb-1">Manage Leaves</h4>
                    <p className="text-[13.5px] text-slate-500 font-medium leading-snug">Instant requests, smart balances, and transparent approval workflows.</p>
                  </div>
                </motion.div>

                {/* List Item 3 */}
                <motion.div variants={listItemVariants} className="flex items-start gap-4 p-3 rounded-2xl hover:bg-white/40 transition-colors cursor-default border border-transparent hover:border-white/50 shadow-[0_0_0_rgba(0,0,0,0)] hover:shadow-xl">
                  <div className="w-12 h-12 shrink-0 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-900/20">
                    <HandCoins className="w-5 h-5" />
                  </div>
                  <div className="pt-0.5">
                    <h4 className="text-slate-900 font-bold text-[15px] mb-1">Payroll & Assets</h4>
                    <p className="text-[13.5px] text-slate-500 font-medium leading-snug">Secure access to encrypted payslips and company asset records.</p>
                  </div>
                </motion.div>
              </motion.div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Joyride Tutorial (Clean Professional Mode) ── */}
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
              backgroundColor: '#334155',
            },
            beaconOuter: {
              backgroundColor: 'rgba(51, 65, 85, 0.4)',
              borderColor: 'rgba(51, 65, 85, 0.8)',
            }
          }}
        />
      )}
    </>
  );
}
