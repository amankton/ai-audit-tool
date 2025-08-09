import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;

    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Filename is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to serve PDF from database:', filename);

    // Find the audit report with this filename
    const auditReport = await prisma.auditReport.findFirst({
      where: {
        pdfFilename: {
          contains: filename.replace(/^\d+-/, '') // Remove timestamp prefix
        }
      },
      select: {
        pdfData: true,
        pdfFilename: true,
        pdfFileSize: true
      }
    });

    if (!auditReport || !auditReport.pdfData) {
      console.error('PDF not found in database:', filename);
      return NextResponse.json(
        { success: false, error: 'PDF file not found' },
        { status: 404 }
      );
    }

    console.log('Serving PDF from database:', {
      filename: auditReport.pdfFilename,
      size: auditReport.pdfFileSize,
      bufferLength: auditReport.pdfData.length
    });

    // Return the PDF file from database
    return new NextResponse(auditReport.pdfData, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': auditReport.pdfData.length.toString(),
        'Content-Disposition': `inline; filename="${auditReport.pdfFilename || filename}"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    });

  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Error serving PDF file', details: (error as Error).message },
      { status: 500 }
    );
  }
}
