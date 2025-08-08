import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';
import { calculateCompletionScore } from '@/lib/utils';

const prisma = new PrismaClient();

// Validation schema for the submission
const submissionSchema = z.object({
  companyName: z.string().min(1),
  industry: z.string().min(1),
  employeeCount: z.string().min(1),
  revenue: z.string().optional(),
  website: z.string().optional(),
  businessGoals: z.array(z.string()).min(1),
  timeConsumingTasks: z.array(z.string()).min(1),
  repetitiveTaskTime: z.string().optional(),
  techReadiness: z.object({
    currentTools: z.array(z.string()).optional(),
    comfortLevel: z.enum(['low', 'medium', 'high']).optional(),
    challenges: z.array(z.string()).optional(),
  }).optional(),
  aiGoals: z.object({
    primaryObjective: z.string().optional(),
    budgetRange: z.string().optional(),
    timeline: z.string().optional(),
    specificUseCases: z.array(z.string()).optional(),
  }).optional(),
  email: z.string().min(1),
  fullName: z.string().optional(),
  phone: z.string().optional(),
  preferredContact: z.enum(['email', 'phone']).optional(),
  marketingConsent: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the submission data
    const validatedData = submissionSchema.parse(body);
    
    // Calculate basic metrics (simplified to avoid errors)
    const completionScore = calculateCompletionScore(validatedData);

    const calculatedMetrics = {
      completionScore,
      submittedAt: new Date().toISOString(),
      industry: validatedData.industry,
      employeeCount: validatedData.employeeCount
    };
    
    // Create or find company
    let company = await prisma.company.findFirst({
      where: { name: validatedData.companyName }
    });
    
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: validatedData.companyName,
          industry: validatedData.industry,
          employeeCountRange: validatedData.employeeCount,
          annualRevenueRange: validatedData.revenue,
          website: validatedData.website,
        }
      });
    }
    
    // Create audit submission
    const submission = await prisma.auditSubmission.create({
      data: {
        companyId: company.id,
        email: validatedData.email,
        submissionStatus: 'completed',
        completionPercentage: completionScore,
        formData: validatedData,
        calculatedMetrics,
        completedAt: new Date(),
      }
    });
    
    // Track user interaction
    await prisma.userInteraction.create({
      data: {
        submissionId: submission.id,
        interactionType: 'form_submitted',
        timeSpent: 0, // This would be calculated on the frontend
        interactionData: {
          completionScore,
          totalSteps: 5,
        }
      }
    });
    
    // Here you would typically trigger the n8n workflow
    // For now, we'll just return the submission ID
    
    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      message: 'Audit submitted successfully'
    });
    
  } catch (error) {
    console.error('Submission error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid form data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
