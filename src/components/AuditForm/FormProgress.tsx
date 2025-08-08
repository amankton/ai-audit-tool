import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Step {
  id: string;
  title: string;
}

interface FormProgressProps {
  steps: Step[];
  currentStep: number;
  completionScore: number;
  className?: string;
}

export const FormProgress: React.FC<FormProgressProps> = ({
  steps,
  currentStep,
  completionScore,
  className,
}) => {
  return (
    <div className={cn("mb-4", className)}>
      {/* Progress Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs md:text-sm font-medium text-neutral-300">Progress</span>
          <span className="text-xs md:text-sm font-medium text-blue-400">{completionScore}% Complete</span>
        </div>
        <div className="w-full bg-neutral-800 rounded-full h-1.5 md:h-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-1.5 md:h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${completionScore}%` }}
          />
        </div>
      </div>
      
      {/* Step Indicators */}
      <div className="relative">
        <div className="flex items-center justify-between relative">
          {/* Background connecting line */}
          <div className="absolute top-4 md:top-5 left-4 md:left-5 right-4 md:right-5 h-0.5 bg-neutral-700"></div>

          {steps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const isUpcoming = index > currentStep;

            return (
              <div key={step.id} className="flex flex-col items-center relative z-10">
                {/* Step Circle */}
                <div
                  className={cn(
                    "w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 bg-neutral-950",
                    isCompleted && "bg-green-500 border-green-500",
                    isCurrent && "bg-blue-500 border-blue-500",
                    isUpcoming && "bg-neutral-800 border-neutral-600"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-3 h-3 md:w-4 md:h-4 text-white" />
                  ) : (
                    <span
                      className={cn(
                        "text-xs md:text-sm font-medium",
                        isCurrent && "text-white",
                        isUpcoming && "text-neutral-400"
                      )}
                    >
                      {index + 1}
                    </span>
                  )}
                </div>

                {/* Step Title */}
                <div className="mt-2 text-center max-w-20 md:max-w-24">
                  <p
                    className={cn(
                      "text-xs md:text-sm font-medium transition-colors leading-tight",
                      isCompleted && "text-green-400",
                      isCurrent && "text-blue-400",
                      isUpcoming && "text-neutral-500"
                    )}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress line overlay */}
        <div
          className="absolute top-4 md:top-5 left-4 md:left-5 h-0.5 bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
          style={{
            width: `${Math.max(0, (currentStep / (steps.length - 1)) * 100)}%`,
            maxWidth: 'calc(100% - 2rem)'
          }}
        ></div>
      </div>
      
      {/* Completion Encouragement - More compact */}
      {completionScore > 0 && completionScore < 100 && (
        <div className="mt-2 p-2 md:p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-blue-300">
                Great progress! You're {completionScore}% complete.
              </p>
              <p className="text-xs text-blue-400 mt-0.5">
                {completionScore < 25 && "Just getting started - keep going!"}
                {completionScore >= 25 && completionScore < 50 && "You're making good progress!"}
                {completionScore >= 50 && completionScore < 75 && "More than halfway there!"}
                {completionScore >= 75 && "Almost done - just a few more questions!"}
              </p>
            </div>
            <div className="text-base md:text-lg">
              {completionScore < 25 && "🚀"}
              {completionScore >= 25 && completionScore < 50 && "💪"}
              {completionScore >= 50 && completionScore < 75 && "🔥"}
              {completionScore >= 75 && "🎯"}
            </div>
          </div>
        </div>
      )}

      {/* Completion Celebration - More compact */}
      {completionScore === 100 && (
        <div className="mt-2 p-2 md:p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-green-300">
                🎉 Congratulations! Your audit is complete.
              </p>
              <p className="text-xs text-green-400 mt-0.5">
                Submit your form to receive your personalized AI recommendations.
              </p>
            </div>
            <div className="text-base md:text-lg">✅</div>
          </div>
        </div>
      )}
    </div>
  );
};
