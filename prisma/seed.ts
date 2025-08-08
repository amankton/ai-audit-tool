import { PrismaClient } from '../src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Clean up existing data
  await prisma.userInteraction.deleteMany();
  await prisma.auditReport.deleteMany();
  await prisma.auditSubmission.deleteMany();
  await prisma.company.deleteMany();

  // Create sample companies
  const company1 = await prisma.company.create({
    data: {
      name: 'Acme Consulting',
      industry: 'professional-services',
      employeeCountRange: '26-100',
      annualRevenueRange: '2m-10m',
      website: 'https://acmeconsulting.example.com',
    },
  });

  const company2 = await prisma.company.create({
    data: {
      name: 'HealthPlus Medical',
      industry: 'healthcare',
      employeeCountRange: '101-500',
      annualRevenueRange: '10m-50m',
      website: 'https://healthplus.example.com',
    },
  });

  // Create sample audit submissions
  const submission1 = await prisma.auditSubmission.create({
    data: {
      companyId: company1.id,
      email: 'john.doe@acmeconsulting.example.com',
      submissionStatus: 'completed',
      completionPercentage: 100,
      formData: {
        companyName: 'Acme Consulting',
        industry: 'professional-services',
        employeeCount: '26-100',
        revenue: '2m-10m',
        businessGoals: ['improve-efficiency', 'reduce-costs', 'scale-operations'],
        timeConsumingTasks: [
          'Manual data entry for client records',
          'Creating monthly reports',
          'Scheduling client meetings',
          'Invoice processing',
        ],
        repetitiveTaskTime: '15-25',
        techReadiness: {
          currentTools: ['CRM', 'Accounting software', 'Email marketing'],
          comfortLevel: 'medium',
        },
      },
      calculatedMetrics: {
        maturityScore: 3.2,
        priorityAreas: ['Process Automation', 'Cost Optimization'],
        estimatedROI: 35,
        recommendedBudget: 35000,
      },
      completedAt: new Date(),
    },
  });

  // Create sample audit report
  await prisma.auditReport.create({
    data: {
      submissionId: submission1.id,
      reportType: 'comprehensive',
      reportData: {
        executiveSummary: {
          overview: 'Acme Consulting is well-positioned to benefit from AI automation...',
          keyFindings: [
            'Significant time spent on manual data entry',
            'Current tech stack has integration potential',
            'Team is moderately comfortable with new technology',
          ],
          potentialROI: '35% within 12 months',
        },
        recommendations: [
          {
            title: 'Client Data Automation',
            description: 'Implement AI-powered data extraction for client records',
            estimatedCost: '$8,000 - $12,000',
            timeToImplement: '2-3 months',
            potentialSavings: '$25,000/year',
          },
          {
            title: 'Automated Reporting',
            description: 'Deploy report generation system with templates',
            estimatedCost: '$5,000 - $7,000',
            timeToImplement: '1-2 months',
            potentialSavings: '$15,000/year',
          },
        ],
        implementationRoadmap: {
          phase1: 'Assessment and planning (2 weeks)',
          phase2: 'Initial implementation (6 weeks)',
          phase3: 'Training and adoption (4 weeks)',
          phase4: 'Optimization and expansion (ongoing)',
        },
      },
      pdfUrl: 'https://storage.example.com/reports/acme-consulting-ai-audit.pdf',
      generatedAt: new Date(),
      sentAt: new Date(),
      openedAt: new Date(),
    },
  });

  // Create sample user interactions
  await prisma.userInteraction.create({
    data: {
      submissionId: submission1.id,
      interactionType: 'form_step_completed',
      stepName: 'company',
      timeSpent: 120,
      interactionData: {
        completedFields: ['companyName', 'industry', 'employeeCount', 'revenue'],
        skippedFields: [],
      },
    },
  });

  await prisma.userInteraction.create({
    data: {
      submissionId: submission1.id,
      interactionType: 'form_step_completed',
      stepName: 'operations',
      timeSpent: 240,
      interactionData: {
        completedFields: ['businessGoals', 'timeConsumingTasks', 'repetitiveTaskTime'],
        skippedFields: [],
      },
    },
  });

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
