import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all recent submissions from the last 24 hours
    const recentSubmissions = await prisma.auditSubmission.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      include: {
        auditReports: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Get all recent audit reports from the last 24 hours
    const recentReports = await prisma.auditReport.findMany({
      where: {
        generatedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      },
      include: {
        submission: {
          select: {
            email: true,
            formData: true,
            createdAt: true
          }
        }
      },
      orderBy: {
        generatedAt: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Recent activity retrieved',
      timestamp: new Date().toISOString(),
      activity: {
        recentSubmissions: recentSubmissions.map(sub => ({
          id: sub.id,
          email: sub.email,
          companyName: sub.formData?.companyName || 'Unknown',
          submissionId: sub.formData?.submissionId,
          status: sub.submissionStatus,
          createdAt: sub.createdAt,
          completedAt: sub.completedAt,
          hasReports: sub.auditReports.length > 0,
          reportCount: sub.auditReports.length,
          reports: sub.auditReports.map(report => ({
            id: report.id,
            hasPdf: !!report.pdfUrl,
            pdfUrl: report.pdfUrl,
            pdfFilename: report.pdfFilename,
            pdfFileSize: report.pdfFileSize,
            pdfStoredAt: report.pdfStoredAt,
            generatedAt: report.generatedAt
          }))
        })),
        recentReports: recentReports.map(report => ({
          id: report.id,
          submissionEmail: report.submission.email,
          companyName: report.submission.formData?.companyName || 'Unknown',
          submissionId: report.submission.formData?.submissionId,
          hasPdf: !!report.pdfUrl,
          pdfUrl: report.pdfUrl,
          pdfFilename: report.pdfFilename,
          pdfFileSize: report.pdfFileSize,
          pdfStoredAt: report.pdfStoredAt,
          generatedAt: report.generatedAt,
          submissionCreatedAt: report.submission.createdAt
        }))
      },
      summary: {
        totalRecentSubmissions: recentSubmissions.length,
        submissionsWithPdf: recentSubmissions.filter(s => 
          s.auditReports.some(r => !!r.pdfUrl)
        ).length,
        totalRecentReports: recentReports.length,
        reportsWithPdf: recentReports.filter(r => !!r.pdfUrl).length
      }
    });

  } catch (error) {
    console.error('Error checking recent activity:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
