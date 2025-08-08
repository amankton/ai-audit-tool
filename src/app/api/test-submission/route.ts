import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Creating test submission:', body);

    // Create or find company
    let company = await prisma.company.findFirst({
      where: { name: body.companyName || 'Test Company' }
    });
    
    if (!company) {
      company = await prisma.company.create({
        data: {
          name: body.companyName || 'Test Company',
          industry: body.industry || 'Technology',
          employeeCountRange: body.employeeCount || '1-10',
        }
      });
      console.log('Created company:', company.id);
    }

    // Create audit submission
    const submission = await prisma.auditSubmission.create({
      data: {
        companyId: company.id,
        email: body.email || 'test@example.com',
        submissionStatus: 'in_progress',
        completionPercentage: 100,
        formData: {
          submissionId: body.submissionId || `test_${Date.now()}`,
          companyName: body.companyName || 'Test Company',
          email: body.email || 'test@example.com',
          timestamp: new Date().toISOString(),
          ...body
        },
        calculatedMetrics: {
          testSubmission: true,
          createdAt: new Date().toISOString()
        }
      }
    });

    console.log('Created submission:', submission.id);

    return NextResponse.json({
      success: true,
      message: 'Test submission created successfully',
      submission: {
        id: submission.id,
        submissionId: submission.formData?.submissionId,
        email: submission.email,
        companyName: submission.formData?.companyName,
        status: submission.submissionStatus
      }
    });

  } catch (error) {
    console.error('Error creating test submission:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create test submission', details: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get recent submissions
    const submissions = await prisma.auditSubmission.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        auditReports: true
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Recent submissions retrieved',
      submissions: submissions.map(sub => ({
        id: sub.id,
        submissionId: sub.formData?.submissionId,
        email: sub.email,
        companyName: sub.formData?.companyName,
        status: sub.submissionStatus,
        createdAt: sub.createdAt,
        hasReports: sub.auditReports.length > 0,
        reportCount: sub.auditReports.length
      }))
    });

  } catch (error) {
    console.error('Error retrieving submissions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to retrieve submissions', details: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
