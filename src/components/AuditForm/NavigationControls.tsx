import React from 'react';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavigationControlsProps {
  currentStep: number;
  totalSteps: number;
  isValid: boolean;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  className?: string;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentStep,
  totalSteps,
  isValid,
  onPrev,
  onNext,
  onSubmit,
  isSubmitting = false,
  className,
}) => {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;
  
  return (
    <div className={cn("flex items-center justify-between gap-2 md:gap-4", className)}>
      {/* Previous Button */}
      <button
        type="button"
        onClick={onPrev}
        disabled={isFirstStep}
        className={cn(
          "flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base",
          isFirstStep
            ? "text-neutral-500 cursor-not-allowed"
            : "text-neutral-300 hover:text-white"
        )}
        style={!isFirstStep ? {
          background: 'rgba(17, 23, 37, 0.6)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        } : {
          background: 'rgba(17, 23, 37, 0.3)',
          border: '1px solid rgba(255, 255, 255, 0.05)',
        }}
        onMouseEnter={(e) => {
          if (!isFirstStep) {
            e.currentTarget.style.background = 'rgba(17, 23, 37, 0.8)';
          }
        }}
        onMouseLeave={(e) => {
          if (!isFirstStep) {
            e.currentTarget.style.background = 'rgba(17, 23, 37, 0.6)';
          }
        }}
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Previous</span>
        <span className="sm:hidden">Prev</span>
      </button>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        <span className="text-xs md:text-sm text-neutral-400">
          Step {currentStep + 1} of {totalSteps}
        </span>
      </div>
      
      {/* Next/Submit Button */}
      {isLastStep ? (
        <button
          type="button"
          onClick={onSubmit}
          disabled={!isValid || isSubmitting}
          className={cn(
            "flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base",
            isValid && !isSubmitting
              ? "text-white"
              : "text-neutral-400 cursor-not-allowed"
          )}
          style={isValid && !isSubmitting ? {
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            boxShadow: '0 4px 12px rgba(16, 185, 129, 0.2)'
          } : {
            background: 'rgba(17, 23, 37, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
          onMouseEnter={(e) => {
            if (isValid && !isSubmitting) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #059669 0%, #047857 100%)';
            }
          }}
          onMouseLeave={(e) => {
            if (isValid && !isSubmitting) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #10b981 0%, #059669 100%)';
            }
          }}
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">Submitting...</span>
              <span className="sm:hidden">...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Get My AI Audit</span>
              <span className="sm:hidden">Submit</span>
            </>
          )}
        </button>
      ) : (
        <button
          type="button"
          onClick={onNext}
          disabled={!isValid}
          className={cn(
            "flex items-center gap-1 md:gap-2 px-3 md:px-6 py-2 md:py-3 rounded-lg font-medium transition-colors text-sm md:text-base",
            isValid
              ? "text-white"
              : "text-neutral-400 cursor-not-allowed"
          )}
          style={isValid ? {
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)'
          } : {
            background: 'rgba(17, 23, 37, 0.3)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
          }}
          onMouseEnter={(e) => {
            if (isValid) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
            }
          }}
          onMouseLeave={(e) => {
            if (isValid) {
              e.currentTarget.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
            }
          }}
        >
          <span className="hidden sm:inline">Continue</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
