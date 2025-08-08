import { PrismaClient } from '@/generated/prisma';
import fs from 'fs';
import path from 'path';

// PDF Storage Utilities (Server-side only)
export async function savePdfData(pdfData: string, filename: string): Promise<string> {
  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(pdfData, 'base64');

    // Create uploads directory if it doesn't exist
    const uploadsDir = 'public/uploads/reports';

    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const uniqueFilename = `${timestamp}-${filename}`;
    const filePath = path.join(uploadsDir, uniqueFilename);

    // Save file
    fs.writeFileSync(filePath, buffer);

    // Return public URL
    return `/uploads/reports/${uniqueFilename}`;
  } catch (error) {
    console.error('Error saving PDF:', error);
    throw new Error('Failed to save PDF file');
  }
}

export function validatePdfData(data: string): boolean {
  try {
    // Check if it's valid base64
    const buffer = Buffer.from(data, 'base64');
    // Check if it starts with PDF header
    const pdfHeader = buffer.toString('ascii', 0, 4);
    return pdfHeader === '%PDF';
  } catch {
    return false;
  }
}

// Utility functions for PDF and audit report management
export interface AuditReportWithPdf {
  id: string;
  submissionId: string;
  reportType: string;
  pdfUrl: string | null;
  pdfFileSize: number | null;
  pdfFilename: string | null;
  pdfStoredAt: Date | null;
  generatedAt: Date;
  sentAt: Date | null;
  openedAt: Date | null;
  submission: {
    id: string;
    email: string;
    formData: any;
    submissionStatus: string;
    completedAt: Date | null;
  };
}

export async function getAuditReportBySubmissionId(submissionId: string): Promise<AuditReportWithPdf | null> {
  const prisma = new PrismaClient();
  
  try {
    const report = await prisma.auditReport.findFirst({
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
            id: true,
            email: true,
            formData: true,
            submissionStatus: true,
            completedAt: true
          }
        }
      },
      orderBy: {
        generatedAt: 'desc'
      }
    });
    
    return report as AuditReportWithPdf | null;
  } finally {
    await prisma.$disconnect();
  }
}

export async function getAuditReportByEmail(email: string): Promise<AuditReportWithPdf[]> {
  const prisma = new PrismaClient();
  
  try {
    const reports = await prisma.auditReport.findMany({
      where: {
        submission: {
          email: email
        }
      },
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
      },
      orderBy: {
        generatedAt: 'desc'
      }
    });
    
    return reports as AuditReportWithPdf[];
  } finally {
    await prisma.$disconnect();
  }
}

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return 'Unknown size';
  
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`;
}
