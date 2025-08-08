import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@/generated/prisma';

export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const checks = {
    database: { status: 'unknown', responseTime: 0, error: null },
    filesystem: { status: 'unknown', error: null },
    environment: { status: 'unknown', missing: [] },
    n8n: { status: 'unknown', error: null }
  };

  // Check database connectivity
  try {
    const dbStart = Date.now();
    const prisma = new PrismaClient();
    await prisma.$queryRaw`SELECT 1`;
    await prisma.$disconnect();
    checks.database = {
      status: 'healthy',
      responseTime: Date.now() - dbStart,
      error: null
    };
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      error: (error as Error).message
    };
  }

  // Check filesystem (uploads directory)
  try {
    const fs = require('fs');
    const path = require('path');
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'reports');
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    
    // Test write permissions
    const testFile = path.join(uploadsDir, 'health-check.txt');
    fs.writeFileSync(testFile, 'health check');
    fs.unlinkSync(testFile);
    
    checks.filesystem = { status: 'healthy', error: null };
  } catch (error) {
    checks.filesystem = { status: 'unhealthy', error: error.message };
  }

  // Check environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'N8N_WEBHOOK_URL'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  checks.environment = {
    status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
    missing: missingEnvVars
  };

  // Check n8n webhook accessibility (optional, might be slow)
  const checkN8n = request.nextUrl.searchParams.get('check-n8n') === 'true';
  if (checkN8n) {
    try {
      const n8nUrl = process.env.N8N_WEBHOOK_URL;
      if (n8nUrl) {
        const response = await fetch(n8nUrl, {
          method: 'HEAD',
          signal: AbortSignal.timeout(5000) // 5 second timeout
        });
        checks.n8n = {
          status: response.ok ? 'healthy' : 'unhealthy',
          error: response.ok ? null : `HTTP ${response.status}`
        };
      } else {
        checks.n8n = { status: 'unhealthy', error: 'N8N_WEBHOOK_URL not configured' };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      checks.n8n = { status: 'unhealthy', error: msg };
    }
  } else {
    checks.n8n = { status: 'skipped', error: 'Use ?check-n8n=true to test' };
  }

  // Overall health status
  const allHealthy = Object.values(checks).every(check => 
    check.status === 'healthy' || check.status === 'skipped'
  );

  const responseTime = Date.now() - startTime;
  const status = allHealthy ? 200 : 503;

  return NextResponse.json({
    status: allHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    responseTime: `${responseTime}ms`,
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks,
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
      external: Math.round(process.memoryUsage().external / 1024 / 1024)
    }
  }, { status });
}
