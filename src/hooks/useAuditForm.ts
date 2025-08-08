import { useEffect, useCallback } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { z } from 'zod';
import { calculateCompletionScore, debounce } from '@/lib/utils';

// Form data validation schema
export const formSchema = z.object({
  // Company Basics
  companyName: z.string().min(1, 'Company name is required'),
  industry: z.string().min(1, 'Industry is required'),
  employeeCount: z.string().min(1, 'Employee count is required'),
  revenue: z.string().optional(),
  website: z.string().optional(),
  
  // Business Operations
  businessGoals: z.array(z.string()).min(1, 'Select at least one business goal'),
  timeConsumingTasks: z.array(z.string()).min(1, 'Add at least one time-consuming task'),
  repetitiveTaskTime: z.string().optional(),
  
  // Tech Readiness
  techReadiness: z.object({
    currentTools: z.array(z.string()).optional(),
    comfortLevel: z.enum(['low', 'medium', 'high']).optional(),
    challenges: z.array(z.string()).optional(),
  }).optional(),
  
  // AI Goals
  aiGoals: z.object({
    primaryObjective: z.string().optional(),
    budgetRange: z.string().optional(),
    timeline: z.string().optional(),
    specificUseCases: z.array(z.string()).optional(),
  }).optional(),
  
  // Contact Info
  email: z.string().min(1, 'Email is required'),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  preferredContact: z.enum(['email', 'phone']).optional(),
  marketingConsent: z.boolean().optional(),
});

export type FormData = z.infer<typeof formSchema>;

// Initial form data
const initialFormData: Partial<FormData> = {
  businessGoals: [],
  timeConsumingTasks: [],
  techReadiness: {
    currentTools: [],
    comfortLevel: 'medium',
    challenges: [],
  },
  aiGoals: {
    specificUseCases: [],
  },
  marketingConsent: false,
};

// Form store with Zustand
interface FormStore {
  formData: Partial<FormData>;
  submissionId: string | null;
  completionScore: number;
  currentStep: number;
  isValid: boolean;
  validationErrors: Record<string, string>;
  updateFormData: (data: Partial<FormData>) => void;
  setCurrentStep: (step: number) => void;
  validateCurrentStep: () => boolean;
  resetForm: () => void;
  setSubmissionId: (id: string) => void;
}

export const useFormStore = create<FormStore>()(
  persist(
    (set, get) => ({
      formData: initialFormData,
      submissionId: null,
      completionScore: 0,
      currentStep: 0,
      isValid: false,
      validationErrors: {},
      
      updateFormData: (data) => {
        const updatedData = { ...get().formData, ...data };
        const score = calculateCompletionScore(updatedData);

        set({
          formData: updatedData,
          completionScore: score,
        });
      },
      
      setCurrentStep: (step) => {
        set({ currentStep: step });
      },
      
      validateCurrentStep: () => {
        const { formData, currentStep } = get();
        let isValid = false;
        const errors: Record<string, string> = {};

        // Validate based on current step
        try {
          switch (currentStep) {
            case 0: // Company Basics
              z.object({
                companyName: formSchema.shape.companyName,
                industry: formSchema.shape.industry,
                employeeCount: formSchema.shape.employeeCount,
              }).parse(formData);
              isValid = true;
              break;

            case 1: // Business Operations
              z.object({
                businessGoals: formSchema.shape.businessGoals,
                timeConsumingTasks: formSchema.shape.timeConsumingTasks,
              }).parse(formData);
              isValid = true;
              break;

            case 2: // Tech Readiness
              // No required fields
              isValid = true;
              break;

            case 3: // AI Goals
              // No required fields
              isValid = true;
              break;

            case 4: // Contact Info
              z.object({
                email: formSchema.shape.email,
              }).parse(formData);
              isValid = true;
              break;
          }
        } catch (error) {
          if (error instanceof z.ZodError && error.issues?.length) {
            error.issues.forEach((err: any) => {
              if (err?.path && Array.isArray(err.path)) {
                const path = err.path.join('.');
                errors[path] = err.message || 'Validation error';
              }
            });
          }
        }
        set({ isValid, validationErrors: errors });
        return isValid;
      },
      
      resetForm: () => set({
        formData: initialFormData,
        submissionId: null,
        completionScore: 0,
        currentStep: 0,
        isValid: false,
        validationErrors: {},
      }),
      
      setSubmissionId: (id) => set({ submissionId: id }),
    }),
    {
      name: 'ai-audit-form',
    }
  )
);

// React hook for form state management
export function useAuditForm() {
  const {
    formData,
    submissionId,
    completionScore,
    currentStep,
    isValid,
    validationErrors,
    updateFormData,
    setCurrentStep,
    validateCurrentStep,
    resetForm,
    setSubmissionId,
  } = useFormStore();
  
  // Validate current step when form data or step changes
  useEffect(() => {
    // Add a small delay to ensure state is properly updated
    const timeoutId = setTimeout(() => {
      validateCurrentStep();
    }, 10);

    return () => clearTimeout(timeoutId);
  }, [formData, currentStep, validateCurrentStep]);

  // Auto-save form data every 30 seconds
  useEffect(() => {
    const autoSave = debounce(() => {
      console.log('Auto-saving form data...');
      // Here you would typically call an API to save the form data
      // For now, we're just using localStorage via Zustand persist
    }, 30000);

    autoSave();

    return () => {
      // Clean up
    };
  }, [formData]);
  
  // Navigate to next step
  const nextStep = useCallback(() => {
    if (validateCurrentStep()) {
      setCurrentStep(Math.min(currentStep + 1, 4));
    }
  }, [currentStep, validateCurrentStep, setCurrentStep]);
  
  // Navigate to previous step
  const prevStep = useCallback(() => {
    setCurrentStep(Math.max(currentStep - 1, 0));
  }, [currentStep, setCurrentStep]);
  
  // Submit form
  const submitForm = useCallback(async () => {
    if (validateCurrentStep()) {
      try {
        const response = await fetch('/api/audit/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formData),
        });

        const result = await response.json();

        if (result.success) {
          setSubmissionId(result.submissionId);
          return result.submissionId;
        } else {
          throw new Error(result.error || 'Submission failed');
        }
      } catch (error) {
        console.error('Error submitting form:', error);
        throw error;
      }
    }
    return null;
  }, [formData, validateCurrentStep, setSubmissionId]);
  
  return {
    currentStep,
    formData,
    submissionId,
    completionScore,
    isValid,
    validationErrors,
    nextStep,
    prevStep,
    updateFormData,
    submitForm,
    resetForm,
  };
}
