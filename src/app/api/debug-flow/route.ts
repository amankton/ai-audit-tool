import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // Simple test with default data
    const testData = {
      submissionId: `debug_${Date.now()}`,
      email: 'debug@test.com',
      companyName: 'Debug Company',
      timestamp: new Date().toISOString()
    };

    console.log('Debug flow GET - testing with:', testData);

    // Test webhook simulation
    const webhookResponse = await fetch(`${request.nextUrl.origin}/api/webhook-simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });

    const webhookResult = await webhookResponse.json();
    console.log('Webhook simulation result:', webhookResult);

    return NextResponse.json({
      success: true,
      message: 'Debug flow GET completed',
      testData,
      webhookSimulation: {
        status: webhookResponse.status,
        success: webhookResponse.ok,
        result: webhookResult
      }
    });

  } catch (error) {
    console.error('Debug flow GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Debug flow failed', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Debug flow - received data:', body);

    // Step 1: Test webhook simulation
    console.log('Step 1: Testing webhook simulation...');
    const webhookResponse = await fetch(`${request.nextUrl.origin}/api/webhook-simulate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        submissionId: `debug_${Date.now()}`,
        email: body.email || 'debug@test.com',
        companyName: body.companyName || 'Debug Company',
        timestamp: new Date().toISOString()
      })
    });

    const webhookResult = await webhookResponse.json();
    console.log('Webhook simulation result:', webhookResult);

    return NextResponse.json({
      success: true,
      message: 'Debug flow completed',
      steps: {
        webhookSimulation: {
          status: webhookResponse.status,
          success: webhookResponse.ok,
          result: webhookResult
        }
      }
    });

  } catch (error) {
    console.error('Debug flow error:', error);
    return NextResponse.json(
      { success: false, error: 'Debug flow failed', details: error.message },
      { status: 500 }
    );
  }
}
