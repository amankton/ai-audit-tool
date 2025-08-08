import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`
}

export function calculateCompletionScore(formData: any): number {
  // Define fields by step with weights
  const stepFields = {
    0: { // Company Basics - 25% of total
      required: ['companyName', 'industry', 'employeeCount'],
      optional: ['revenue', 'website'],
      weight: 25
    },
    1: { // Business Operations - 25% of total
      required: ['businessGoals', 'timeConsumingTasks'],
      optional: ['repetitiveTaskTime'],
      weight: 25
    },
    2: { // Tech Readiness - 15% of total
      required: [],
      optional: ['techReadiness'],
      weight: 15
    },
    3: { // AI Goals - 15% of total
      required: [],
      optional: ['aiGoals'],
      weight: 15
    },
    4: { // Contact Info - 20% of total
      required: ['email'],
      optional: ['fullName', 'phone', 'preferredContact', 'marketingConsent'],
      weight: 20
    }
  };

  let totalScore = 0;

  // Calculate score for each step
  Object.entries(stepFields).forEach(([stepIndex, stepConfig]) => {
    const { required, optional, weight } = stepConfig;
    let stepScore = 0;

    // Required fields contribute 80% of step weight
    const requiredWeight = weight * 0.8;
    if (required.length > 0) {
      const requiredFieldWeight = requiredWeight / required.length;

      required.forEach(field => {
        if (isFieldCompleted(formData[field])) {
          stepScore += requiredFieldWeight;
        }
      });
    }

    // Optional fields contribute 20% of step weight
    const optionalWeight = weight * 0.2;
    if (optional.length > 0) {
      const optionalFieldWeight = optionalWeight / optional.length;

      optional.forEach(field => {
        if (isFieldCompleted(formData[field])) {
          stepScore += optionalFieldWeight;
        }
      });
    }

    // If no required fields, optional fields get full weight
    if (required.length === 0 && optional.length > 0) {
      stepScore = 0;
      const fullOptionalWeight = weight / optional.length;

      optional.forEach(field => {
        if (isFieldCompleted(formData[field])) {
          stepScore += fullOptionalWeight;
        }
      });
    }

    totalScore += stepScore;
  });

  return Math.round(Math.min(100, Math.max(0, totalScore)));
}

function isFieldCompleted(value: any): boolean {
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === 'object') {
    // For nested objects like techReadiness, aiGoals
    return Object.values(value).some(v => isFieldCompleted(v));
  }
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'boolean') return true; // Booleans are always considered complete
  return true;
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function generateSubmissionId(): string {
  return `sub_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

export function formatPhoneNumber(value: string): string {
  // Remove all non-numeric characters
  const phoneNumber = value.replace(/\D/g, '');

  // Don't format if empty
  if (!phoneNumber) return '';

  // Format based on length
  if (phoneNumber.length <= 3) {
    return `(${phoneNumber}`;
  } else if (phoneNumber.length <= 6) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
  } else if (phoneNumber.length <= 10) {
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6)}`;
  } else {
    // Handle numbers with country code (11+ digits)
    return `+${phoneNumber.slice(0, 1)} (${phoneNumber.slice(1, 4)}) ${phoneNumber.slice(4, 7)}-${phoneNumber.slice(7, 11)}`;
  }
}

// N8N Response Types for Multiple Formats
export interface N8NAuditResponse {
  success: boolean;
  submissionId: string;
  report?: {
    // Core report data
    executiveSummary: string;
    aiReadinessScore: number;
    industryBenchmark: {
      score: number;
      percentile: number;
      industryAverage: number;
    };
    recommendations: Array<{
      category: string;
      priority: 'high' | 'medium' | 'low';
      title: string;
      description: string;
      estimatedImpact: string;
      implementationTime: string;
      estimatedCost: string;
    }>;
    implementationRoadmap: Array<{
      phase: number;
      title: string;
      duration: string;
      tasks: string[];
      expectedOutcomes: string[];
    }>;
    roiProjections: {
      timeToBreakeven: string;
      yearOneROI: number;
      threeYearROI: number;
      costSavings: {
        annual: number;
        breakdown: Record<string, number>;
      };
    };
    riskAssessment: {
      overallRisk: 'low' | 'medium' | 'high';
      risks: Array<{
        category: string;
        level: 'low' | 'medium' | 'high';
        description: string;
        mitigation: string;
      }>;
    };
    nextSteps: string[];
    generatedAt: string;

    // Multiple format outputs
    formats: {
      pdf?: {
        data?: string; // Base64 encoded PDF data
        url?: string;  // URL to PDF file
        filename: string;
        size?: number; // bytes
      };
      html?: {
        content: string;
        title: string;
      };
      markdown?: {
        content: string;
        filename: string;
      };
    };
  };
  error?: string;
  processingTime?: number;
}

// Client-side utility functions only
// Server-side PDF functions are in server-utils.ts

export function getIndustryInsights(industry: string) {
  const insights = {
    'professional-services': {
      commonUseCases: ['Document automation', 'Client communication', 'Billing optimization'],
      avgROI: 35,
      implementationTime: '2-4 months',
      challenges: ['Client confidentiality', 'Regulatory compliance'],
      opportunities: ['Process standardization', 'Client self-service portals']
    },
    'healthcare': {
      commonUseCases: ['Appointment scheduling', 'Patient follow-up', 'Insurance processing'],
      avgROI: 45,
      implementationTime: '3-6 months',
      challenges: ['HIPAA compliance', 'Integration complexity'],
      opportunities: ['Patient experience', 'Administrative efficiency']
    },
    'retail': {
      commonUseCases: ['Inventory management', 'Customer service', 'Price optimization'],
      avgROI: 40,
      implementationTime: '2-3 months',
      challenges: ['Seasonal variations', 'Multi-channel complexity'],
      opportunities: ['Personalization', 'Supply chain optimization']
    },
    'manufacturing': {
      commonUseCases: ['Quality control', 'Predictive maintenance', 'Supply chain'],
      avgROI: 50,
      implementationTime: '4-8 months',
      challenges: ['Legacy systems', 'Safety requirements'],
      opportunities: ['Operational efficiency', 'Predictive analytics']
    },
    'real-estate': {
      commonUseCases: ['Lead qualification', 'Property valuation', 'Document processing'],
      avgROI: 30,
      implementationTime: '2-4 months',
      challenges: ['Market volatility', 'Regulatory changes'],
      opportunities: ['Customer experience', 'Market analysis']
    },
    'technology': {
      commonUseCases: ['Code review', 'Customer support', 'Data analysis'],
      avgROI: 55,
      implementationTime: '1-3 months',
      challenges: ['Rapid technology changes', 'Talent competition'],
      opportunities: ['Product innovation', 'Development acceleration']
    }
  };
  
  return insights[industry as keyof typeof insights] || {
    commonUseCases: ['Process automation', 'Data analysis', 'Customer service'],
    avgROI: 35,
    implementationTime: '2-4 months',
    challenges: ['Change management', 'Integration complexity'],
    opportunities: ['Efficiency gains', 'Cost reduction']
  };
}
