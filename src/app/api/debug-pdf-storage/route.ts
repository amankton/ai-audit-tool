import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

function isJsonObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

type ReportInfo = {
  reportId: string;
  submissionId?: string;
  email: string | null;
  companyName?: string;
  pdfUrl: string | null;
  pdfFilename: string | null;
  pdfFileSize: number | null;
  pdfStoredAt: Date | null;
  fileSystemCheck?: string;
  actualFileSize?: number;
  fileExists: boolean;
  fullFilePath?: string;
};

type DirectoryInfo = {
  uploadsDirectoryExists: boolean;
  uploadsDirectoryPath: string;
  filesInDirectory: {
    filename: string;
    size: number;
    created: Date;
    modified: Date;
  }[];
  error?: string;
};

export async function GET(request: NextRequest) {
  try {
    // Get all reports with PDF data
    const reports = await prisma.auditReport.findMany({
      include: {
        submission: {
          select: {
            email: true,
            formData: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        generatedAt: 'desc',
      },
    });

    const debugInfo: ReportInfo[] = [];

    for (const report of reports) {
      const fd = report.submission?.formData;

      let submissionId: string | undefined;
      let companyName: string | undefined;

      if (isJsonObject(fd)) {
        const sId = (fd as Record<string, unknown>).submissionId;
        if (typeof sId === 'string' && sId) submissionId = sId;

        const cName = (fd as Record<string, unknown>).companyName;
        if (typeof cName === 'string' && cName) companyName = cName;
      }

      const reportInfo: ReportInfo = {
        reportId: report.id,
        submissionId,
        email: report.submission?.email ?? null,
        companyName: companyName ?? undefined,
        // PDF Database Info
        pdfUrl: (report as any).pdfUrl ?? null,
        pdfFilename: (report as any).pdfFilename ?? null,
        pdfFileSize: (report as any).pdfFileSize ?? null,
        pdfStoredAt: (report as any).pdfStoredAt ?? null,
        // File System Check (filled below)
        fileExists: false,
      };

      // Check if PDF file exists on disk
      if (reportInfo.pdfUrl) {
        try {
          const fullPath = path.join(process.cwd(), 'public', reportInfo.pdfUrl);
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
        } catch (err) {
          const message = err instanceof Error ? err.message : String(err);
          reportInfo.fileSystemCheck = `Error checking file: ${message}`;
        }
      } else {
        reportInfo.fileSystemCheck = 'No PDF URL in database';
      }

      debugInfo.push(reportInfo);
    }

    // Check uploads directory structure
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'reports');
    let directoryInfo: DirectoryInfo = {
      uploadsDirectoryExists: false,
      uploadsDirectoryPath: uploadsDir,
      filesInDirectory: [],
    };

    try {
      if (fs.existsSync(uploadsDir)) {
        directoryInfo.uploadsDirectoryExists = true;
        const files = fs.readdirSync(uploadsDir);
        directoryInfo.filesInDirectory = files.map((file) => {
          const filePath = path.join(uploadsDir, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
          };
        });
      } else {
        directoryInfo.uploadsDirectoryExists = false;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      directoryInfo.error = message;
    }

    return NextResponse.json({
      success: true,
      message: 'PDF storage debug information',
      summary: {
        totalReports: reports.length,
        reportsWithPdfUrl: debugInfo.filter((r) => !!r.pdfUrl).length,
        reportsWithActualFiles: debugInfo.filter((r) => r.fileExists).length,
      },
      directoryInfo,
      reports: debugInfo,
    });
  } catch (err) {
    console.error('Error debugging PDF storage:', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: message },
      { status: 500 },
    );
  } finally {
    await prisma.$disconnect();
  }
}