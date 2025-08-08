import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type AnimationDirection = 'forward' | 'backward' | 'none';

interface StepContainerProps {
  children: React.ReactNode;
  className?: string;
  currentStep: number;
  animationDirection: AnimationDirection;
}

export const StepContainer: React.FC<StepContainerProps> = ({
  children,
  className,
  currentStep,
  animationDirection,
}) => {
  // Animation variants based on direction
  const getAnimationVariants = () => {
    const slideDistance = 50; // pixels to slide

    switch (animationDirection) {
      case 'forward':
        return {
          initial: { opacity: 0, x: slideDistance },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: -slideDistance }
        };
      case 'backward':
        return {
          initial: { opacity: 0, x: -slideDistance },
          animate: { opacity: 1, x: 0 },
          exit: { opacity: 0, x: slideDistance }
        };
      default:
        return {
          initial: { opacity: 0, y: 10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 }
        };
    }
  };

  const variants = getAnimationVariants();

  return (
    <div className={cn("mb-2 md:mb-4", className)}>
      <AnimatePresence mode="wait">
        <motion.div
          key={`step-${currentStep}`}
          initial={variants.initial}
          animate={variants.animate}
          exit={variants.exit}
          transition={{
            duration: 0.35,
            ease: "easeInOut",
            type: "tween"
          }}
          className="relative"
        >
          {/* Gradient border effect */}
          <div className="absolute inset-0 rounded-xl p-[1px]" style={{
            background: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)'
          }}>
            <div className="rounded-xl w-full p-4 md:p-6 lg:p-8" style={{
              background: 'linear-gradient(135deg, rgba(17, 23, 37, 0.8) 0%, rgba(7, 11, 18, 0.9) 100%)',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.05)'
            }}>
              {children}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
