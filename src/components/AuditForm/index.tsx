import React, { useState } from 'react';
import { useAuditForm } from '@/hooks/useAuditForm';
import { CompanyBasics } from './steps/CompanyBasics';
import { BusinessOperations } from './steps/BusinessOperations';
import { TechReadiness } from './steps/TechReadiness';
import { AIGoals } from './steps/AIGoals';
import { ContactInfo } from './steps/ContactInfo';
import { CenteredLayout, SplitLayout, LayoutVariant } from './layouts';
import { LayoutSelector } from './LayoutSelector';
import { DebugPanel } from '../DebugPanel';
import { AnimationDirection } from './StepContainer';
import toast from 'react-hot-toast';
import { N8NAuditResponse } from '@/lib/utils';

const FORM_STEPS = [
  { id: 'company', title: 'About Your Business', component: CompanyBasics },
  { id: 'operations', title: 'How You Work', component: BusinessOperations },
  { id: 'tech', title: 'Your Technology', component: TechReadiness },
  { id: 'goals', title: 'Your AI Goals', component: AIGoals },
  { id: 'contact', title: 'Get Your Report', component: ContactInfo }
];

export const AuditForm: React.FC = () => {
  const {
    currentStep,
    formData,
    completionScore,
    isValid,
    nextStep,
    prevStep,
    updateFormData,
    submitForm
  } = useAuditForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [layoutVariant, setLayoutVariant] = useState<LayoutVariant>('split'); // Default to new 2-panel layout
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [animationDirection, setAnimationDirection] = useState<AnimationDirection>('none');
  const [isAnimating, setIsAnimating] = useState(false);

  const CurrentStepComponent = FORM_STEPS[currentStep].component;

  // Animated navigation handlers
  const handleNextStep = () => {
    if (isAnimating) return; // Prevent multiple clicks during animation

    setIsAnimating(true);
    setAnimationDirection('forward');

    // Delay the actual step change to allow exit animation
    setTimeout(() => {
      nextStep();
      setIsAnimating(false);
    }, 50); // Small delay for smooth transition
  };

  const handlePrevStep = () => {
    if (isAnimating) return; // Prevent multiple clicks during animation

    setIsAnimating(true);
    setAnimationDirection('backward');

    // Delay the actual step change to allow exit animation
    setTimeout(() => {
      prevStep();
      setIsAnimating(false);
    }, 50); // Small delay for smooth transition
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Prepare the data for webhook submission
      const submissionData = {
        ...formData,
        submissionId: `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
        timestamp: new Date().toISOString(),
        completionScore,
        currentStep: currentStep + 1, // Convert to 1-based for reporting
        totalSteps: FORM_STEPS.length
      };

      // Submit to N8N webhook with extended timeout for report generation
      console.log('Submitting to webhook:', submissionData);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 120000); // 2 minute timeout for report generation

      try {
        // Use environment variable for webhook URL, fallback to local simulation for testing
        const webhookUrl = process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '/api/webhook-simulate';
        console.log('Using webhook URL:', webhookUrl);

        const response = await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(submissionData),
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        console.log('Webhook response:', response.status, response.statusText);

        if (response.ok) {
          // Parse N8N response
          const n8nResponse: N8NAuditResponse = await response.json();
          console.log('N8N response data:', n8nResponse);

          // Save initial submission to database
          try {
            const result = await submitForm();
            console.log('Database submission result:', result);
          } catch (dbError) {
            console.error('Database error:', dbError);
          }

          // Handle N8N response
          if (n8nResponse.success && n8nResponse.report) {
            // Store the generated report
            try {
              const reportResponse = await fetch('/api/audit/report', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(n8nResponse)
              });

              if (reportResponse.ok) {
                const reportResult = await reportResponse.json();
                console.log('Report stored successfully:', reportResult);

                setIsSubmitted(true);
                toast.success('🎉 Your personalized AI audit report has been generated and saved! Check your email for the detailed report with PDF, HTML, and downloadable formats.');
              } else {
                console.error('Failed to store report:', await reportResponse.text());
                setIsSubmitted(true);
                toast.success('🎉 Your AI audit has been processed! Check your email for the detailed report.');
              }
            } catch (reportError) {
              console.error('Error storing report:', reportError);
              setIsSubmitted(true);
              toast.success('🎉 Your AI audit has been processed! Check your email for the detailed report.');
            }
          } else {
            // N8N processing failed or incomplete
            console.error('N8N processing failed:', n8nResponse.error);
            setIsSubmitted(true);
            toast.success('🎉 Your AI audit has been submitted! We\'re processing your report and will email it to you shortly.');
          }
        } else {
          throw new Error(`Webhook submission failed: ${response.status}`);
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError instanceof Error && fetchError.name === 'AbortError') {
          // Timeout occurred - report is being processed in background
          setIsSubmitted(true);
          toast.success('🎉 Your AI audit is being processed! This may take a few minutes. We\'ll email your detailed report once it\'s ready.');
        } else {
          throw fetchError;
        }
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('There was an error submitting your audit. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state after submission
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-neutral-950 flex items-center justify-center p-4 py-8" style={{ fontFamily: 'Inter, sans-serif' }}>
        {/* Background with subtle gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-neutral-900 via-neutral-950 to-black"></div>

        <div className="relative z-10 max-w-2xl mx-auto text-center w-full mt-8">
          {/* Gradient border effect */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-neutral-600 via-transparent to-neutral-700 rounded-xl p-[1px]">
              <div className="bg-neutral-900 rounded-xl h-full w-full p-4 md:p-8">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
                  <svg className="w-6 h-6 md:w-8 md:h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>

                <h2 className="text-xl md:text-2xl font-bold text-white mb-4">
                  🎉 Thank you for completing your AI audit!
                </h2>

                <p className="text-sm md:text-base text-neutral-400 mb-4 md:mb-6">
                  We're analyzing your responses and preparing your personalized AI recommendations.
                  You'll receive your detailed report within 24 hours at <strong className="text-white">{formData.email}</strong>.
                </p>

                <div className="bg-blue-500/10 border border-blue-500/20 p-3 md:p-4 rounded-lg mb-4 md:mb-6">
                  <h3 className="font-semibold text-blue-300 mb-2 text-sm md:text-base">What happens next?</h3>
                  <ul className="text-xs md:text-sm text-blue-400 space-y-1 text-left">
                    <li>• Our AI experts will analyze your business needs</li>
                    <li>• We'll research the best solutions for your industry</li>
                    <li>• You'll receive a comprehensive report with actionable recommendations</li>
                    <li>• Optional: Schedule a free consultation to discuss implementation</li>
                  </ul>
                </div>

                <button
                  onClick={() => window.location.reload()}
                  className="px-4 md:px-6 py-2 md:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm md:text-base"
                >
                  Start Another Audit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render the appropriate layout based on the selected variant
  const renderLayout = () => {
    const layoutProps = {
      currentStep,
      totalSteps: FORM_STEPS.length,
      completionScore,
      isValid,
      isSubmitting: isSubmitting || isAnimating, // Disable during animation
      formSteps: FORM_STEPS,
      onPrev: handlePrevStep,
      onNext: handleNextStep,
      onSubmit: handleSubmit,
      animationDirection,
      children: (
        <CurrentStepComponent
          data={formData}
          onChange={updateFormData}
          onNext={handleNextStep}
        />
      )
    };

    if (layoutVariant === 'split') {
      return <SplitLayout {...layoutProps} />;
    } else {
      return <CenteredLayout {...layoutProps} />;
    }
  };

  return (
    <>
      {renderLayout()}

      {/* Layout Selector for Development */}
      <LayoutSelector
        currentLayout={layoutVariant}
        onLayoutChange={setLayoutVariant}
      />

      {/* Debug Panel for Development */}
      <DebugPanel />
    </>
  );
};
