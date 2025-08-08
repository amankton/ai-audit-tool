import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

const prisma = new PrismaClient();

// Simulate the n8n webhook for local testing
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received webhook simulation request:', {
      email: body.email,
      companyName: body.companyName,
      submissionId: body.submissionId
    });

    // First, create the audit submission record if it doesn't exist
    try {
      let submission = await prisma.auditSubmission.findFirst({
        where: {
          formData: {
            path: ['submissionId'],
            equals: body.submissionId
          }
        }
      });

      if (!submission) {
        console.log('Creating audit submission record...');

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
        }

        // Create audit submission
        submission = await prisma.auditSubmission.create({
          data: {
            companyId: company.id,
            email: body.email,
            submissionStatus: 'in_progress',
            completionPercentage: 100,
            formData: {
              ...body,
              submissionId: body.submissionId,
              companyName: body.companyName,
              email: body.email,
              timestamp: body.timestamp
            },
            calculatedMetrics: {
              simulatedSubmission: true,
              createdAt: new Date().toISOString()
            }
          }
        });

        console.log('Created submission:', submission.id);
      } else {
        console.log('Found existing submission:', submission.id);
      }
    } catch (dbError) {
      console.error('Error creating submission:', dbError);
      // Continue anyway - the webhook-response endpoint will handle missing submissions
    }

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Create a mock PDF data (small valid PDF)
    const mockPdfData = 'JVBERi0xLjQKJcOkw7zDtsO4CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0KQnQKL0YxIDEyIFRmCjcyIDcyMCBUZAooSGVsbG8gV29ybGQhKSBUagpFVApzdHJlYW0KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDQgMCBSCj4+CmVuZG9iago0IDAgb2JqCjw8Ci9UeXBlIC9QYWdlcwovS2lkcyBbNSAwIFJdCi9Db3VudCAxCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9UeXBlIC9QYWdlCi9QYXJlbnQgNCAwIFIKL01lZGlhQm94IFswIDAgNjEyIDc5Ml0KL0NvbnRlbnRzIDIgMCBSCi9SZXNvdXJjZXMgPDwKL0ZvbnQgPDwKL0YxIDYgMCBSCj4+Cj4+Cj4+CmVuZG9iago2IDAgb2JqCjw8Ci9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQo+PgplbmRvYmoKeHJlZgowIDcKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNzQgMDAwMDAgbiAKMDAwMDAwMDE3OCAwMDAwMCBuIAowMDAwMDAwMjI1IDAwMDAwIG4gCjAwMDAwMDAyODIgMDAwMDAgbiAKMDAwMDAwMDQzNCAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDcKL1Jvb3QgMyAwIFIKPj4Kc3RhcnR4cmVmCjUzMQolJUVPRg==';

    // Simulate the response format that would come from n8n
    const simulatedResponse = {
      success: true,
      submissionId: body.submissionId,
      email: body.email,
      timestamp: body.timestamp,
      business_overview: {
        company_name: body.companyName || 'Test Company',
        industry: body.industry || 'Technology'
      },
      data: {
        fileName: `${(body.companyName || 'Test_Company').replace(/[^a-zA-Z0-9]/g, '_')}_AI_Audit_Report.pdf`,
        fileExtension: 'pdf',
        mimeType: 'application/pdf',
        fileSize: Buffer.from(mockPdfData, 'base64').length,
        data: mockPdfData
      },
      message: 'Simulated PDF generation complete'
    };

    console.log('Sending simulated response to webhook-response endpoint');

    // Send the simulated response to our webhook-response endpoint
    try {
      const webhookResponse = await fetch(`${request.nextUrl.origin}/api/audit/webhook-response`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(simulatedResponse)
      });

      const webhookResult = await webhookResponse.json();
      console.log('Webhook response result:', webhookResult);

      if (webhookResponse.ok) {
        // Return the format expected by the form (N8NAuditResponse)
        return NextResponse.json({
          success: true,
          submissionId: body.submissionId,
          report: {
            executiveSummary: `Based on our analysis of ${body.companyName || 'your company'}, we've identified several key opportunities for AI implementation that could significantly improve operational efficiency and drive growth.`,
            aiReadinessScore: 75,
            industryBenchmark: {
              score: 68,
              percentile: 82,
              industryAverage: 65
            },
            recommendations: [
              {
                category: 'Process Automation',
                priority: 'high' as const,
                title: 'Implement Document Processing Automation',
                description: 'Automate repetitive document processing tasks using AI-powered tools.',
                estimatedImpact: '30% time savings',
                implementationTime: '2-3 months',
                estimatedCost: '$15,000 - $25,000'
              },
              {
                category: 'Customer Service',
                priority: 'medium' as const,
                title: 'Deploy AI Chatbot for Customer Support',
                description: 'Implement an intelligent chatbot to handle common customer inquiries.',
                estimatedImpact: '40% reduction in support tickets',
                implementationTime: '1-2 months',
                estimatedCost: '$8,000 - $15,000'
              }
            ],
            implementationRoadmap: [
              {
                phase: 1,
                title: 'Foundation & Planning',
                duration: '4-6 weeks',
                tasks: ['Data audit and preparation', 'Team training', 'Tool selection'],
                expectedOutcomes: ['Clean data infrastructure', 'Trained team', 'Selected AI tools']
              },
              {
                phase: 2,
                title: 'Implementation',
                duration: '8-12 weeks',
                tasks: ['Deploy automation tools', 'Integrate systems', 'Test workflows'],
                expectedOutcomes: ['Working AI systems', 'Integrated workflows', 'Tested processes']
              }
            ],
            roiProjections: {
              timeToBreakeven: '8-12 months',
              yearOneROI: 180,
              threeYearROI: 350,
              costSavings: {
                annual: 45000,
                breakdown: {
                  'Labor Cost Reduction': 25000,
                  'Process Efficiency': 15000,
                  'Error Reduction': 5000
                }
              }
            },
            riskAssessment: {
              overallRisk: 'low' as const,
              risks: [
                {
                  category: 'Technical',
                  level: 'low' as const,
                  description: 'Integration complexity with existing systems',
                  mitigation: 'Phased implementation approach with thorough testing'
                }
              ]
            },
            nextSteps: [
              'Schedule a consultation to discuss implementation details',
              'Conduct a detailed data audit',
              'Begin team training on AI tools',
              'Start with pilot project in one department'
            ],
            generatedAt: new Date().toISOString(),
            formats: {
              pdf: {
                data: undefined, // PDF data is handled separately
                url: webhookResult.pdfUrl,
                filename: `${(body.companyName || 'Company').replace(/[^a-zA-Z0-9]/g, '_')}_AI_Audit_Report.pdf`,
                size: 616
              }
            }
          },
          processingTime: 8500,
          message: 'Audit processed successfully (simulated)',
          pdfStored: webhookResult.success,
          pdfUrl: webhookResult.pdfUrl,
          reportId: webhookResult.reportId
        });
      } else {
        throw new Error(`Webhook response failed: ${webhookResult.error}`);
      }
    } catch (webhookError) {
      console.error('Error calling webhook-response:', webhookError);
      return NextResponse.json({
        success: false,
        error: 'Failed to store PDF in database',
        details: (webhookError as Error).message
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Webhook simulation error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
