import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const submissionId = searchParams.get('submissionId');
    const reportId = searchParams.get('reportId');
    const download = searchParams.get('download') === 'true';
    const list = searchParams.get('list') === 'true';

    // If list=true, return all PDFs with download links
    if (list) {
      const reports = await prisma.auditReport.findMany({
        where: {
          pdfUrl: {
            not: null
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
        message: 'All PDFs retrieved',
        pdfs: reports.map(report => ({
          reportId: report.id,
          submissionId: (report.submission.formData as any)?.submissionId,
          email: report.submission.email,
          companyName: (report.submission.formData as any)?.companyName || 'Unknown',
          pdfUrl: report.pdfUrl,
          pdfFilename: report.pdfFilename,
          pdfFileSize: report.pdfFileSize,
          pdfStoredAt: report.pdfStoredAt,
          downloadUrl: `${request.nextUrl.origin}/api/pdf/retrieve?reportId=${report.id}&download=true`,
          viewUrl: `${request.nextUrl.origin}/api/pdf/serve/${path.basename(report.pdfUrl)}`,
          directUrl: `${request.nextUrl.origin}${report.pdfUrl}`,
          generatedAt: report.generatedAt,
          submissionCreatedAt: report.submission.createdAt
        }))
      });
    }

    // Find the specific report
    let report;
    
    if (reportId) {
      report = await prisma.auditReport.findUnique({
        where: { id: reportId },
        include: {
          submission: {
            select: {
              email: true,
              formData: true,
              createdAt: true
            }
          }
        }
      });
    } else if (submissionId) {
      report = await prisma.auditReport.findFirst({
        where: {
          submission: {
            formData: {
              path: ['submissionId'],
              equals: submissionId
            }
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
    } else if (email) {
      report = await prisma.auditReport.findFirst({
        where: {
          submission: {
            email: email
          },
          pdfUrl: {
            not: null
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
    }

    if (!report || !report.pdfUrl) {
      return NextResponse.json(
        { success: false, error: 'PDF not found' },
        { status: 404 }
      );
    }

    // If download=true, serve the PDF file
    if (download) {
      try {
        const filePath = path.join(process.cwd(), 'public', report.pdfUrl);
        
        if (!fs.existsSync(filePath)) {
          return NextResponse.json(
            { success: false, error: 'PDF file not found on disk' },
            { status: 404 }
          );
        }

        const fileBuffer = fs.readFileSync(filePath);
        const filename = report.pdfFilename || 'audit_report.pdf';

        return new NextResponse(fileBuffer, {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': fileBuffer.length.toString(),
          },
        });
      } catch (fileError) {
        console.error('Error reading PDF file:', fileError);
        return NextResponse.json(
          { success: false, error: 'Error reading PDF file' },
          { status: 500 }
        );
      }
    }

    // Return PDF metadata and access URLs
    return NextResponse.json({
      success: true,
      message: 'PDF found',
      pdf: {
        reportId: report.id,
        submissionId: (report.submission.formData as any)?.submissionId,
        email: report.submission.email,
        companyName: (report.submission.formData as any)?.companyName || 'Unknown',
        pdfUrl: report.pdfUrl,
        pdfFilename: report.pdfFilename,
        pdfFileSize: report.pdfFileSize,
        pdfStoredAt: report.pdfStoredAt,
        generatedAt: report.generatedAt,
        submissionCreatedAt: report.submission.createdAt,
        accessUrls: {
          download: `${request.nextUrl.origin}/api/pdf/retrieve?reportId=${report.id}&download=true`,
          view: `${request.nextUrl.origin}/api/pdf/serve/${path.basename(report.pdfUrl)}`,
          directUrl: `${request.nextUrl.origin}${report.pdfUrl}`,
          metadata: `${request.nextUrl.origin}/api/audit/reports?reportId=${report.id}`
        }
      }
    });

  } catch (error) {
    console.error('Error retrieving PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
