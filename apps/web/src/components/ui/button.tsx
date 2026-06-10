import * as React from "react";
import { cn } from "../../lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "danger" | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          {
            "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/10 focus-visible:ring-blue-500":
              variant === "default",
            "border border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 focus-visible:ring-slate-500":
              variant === "outline",
            "text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-500":
              variant === "ghost",
            "border border-red-200 bg-transparent text-red-600 hover:bg-red-50 focus-visible:ring-red-500":
              variant === "danger",
            "bg-slate-900 text-white hover:bg-slate-800 focus-visible:ring-slate-900":
              variant === "secondary",
          },
          {
            "h-11 px-5 py-2": size === "default",
            "h-9 px-3 text-sm": size === "sm",
            "h-12 px-6 text-lg": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
