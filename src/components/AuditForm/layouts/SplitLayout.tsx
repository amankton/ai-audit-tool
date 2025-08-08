import React from 'react';
import { FormProgress } from '../FormProgress';
import { StepContainer, AnimationDirection } from '../StepContainer';
import { NavigationControls } from '../NavigationControls';

interface FormStep {
  id: string;
  title: string;
  component: React.ComponentType<any>;
}

interface SplitLayoutProps {
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

export const SplitLayout: React.FC<SplitLayoutProps> = ({
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
    <div className="h-screen flex flex-col md:flex-row overflow-hidden" style={{ 
      fontFamily: 'Inter, sans-serif',
      background: 'linear-gradient(135deg, #111725 0%, #070b12 100%)'
    }}>
      {/* Background with your website gradient */}
      <div className="fixed inset-0" style={{
        background: 'linear-gradient(135deg, #111725 0%, #070b12 100%)'
      }}></div>
      
      {/* Left Panel - Header & Info Section */}
      <div className="relative z-10 w-full md:w-2/5 lg:w-1/3 flex flex-col justify-center px-6 md:pl-6 md:pr-1 lg:pl-8 lg:pr-2 py-6 md:py-8 min-h-0">
        <div className="max-w-md mx-auto md:ml-auto md:mr-0 w-full">
          {/* Title and Subtitle */}
          <div className="mb-6 md:mb-8 lg:mb-10 text-center">
            <h1 className="text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-medium mb-3 md:mb-4 lg:mb-6 leading-tight">
              <span
                className="bg-gradient-to-b from-white to-neutral-400 bg-clip-text text-transparent"
                style={{
                  backgroundImage: 'linear-gradient(to bottom, #ffffff 0%, #c0c0c0 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}
              >
                AI Business Audit
              </span>
            </h1>
            <p className="text-neutral-300 text-sm md:text-base lg:text-lg xl:text-xl leading-relaxed max-w-md mx-auto">
              Discover how AI can transform your business in just 5 minutes
            </p>
          </div>
          
          {/* Progress Section */}
          <div className="mb-6 md:mb-8 lg:mb-10 w-full">
            <FormProgress
              steps={formSteps}
              currentStep={currentStep}
              completionScore={completionScore}
            />
          </div>
          
          {/* Key Benefits */}
          <div className="hidden md:block">
            <div
              className="relative rounded-2xl p-6 border transition-all duration-300 hover:shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.35), 0 8px 20px rgba(0, 0, 0, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.25), 0 4px 12px rgba(0, 0, 0, 0.15)';
              }}
            >
              {/* Subtle gradient overlay */}
              <div
                className="absolute inset-0 rounded-2xl opacity-50"
                style={{
                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(147, 51, 234, 0.05) 100%)'
                }}
              ></div>

              <div className="relative z-10">
                <h3 className="text-white font-medium mb-5 text-center text-base">What You'll Get</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-400 rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-neutral-200 text-sm leading-relaxed">Personalized AI recommendations</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-neutral-200 text-sm leading-relaxed">Industry-specific insights</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-purple-400 rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-neutral-200 text-sm leading-relaxed">Implementation roadmap</span>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-amber-400 rounded-full flex-shrink-0 mt-2"></div>
                    <span className="text-neutral-200 text-sm leading-relaxed">ROI projections & timeline</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right Panel - Form Section */}
      <div className="relative z-10 w-full md:w-3/5 lg:w-2/3 flex flex-col min-h-0 px-6 md:pl-12 md:pr-8 lg:pl-16 lg:pr-12 py-6 md:py-8">
        {/* Form Content - Optimized scrollable area */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <div className="h-full max-w-2xl mx-auto w-full">
              <StepContainer
                currentStep={currentStep}
                animationDirection={animationDirection}
              >
                {children}
              </StepContainer>
            </div>
          </div>

          {/* Navigation Controls - Sticky footer */}
          <div className="flex-shrink-0 pt-6 pb-4 md:pb-6 max-w-2xl mx-auto w-full" style={{
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
