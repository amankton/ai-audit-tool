import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Get all reports with PDF data
    const reports = await prisma.auditReport.findMany({
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

    const debugInfo = [];

    for (const report of reports) {
      const reportInfo = {
        reportId: report.id,
        submissionId: (report.submission.formData as any)?.submissionId,
        email: report.submission.email,
        companyName: (report.submission.formData as any)?.companyName,
        
        // PDF Database Info
        pdfUrl: report.pdfUrl,
        pdfFilename: report.pdfFilename,
        pdfFileSize: report.pdfFileSize,
        pdfStoredAt: report.pdfStoredAt,
        
        // File System Check
        fileSystemCheck: null,
        actualFileSize: null,
        fileExists: false,
        fullFilePath: null
      };

      // Check if PDF file exists on disk
      if (report.pdfUrl) {
        try {
          const fullPath = path.join(process.cwd(), 'public', report.pdfUrl);
          reportInfo.fullFilePath = fullPath;
          
          if (fs.existsSync(fullPath)) {
            reportInfo.fileExists = true;
            const stats = fs.statSync(fullPath);
            reportInfo.actualFileSize = stats.size;
            reportInfo.fileSystemCheck = 'File exists on disk';
          } else {
            reportInfo.fileExists = false;
            reportInfo.fileSystemCheck = 'File NOT found on disk';
          }
        } catch (error) {
          reportInfo.fileSystemCheck = `Error checking file: ${error.message}`;
        }
      } else {
        reportInfo.fileSystemCheck = 'No PDF URL in database';
      }

      debugInfo.push(reportInfo);
    }

    // Check uploads directory structure
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'reports');
    let directoryInfo = {
      uploadsDirectoryExists: false,
      uploadsDirectoryPath: uploadsDir,
      filesInDirectory: []
    };

    try {
      if (fs.existsSync(uploadsDir)) {
        directoryInfo.uploadsDirectoryExists = true;
        const files = fs.readdirSync(uploadsDir);
        directoryInfo.filesInDirectory = files.map(file => {
          const filePath = path.join(uploadsDir, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime
          };
        });
      } else {
        directoryInfo.uploadsDirectoryExists = false;
      }
    } catch (error) {
      directoryInfo.error = error.message;
    }

    return NextResponse.json({
      success: true,
      message: 'PDF storage debug information',
      summary: {
        totalReports: reports.length,
        reportsWithPdfUrl: reports.filter(r => r.pdfUrl).length,
        reportsWithActualFiles: debugInfo.filter(r => r.fileExists).length
      },
      directoryInfo,
      reports: debugInfo
    });

  } catch (error) {
    console.error('Error debugging PDF storage:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
