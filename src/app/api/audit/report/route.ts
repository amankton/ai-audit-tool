import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';
import { N8NAuditResponse } from '@/lib/utils';
import { savePdfData, validatePdfData } from '@/lib/server-utils';

const prisma = new PrismaClient();

// Validation schema for N8N response
const n8nResponseSchema = z.object({
  success: z.boolean(),
  submissionId: z.string(),
  report: z.object({
    executiveSummary: z.string(),
    aiReadinessScore: z.number().min(0).max(100),
    industryBenchmark: z.object({
      score: z.number(),
      percentile: z.number(),
      industryAverage: z.number(),
    }),
    recommendations: z.array(z.object({
      category: z.string(),
      priority: z.enum(['high', 'medium', 'low']),
      title: z.string(),
      description: z.string(),
      estimatedImpact: z.string(),
      implementationTime: z.string(),
      estimatedCost: z.string(),
    })),
    implementationRoadmap: z.array(z.object({
      phase: z.number(),
      title: z.string(),
      duration: z.string(),
      tasks: z.array(z.string()),
      expectedOutcomes: z.array(z.string()),
    })),
    roiProjections: z.object({
      timeToBreakeven: z.string(),
      yearOneROI: z.number(),
      threeYearROI: z.number(),
      costSavings: z.object({
        annual: z.number(),
        breakdown: z.record(z.number()),
      }),
    }),
    riskAssessment: z.object({
      overallRisk: z.enum(['low', 'medium', 'high']),
      risks: z.array(z.object({
        category: z.string(),
        level: z.enum(['low', 'medium', 'high']),
        description: z.string(),
        mitigation: z.string(),
      })),
    }),
    nextSteps: z.array(z.string()),
    generatedAt: z.string(),

    // Multiple format outputs
    formats: z.object({
      pdf: z.object({
        data: z.string().optional(), // Base64 encoded PDF data
        url: z.string().optional(),  // URL to PDF file
        filename: z.string(),
        size: z.number().optional(),
      }).optional(),
      html: z.object({
        content: z.string(),
        title: z.string(),
      }).optional(),
      markdown: z.object({
        content: z.string(),
        filename: z.string(),
      }).optional(),
    }),
  }).optional(),
  error: z.string().optional(),
  processingTime: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received N8N response:', body);
    
    // Validate the N8N response
    const validatedResponse = n8nResponseSchema.parse(body);
    
    if (!validatedResponse.success) {
      console.error('N8N processing failed:', validatedResponse.error);
      return NextResponse.json(
        { success: false, error: validatedResponse.error || 'N8N processing failed' },
        { status: 400 }
      );
    }

    if (!validatedResponse.report) {
      console.error('No report data in N8N response');
      return NextResponse.json(
        { success: false, error: 'No report data received from N8N' },
        { status: 400 }
      );
    }

    // Find the audit submission
    const submission = await prisma.auditSubmission.findFirst({
      where: { 
        formData: {
          path: ['submissionId'],
          equals: validatedResponse.submissionId
        }
      }
    });

    if (!submission) {
      console.error('Audit submission not found:', validatedResponse.submissionId);
      return NextResponse.json(
        { success: false, error: 'Audit submission not found' },
        { status: 404 }
      );
    }

    // Handle PDF data storage
    let pdfUrl = validatedResponse.report.formats.pdf?.url || null;

    if (validatedResponse.report.formats.pdf?.data) {
      try {
        // Validate PDF data
        if (!validatePdfData(validatedResponse.report.formats.pdf.data)) {
          throw new Error('Invalid PDF data received');
        }

        // Save PDF data to file system
        const savedPdfUrl = await savePdfData(
          validatedResponse.report.formats.pdf.data,
          validatedResponse.report.formats.pdf.filename
        );
        pdfUrl = savedPdfUrl;
        console.log('PDF saved successfully:', savedPdfUrl);
      } catch (pdfError) {
        console.error('Error saving PDF data:', pdfError);
        // Continue without PDF URL if saving fails
      }
    }

    // Create the audit report
    const auditReport = await prisma.auditReport.create({
      data: {
        submissionId: submission.id,
        reportType: 'comprehensive',
        reportData: validatedResponse.report,
        pdfUrl: pdfUrl,
        generatedAt: new Date(validatedResponse.report.generatedAt),
      }
    });

    // Update submission status
    await prisma.auditSubmission.update({
      where: { id: submission.id },
      data: {
        submissionStatus: 'completed',
        completedAt: new Date(),
        calculatedMetrics: {
          aiReadinessScore: validatedResponse.report.aiReadinessScore,
          industryBenchmark: validatedResponse.report.industryBenchmark,
          processingTime: validatedResponse.processingTime,
        }
      }
    });

    console.log('Successfully stored audit report:', auditReport.id);

    return NextResponse.json({
      success: true,
      reportId: auditReport.id,
      submissionId: submission.id,
      message: 'Audit report stored successfully'
    });

  } catch (error) {
    console.error('Error storing audit report:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid N8N response format', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve audit reports
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');
    const email = searchParams.get('email');

    if (!submissionId && !email) {
      return NextResponse.json(
        { success: false, error: 'submissionId or email required' },
        { status: 400 }
      );
    }

    let whereClause: any = {};
    
    if (submissionId) {
      whereClause = { submissionId };
    } else if (email) {
      whereClause = { 
        submission: { 
          email: email 
        } 
      };
    }

    const reports = await prisma.auditReport.findMany({
      where: whereClause,
      include: {
        submission: {
          include: {
            company: true
          }
        }
      },
      orderBy: { generatedAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      reports: reports.map(report => ({
        id: report.id,
        reportType: report.reportType,
        generatedAt: report.generatedAt,
        reportData: report.reportData,
        company: report.submission.company.name,
        email: report.submission.email,
      }))
    });

  } catch (error) {
    console.error('Error retrieving audit reports:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
