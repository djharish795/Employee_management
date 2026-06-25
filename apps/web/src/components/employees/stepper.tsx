import React from 'react';
import { WizardStep } from '../../types/employee';
import { Check } from 'lucide-react';

interface StepperProps {
  steps: WizardStep[];
  activeStep: number;
  onStepClick?: (stepNum: number) => void;
}

export function Stepper({ steps, activeStep, onStepClick }: StepperProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-8 py-6 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between relative">
          {/* Background Connecting Line */}
          <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 -z-0" />
          
          {/* Active Progress Line */}
          <div 
            className="absolute top-4 left-0 h-0.5 bg-blue-600 transition-all duration-500 ease-in-out -z-0" 
            style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
          />
          
          {steps.map((step) => {
            const isActive = step.num === activeStep;
            const isCompleted = step.num < activeStep;
            
            return (
              <div 
                key={step.num} 
                className={`flex flex-col items-center gap-2 relative z-10 bg-white px-3 ${onStepClick ? 'cursor-pointer hover:opacity-80' : ''}`}
                onClick={() => onStepClick && onStepClick(step.num)}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                  isActive 
                    ? 'bg-[#0052CC] text-white shadow-[0_0_0_4px_rgba(0,82,204,0.1)]' 
                    : isCompleted
                      ? 'bg-white border border-blue-600 text-blue-600'
                      : 'bg-white border border-slate-300 text-slate-400'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : step.num}
                </div>
                <span className={`text-xs font-bold whitespace-nowrap absolute top-10 ${
                  isActive ? 'text-slate-900' : isCompleted ? 'text-blue-600' : 'text-slate-400'
                }`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
