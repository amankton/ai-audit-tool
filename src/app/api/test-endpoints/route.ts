import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      message: 'API endpoints are working!',
      timestamp: new Date().toISOString(),
      availableEndpoints: [
        'GET /api/test-endpoints - This endpoint',
        'GET /api/audit/test-pdf-storage - Test PDF storage system',
        'POST /api/audit/test-pdf-storage - Create test submission',
        'POST /api/audit/webhook-response - Simulate n8n webhook',
        'GET /api/audit/reports?email=test@example.com - Get reports by email',
        'POST /api/audit/submit - Submit audit form'
      ]
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'POST endpoint is working!',
      receivedData: body,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
