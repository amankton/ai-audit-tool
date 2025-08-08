import React from 'react';
import { FormProgress } from '../FormProgress';
import { StepContainer, AnimationDirection } from '../StepContainer';
import { NavigationControls } from '../NavigationControls';

interface FormStep {
  id: string;
  title: string;
  component: React.ComponentType<any>;
}

interface CenteredLayoutProps {
  currentStep: number;
  totalSteps: number;
  completionScore: number;
  isValid: boolean;
  isSubmitting: boolean;
  formSteps: FormStep[];
  children: React.ReactNode;
  onPrev: () => void;
  onNext: () => void;
  onSubmit: () => void;
  animationDirection: AnimationDirection;
}

export const CenteredLayout: React.FC<CenteredLayoutProps> = ({
  currentStep,
  totalSteps,
  completionScore,
  isValid,
  isSubmitting,
  formSteps,
  children,
  onPrev,
  onNext,
  onSubmit,
  animationDirection,
}) => {
  return (
    <div className="h-screen flex flex-col overflow-hidden" style={{ 
      fontFamily: 'Inter, sans-serif',
      background: 'linear-gradient(135deg, #111725 0%, #070b12 100%)'
    }}>
      {/* Background with your website gradient */}
      <div className="fixed inset-0" style={{
        background: 'linear-gradient(135deg, #111725 0%, #070b12 100%)'
      }}></div>
      
      <div className="relative z-10 flex flex-col h-full max-w-5xl mx-auto w-full px-4 py-4">
        {/* Header - Compact */}
        <div className="flex-shrink-0 text-center py-3 md:py-4">
          <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-white mb-1 md:mb-2">
            AI Business Audit
          </h1>
          <p className="text-neutral-400 text-xs md:text-sm lg:text-base">
            Discover how AI can transform your business in just 5 minutes
          </p>
        </div>
        
        {/* Progress - Compact */}
        <div className="flex-shrink-0 mb-3 md:mb-4">
          <FormProgress 
            steps={formSteps}
            currentStep={currentStep}
            completionScore={completionScore}
          />
        </div>

        {/* Form Content - Optimized scrollable area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="h-full">
              <StepContainer
                currentStep={currentStep}
                animationDirection={animationDirection}
              >
                {children}
              </StepContainer>
            </div>
          </div>
          
          {/* Navigation Controls - Sticky footer */}
          <div className="flex-shrink-0 pt-4 pb-4 md:pb-6" style={{
            background: 'linear-gradient(to top, #070b12 0%, #070b12 50%, transparent 100%)'
          }}>
            <NavigationControls
              currentStep={currentStep}
              totalSteps={totalSteps}
              isValid={isValid}
              onPrev={onPrev}
              onNext={onNext}
              onSubmit={onSubmit}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
