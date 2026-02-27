import React from 'react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  stepNames: string[];
}

export default function StepIndicator({ currentStep, totalSteps, stepNames }: StepIndicatorProps) {
  return (
    <div className="w-full mb-12">
      <div className="flex items-center justify-between relative">
        {/* Background Track */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-[#111111]/10 rounded-full z-0 pointer-events-none" />
        
        {/* Progress Track */}
        <div 
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-[#111111] rounded-full z-0 transition-all duration-300 pointer-events-none" 
          style={{ width: `${(currentStep / (totalSteps - 1)) * 100}%` }}
        />

        {stepNames.map((name, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;

          return (
            <div key={name} className="flex flex-col items-center relative z-10">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center font-martian font-bold border-2 transition-all duration-300 ${
                  isActive 
                    ? 'bg-[#b5e315] border-[#111111] text-[#111111] shadow-[2px_2px_0px_#111111]' 
                    : isCompleted 
                      ? 'bg-[#111111] border-[#111111] text-[#FCFAF6]' 
                      : 'bg-white border-[#111111]/20 text-[#111111]/40'
                }`}
              >
                {isCompleted ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  index + 1
                )}
              </div>
              <span 
                className={`mt-3 text-xs md:text-sm font-medium absolute top-12 whitespace-nowrap hidden md:block ${
                  isActive ? 'text-[#111111] font-bold' : isCompleted ? 'text-[#111111]/80' : 'text-[#111111]/40'
                }`}
              >
                {name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
