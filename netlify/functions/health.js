const { PrismaClient } = require('@prisma/client');

exports.handler = async (event, context) => {
  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const startTime = Date.now();
  const checks = {
    database: { status: 'unknown', responseTime: 0, error: null },
    environment: { status: 'unknown', missing: [] },
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
      error: error.message
    };
  }

  // Check environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'N8N_WEBHOOK_URL'
  ];
  
  const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);
  checks.environment = {
    status: missingEnvVars.length === 0 ? 'healthy' : 'unhealthy',
    missing: missingEnvVars
  };

  // Overall health status
  const allHealthy = Object.values(checks).every(check => 
    check.status === 'healthy'
  );

  const responseTime = Date.now() - startTime;
  const statusCode = allHealthy ? 200 : 503;

  return {
    statusCode,
    headers,
    body: JSON.stringify({
      status: allHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV || 'development',
      platform: 'netlify',
      checks,
    }),
  };
};
