import React from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface PremiumCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverLift?: boolean;
  decorativeGradient?: boolean;
  gradientColor?: string; // e.g. "from-blue-50 to-indigo-50/20"
}

export const PremiumCard = React.forwardRef<HTMLDivElement, PremiumCardProps>(
  ({ children, className, hoverLift = false, decorativeGradient = false, gradientColor = "from-blue-50 to-indigo-50/20", ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className={cn(
          "relative overflow-hidden border-slate-200/70 shadow-sm shadow-slate-200/50 bg-white/80 backdrop-blur-md transition-all duration-300",
          hoverLift && "hover:shadow-xl hover:-translate-y-1",
          className
        )}
        {...props}
      >
        {decorativeGradient && (
          <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full blur-2xl pointer-events-none bg-gradient-to-br", gradientColor)} />
        )}
        {children}
      </Card>
    );
  }
);
PremiumCard.displayName = "PremiumCard";
