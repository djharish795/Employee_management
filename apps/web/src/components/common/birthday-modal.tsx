"use client";

import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/store/auth";
import { useUiStore } from "@/store/ui";
import { motion, AnimatePresence, Variants, useMotionValue, useSpring, useTransform, useMotionTemplate } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import Image from "next/image";
import { apiClient } from "@/lib/api/client";

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

export default function BirthdayModal() {
  const { employeeId } = useAuthStore();
  const { isWelcomeTourActive } = useUiStore();
  const [showWelcome, setShowWelcome] = useState(false);
  const [birthdays, setBirthdays] = useState<any[]>([]);
  const [isClient, setIsClient] = useState(false);

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
    // Don't do anything if Welcome Tour is still active, or no employeeId
    if (!employeeId || isWelcomeTourActive) return;

    const fetchBirthdays = async () => {
      try {
        const todayStr = new Date().toISOString().split('T')[0];
        const hasSeenBirthday = localStorage.getItem(`naprocs_birthday_seen_${todayStr}_${employeeId}`);
        
        if (hasSeenBirthday) return;

        const response = await apiClient.get('/employees/birthdays/today');
        const bdays = response.data?.data || response.data || [];
        
        if (bdays.length > 0) {
          setBirthdays(bdays);
          
          const timer = setTimeout(() => {
            setShowWelcome(true);
            localStorage.setItem(`naprocs_birthday_seen_${todayStr}_${employeeId}`, "true");

            // Fire party poppers
            import('canvas-confetti').then((confettiModule) => {
              const confetti = confettiModule.default;
              const duration = 5 * 1000;
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
        }
      } catch (err) {
        console.error("Failed to fetch birthdays", err);
      }
    };
    
    fetchBirthdays();
  }, [employeeId, isWelcomeTourActive]);

  const handleSkip = () => {
    setShowWelcome(false);
  };

  if (!isClient) return null;

  return (
    <AnimatePresence>
      {showWelcome && birthdays.length > 0 && (
        <motion.div 
          variants={overlayVariants}
          initial="hidden"
          animate="visible"
          exit="hidden"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md"
          style={{ perspective: 1200 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <motion.div 
            variants={exitVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
            className="relative bg-white/70 backdrop-blur-3xl border border-white/60 shadow-[0_40px_100px_-20px_rgba(15,23,42,0.25),inset_0_1px_0_rgba(255,255,255,1)] rounded-3xl p-8 sm:p-12 max-w-[850px] w-[95%] flex flex-col md:flex-row gap-10 items-stretch"
          >
            <motion.div 
              className="absolute inset-0 z-0 pointer-events-none rounded-3xl mix-blend-overlay opacity-60"
              style={{ background: glareBackground }}
            />
            
            <button
              onClick={handleSkip}
              className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100/50 rounded-full transition-all z-20 backdrop-blur-sm"
              aria-label="Close"
              style={{ transform: "translateZ(30px)" }}
            >
              <X className="w-5 h-5" />
            </button>
            
            <div 
              className="flex-1 flex flex-col items-start justify-center text-left z-10 w-full pr-0 md:pr-4"
              style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}
            >
              <div 
                className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-rose-600 rounded-2xl flex items-center justify-center shadow-[0_10px_20px_rgba(225,29,72,0.3),inset_0_2px_0_rgba(255,255,255,0.2)] mb-8 border border-rose-500 relative overflow-hidden"
                style={{ transform: "translateZ(20px)" }}
              >
                <div className="absolute inset-0 bg-white/10" style={{ clipPath: "polygon(0 0, 100% 0, 100% 50%, 0 50%)" }} />
                <Sparkles className="text-white w-8 h-8 relative z-10 drop-shadow-md" />
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight mb-4 drop-shadow-sm">
                Happy Birthday!
              </h2>
              
              <p className="text-[16px] font-medium text-slate-600 mb-10 leading-relaxed max-w-sm drop-shadow-sm">
                Join us in wishing {birthdays.map(b => b.firstName).join(' and ')} a fantastic day filled with joy!
              </p>

              <div 
                className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto mt-auto"
                style={{ transform: "translateZ(20px)" }}
              >
                <button 
                  onClick={handleSkip}
                  className="group relative w-full sm:w-auto px-7 py-3 text-[14px] font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-[0_10px_20px_rgba(15,23,42,0.2)] transition-all flex items-center justify-center"
                >
                  Awesome!
                </button>
              </div>
            </div>

            <div 
              className="flex-1 w-full flex flex-col items-center justify-center gap-5 z-10 pt-6 md:pt-0 relative"
              style={{ transform: "translateZ(30px)", transformStyle: "preserve-3d" }}
            >
              <div className="hidden md:block absolute left-[-20px] top-10 bottom-10 w-px bg-gradient-to-b from-transparent via-slate-300 to-transparent opacity-50" />
              
              <div className="flex flex-wrap justify-center gap-6">
                {birthdays.map(birthday => (
                  <div key={birthday.id} className="flex flex-col items-center">
                    <div className="relative w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden mb-4 bg-slate-100 flex items-center justify-center">
                      {birthday.photoUrl ? (
                        <Image src={birthday.photoUrl} alt={birthday.firstName} fill style={{ objectFit: 'cover' }} />
                      ) : (
                        <span className="text-4xl font-bold text-slate-400">{birthday.firstName.charAt(0)}</span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 text-center">{birthday.firstName} {birthday.lastName}</h3>
                    <p className="text-sm font-medium text-slate-500 text-center">{birthday.department || birthday.designation || 'Team Member'}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
