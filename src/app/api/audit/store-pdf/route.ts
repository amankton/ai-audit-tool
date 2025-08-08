import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

// Validation schema for PDF storage request
const pdfStorageSchema = z.object({
  submissionId: z.string().min(1, 'Submission ID is required'),
  email: z.string().email('Valid email is required'),
  companyName: z.string().min(1, 'Company name is required'),
  pdfData: z.string().min(1, 'PDF data is required'),
  filename: z.string().min(1, 'Filename is required'),
  fileSize: z.number().min(0, 'File size must be non-negative'),
  timestamp: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received PDF storage request for:', body.email, body.companyName);
    
    // Validate the request data
    const validatedData = pdfStorageSchema.parse(body);
    
    // Validate PDF data format (inline validation)
    if (!validatedData.pdfData || !validatedData.pdfData.startsWith('data:application/pdf;base64,')) {
      console.error('Invalid PDF data received - must be base64 encoded PDF');
      return NextResponse.json(
        { success: false, error: 'Invalid PDF data format' },
        { status: 400 }
      );
    }

    // Find the audit submission using multiple identifiers for better matching
    let submission = await prisma.auditSubmission.findFirst({
      where: {
        OR: [
          // Try to match by submissionId in formData
          {
            formData: {
              path: ['submissionId'],
              equals: validatedData.submissionId
            }
          },
          // Fallback to email and company name match
          {
            AND: [
              { email: validatedData.email },
              {
                formData: {
                  path: ['companyName'],
                  equals: validatedData.companyName
                }
              }
            ]
          }
        ]
      },
      include: {
        auditReports: true
      }
    });

    if (!submission) {
      console.error('Audit submission not found for:', {
        submissionId: validatedData.submissionId,
        email: validatedData.email,
        companyName: validatedData.companyName
      });
      return NextResponse.json(
        { success: false, error: 'Audit submission not found' },
        { status: 404 }
      );
    }

    console.log('Found submission:', submission.id);

    // Save PDF data to file system (inline implementation)
    let pdfUrl: string;
    try {
      // Extract base64 data from data URL
      const base64Data = validatedData.pdfData.replace(/^data:application\/pdf;base64,/, '');
      const buffer = Buffer.from(base64Data, 'base64');

      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'reports');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedFilename = validatedData.filename.replace(/[^a-zA-Z0-9.-]/g, '_');
      const filename = `${timestamp}-${sanitizedFilename}`;
      const filePath = path.join(uploadsDir, filename);

      // Write PDF file
      fs.writeFileSync(filePath, buffer);
      pdfUrl = `/uploads/reports/${filename}`;

      console.log('PDF saved successfully:', pdfUrl);
    } catch (pdfError) {
      console.error('Error saving PDF data:', pdfError);
      return NextResponse.json(
        { success: false, error: 'Failed to save PDF file' },
        { status: 500 }
      );
    }

    // Check if an audit report already exists for this submission
    let auditReport = submission.auditReports[0];
    
    if (auditReport) {
      // Update existing audit report with PDF information
      auditReport = await prisma.auditReport.update({
        where: { id: auditReport.id },
        data: {
          pdfUrl: pdfUrl,
          reportData: {
            ...auditReport.reportData as any,
            pdfMetadata: {
              filename: validatedData.filename,
              fileSize: validatedData.fileSize,
              storedAt: new Date().toISOString(),
              originalTimestamp: validatedData.timestamp
            }
          }
        }
      });
      console.log('Updated existing audit report:', auditReport.id);
    } else {
      // Create new audit report with PDF information
      auditReport = await prisma.auditReport.create({
        data: {
          submissionId: submission.id,
          reportType: 'comprehensive',
          reportData: {
            status: 'pdf_generated',
            pdfMetadata: {
              filename: validatedData.filename,
              fileSize: validatedData.fileSize,
              storedAt: new Date().toISOString(),
              originalTimestamp: validatedData.timestamp
            }
          },
          pdfUrl: pdfUrl,
          generatedAt: new Date(),
        }
      });
      console.log('Created new audit report:', auditReport.id);
    }

    // Update submission status to indicate PDF is ready
    await prisma.auditSubmission.update({
      where: { id: submission.id },
      data: {
        submissionStatus: 'pdf_ready',
        calculatedMetrics: {
          ...submission.calculatedMetrics as any,
          pdfGenerated: true,
          pdfGeneratedAt: new Date().toISOString(),
          pdfFileSize: validatedData.fileSize
        }
      }
    });

    console.log('Successfully stored PDF for submission:', submission.id);

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      reportId: auditReport.id,
      pdfUrl: pdfUrl,
      message: 'PDF stored successfully in database'
    });

  } catch (error) {
    console.error('Error storing PDF in database:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
