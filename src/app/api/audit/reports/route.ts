import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { getAuditReportBySubmissionId, getAuditReportByEmail, formatFileSize } from '@/lib/server-utils';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const submissionId = searchParams.get('submissionId');
    const email = searchParams.get('email');
    const includeMetadata = searchParams.get('includeMetadata') === 'true';

    if (!submissionId && !email) {
      return NextResponse.json(
        { success: false, error: 'Either submissionId or email parameter is required' },
        { status: 400 }
      );
    }

    let reports;

    if (submissionId) {
      // Get single report by submission ID
      const report = await getAuditReportBySubmissionId(submissionId);
      if (!report) {
        return NextResponse.json(
          { success: false, error: 'Audit report not found' },
          { status: 404 }
        );
      }
      reports = [report];
    } else if (email) {
      // Get all reports for an email
      reports = await getAuditReportByEmail(email);
      if (reports.length === 0) {
        return NextResponse.json(
          { success: false, error: 'No audit reports found for this email' },
          { status: 404 }
        );
      }
    }

    // Format the response
    const formattedReports = reports!.map(report => ({
      id: report.id,
      submissionId: report.submission.id,
      companyName: report.submission.formData?.companyName || 'Unknown Company',
      email: report.submission.email,
      reportType: report.reportType,
      submissionStatus: report.submission.submissionStatus,
      generatedAt: report.generatedAt,
      completedAt: report.submission.completedAt,
      
      // PDF information
      pdf: {
        available: !!report.pdfUrl,
        url: report.pdfUrl,
        filename: report.pdfFilename,
        fileSize: report.pdfFileSize,
        fileSizeFormatted: formatFileSize(report.pdfFileSize),
        storedAt: report.pdfStoredAt,
      },
      
      // Email tracking
      emailSent: !!report.sentAt,
      emailSentAt: report.sentAt,
      emailOpened: !!report.openedAt,
      emailOpenedAt: report.openedAt,
      
      // Include full metadata if requested
      ...(includeMetadata && {
        reportData: report.reportData,
        formData: report.submission.formData,
      })
    }));

    return NextResponse.json({
      success: true,
      reports: formattedReports,
      count: formattedReports.length,
      message: `Found ${formattedReports.length} audit report(s)`
    });

  } catch (error) {
    console.error('Error retrieving audit reports:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint to update report metadata (e.g., mark as opened)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reportId, action, metadata } = body;

    if (!reportId || !action) {
      return NextResponse.json(
        { success: false, error: 'reportId and action are required' },
        { status: 400 }
      );
    }

    let updateData: any = {};

    switch (action) {
      case 'mark_opened':
        updateData.openedAt = new Date();
        break;
      case 'mark_sent':
        updateData.sentAt = new Date();
        break;
      case 'update_metadata':
        if (metadata) {
          updateData.reportData = metadata;
        }
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    const updatedReport = await prisma.auditReport.update({
      where: { id: reportId },
      data: updateData,
      include: {
        submission: {
          select: {
            id: true,
            email: true,
            formData: true,
            submissionStatus: true,
            completedAt: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      report: {
        id: updatedReport.id,
        submissionId: updatedReport.submission.id,
        companyName: updatedReport.submission.formData?.companyName || 'Unknown Company',
        email: updatedReport.submission.email,
        action: action,
        updatedAt: new Date(),
        pdf: {
          available: !!updatedReport.pdfUrl,
          url: updatedReport.pdfUrl,
          filename: updatedReport.pdfFilename,
          fileSize: updatedReport.pdfFileSize,
          fileSizeFormatted: formatFileSize(updatedReport.pdfFileSize),
          storedAt: updatedReport.pdfStoredAt,
        }
      },
      message: `Report ${action} successfully`
    });

  } catch (error) {
    console.error('Error updating audit report:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
