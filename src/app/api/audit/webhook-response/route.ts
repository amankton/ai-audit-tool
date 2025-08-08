import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import { z } from 'zod';
import { savePdfData, validatePdfData } from '@/lib/server-utils';

const prisma = new PrismaClient();

// Validation schema for n8n webhook response with PDF file
const webhookResponseSchema = z.object({
  // The original submission data that was sent to n8n
  submissionId: z.string().optional(),
  email: z.string().email().optional(),
  timestamp: z.string().optional(),
  business_overview: z.object({
    company_name: z.string(),
    industry: z.string().optional(),
    employees: z.string().optional(),
    goals: z.array(z.string()).optional(),
  }).optional(),
  
  // The PDF file data from n8n's "Respond to Webhook" node
  data: z.object({
    fileName: z.string(),
    fileExtension: z.string(),
    mimeType: z.string(),
    fileSize: z.number(),
    data: z.string(), // Base64 encoded PDF data
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received n8n webhook response with PDF data');
    
    // Validate the webhook response data
    const validatedData = webhookResponseSchema.parse(body);
    
    // Extract PDF information
    const pdfFile = validatedData.data;
    const companyName = validatedData.business_overview?.company_name || 'Unknown_Company';
    const userEmail = validatedData.email;
    const submissionId = validatedData.submissionId;
    
    console.log('Processing PDF for:', {
      companyName,
      email: userEmail,
      submissionId,
      fileName: pdfFile.fileName,
      fileSize: pdfFile.fileSize
    });

    // Validate PDF data format
    if (!validatePdfData(pdfFile.data)) {
      console.error('Invalid PDF data received from n8n');
      return NextResponse.json(
        { success: false, error: 'Invalid PDF data format' },
        { status: 400 }
      );
    }

    // Find the audit submission using multiple strategies
    let submission = await prisma.auditSubmission.findFirst({
      where: {
        OR: [
          // Strategy 1: Match by submissionId if provided
          ...(submissionId ? [{
            formData: {
              path: ['submissionId'],
              equals: submissionId
            }
          }] : []),
          
          // Strategy 2: Match by email and company name
          ...(userEmail ? [{
            AND: [
              { email: userEmail },
              {
                formData: {
                  path: ['companyName'],
                  equals: companyName
                }
              }
            ]
          }] : []),
          
          // Strategy 3: Match by company name and recent timestamp
          {
            AND: [
              {
                formData: {
                  path: ['companyName'],
                  equals: companyName
                }
              },
              {
                createdAt: {
                  gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Within last 24 hours
                }
              }
            ]
          }
        ]
      },
      include: {
        auditReports: true
      },
      orderBy: {
        createdAt: 'desc' // Get the most recent submission
      }
    });

    if (!submission) {
      console.error('No matching audit submission found for:', {
        submissionId,
        email: userEmail,
        companyName
      });
      return NextResponse.json(
        { success: false, error: 'Audit submission not found' },
        { status: 404 }
      );
    }

    console.log('Found matching submission:', submission.id);

    // Save PDF data to file system
    let pdfUrl: string;
    try {
      // Use the original filename or create a clean one
      const cleanFilename = pdfFile.fileName || `${companyName.replace(/[^a-zA-Z0-9]/g, '_')}_AI_Audit_Report.pdf`;
      pdfUrl = await savePdfData(pdfFile.data, cleanFilename);
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
    
    const pdfMetadata = {
      filename: pdfFile.fileName,
      fileSize: pdfFile.fileSize,
      mimeType: pdfFile.mimeType,
      fileExtension: pdfFile.fileExtension,
      storedAt: new Date().toISOString(),
      originalTimestamp: validatedData.timestamp,
      processedByN8n: true
    };

    if (auditReport) {
      // Update existing audit report with PDF information
      auditReport = await prisma.auditReport.update({
        where: { id: auditReport.id },
        data: {
          pdfUrl: pdfUrl,
          pdfFileSize: pdfFile.fileSize,
          pdfFilename: pdfFile.fileName,
          pdfStoredAt: new Date(),
          reportData: {
            ...auditReport.reportData as any,
            pdfMetadata,
            status: 'completed_with_pdf'
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
            status: 'completed_with_pdf',
            pdfMetadata,
            generatedByN8n: true
          },
          pdfUrl: pdfUrl,
          pdfFileSize: pdfFile.fileSize,
          pdfFilename: pdfFile.fileName,
          pdfStoredAt: new Date(),
          generatedAt: new Date(),
        }
      });
      console.log('Created new audit report:', auditReport.id);
    }

    // Update submission status to indicate PDF is ready
    await prisma.auditSubmission.update({
      where: { id: submission.id },
      data: {
        submissionStatus: 'completed',
        completedAt: new Date(),
        calculatedMetrics: {
          ...submission.calculatedMetrics as any,
          pdfGenerated: true,
          pdfGeneratedAt: new Date().toISOString(),
          pdfFileSize: pdfFile.fileSize,
          pdfUrl: pdfUrl
        }
      }
    });

    console.log('Successfully processed PDF webhook response for submission:', submission.id);

    return NextResponse.json({
      success: true,
      submissionId: submission.id,
      reportId: auditReport.id,
      pdfUrl: pdfUrl,
      pdfMetadata,
      message: 'PDF successfully stored in database'
    });

  } catch (error) {
    console.error('Error processing PDF webhook response:', error);
    
    if (error instanceof z.ZodError) {
      console.error('Validation errors:', error.issues);
      return NextResponse.json(
        { success: false, error: 'Invalid webhook payload format', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
