"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumDashboardLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function PremiumDashboardLayout({ children, className }: PremiumDashboardLayoutProps) {
  return (
    <div className={cn("flex-1 w-full p-4 sm:p-6 md:p-8 bg-gradient-to-br from-slate-50 via-white to-slate-100 min-h-screen font-sans relative", className)}>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", staggerChildren: 0.1 }}
        className="w-full h-full relative z-10 flex flex-col gap-6"
      >
        {children}
      </motion.div>
    </div>
  );
}
