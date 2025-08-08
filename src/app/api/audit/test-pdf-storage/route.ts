import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get recent audit submissions with their reports
    const submissions = await prisma.auditSubmission.findMany({
      include: {
        auditReports: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    });

    const summary = submissions.map(submission => ({
      id: submission.id,
      email: submission.email,
      companyName: submission.formData?.companyName || 'Unknown',
      status: submission.submissionStatus,
      createdAt: submission.createdAt,
      completedAt: submission.completedAt,
      hasReport: submission.auditReports.length > 0,
      reports: submission.auditReports.map(report => ({
        id: report.id,
        hasPdf: !!report.pdfUrl,
        pdfUrl: report.pdfUrl,
        pdfFilename: report.pdfFilename,
        pdfFileSize: report.pdfFileSize,
        pdfStoredAt: report.pdfStoredAt,
        generatedAt: report.generatedAt
      }))
    }));

    return NextResponse.json({
      success: true,
      message: 'PDF storage test - recent submissions',
      submissions: summary,
      totalSubmissions: submissions.length,
      submissionsWithPdf: submissions.filter(s =>
        s.auditReports.some(r => !!r.pdfUrl)
      ).length
    });

  } catch (error) {
    console.error('Error in PDF storage test:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Create a test submission for PDF storage testing
    const testSubmission = await prisma.auditSubmission.create({
      data: {
        companyId: 'test-company-id',
        email: body.email || 'test@example.com',
        submissionStatus: 'in_progress',
        completionPercentage: 100,
        formData: {
          submissionId: `test_${Date.now()}`,
          companyName: body.companyName || 'Test Company',
          industry: 'Technology',
          email: body.email || 'test@example.com',
          timestamp: new Date().toISOString()
        },
        calculatedMetrics: {
          testSubmission: true,
          createdForPdfTesting: true
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Test submission created for PDF storage testing',
      submission: {
        id: testSubmission.id,
        submissionId: (testSubmission.formData as any)?.submissionId,
        email: testSubmission.email,
        companyName: (testSubmission.formData as any)?.companyName,
        webhookTestUrl: `${request.nextUrl.origin}/api/audit/webhook-response`,
        testPayload: {
          submissionId: (testSubmission.formData as any)?.submissionId,
          email: testSubmission.email,
          timestamp: new Date().toISOString(),
          business_overview: {
            company_name: (testSubmission.formData as any)?.companyName,
            industry: 'Technology'
          },
          data: {
            fileName: `${(testSubmission.formData as any)?.companyName}_AI_Audit_Report.pdf`,
            fileExtension: 'pdf',
            mimeType: 'application/pdf',
            fileSize: 813000, // Example size
            data: 'JVBERi0xLjQKJcOkw7zDtsO4CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0KQNP...' // Truncated base64 PDF data
          }
        }
      }
    });

  } catch (error) {
    console.error('Error creating test submission:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}