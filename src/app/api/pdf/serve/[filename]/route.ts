import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    
    if (!filename) {
      return NextResponse.json(
        { success: false, error: 'Filename is required' },
        { status: 400 }
      );
    }

    // Construct the file path
    const filePath = path.join(process.cwd(), 'public', 'uploads', 'reports', filename);
    
    console.log('Attempting to serve PDF:', {
      filename,
      filePath,
      exists: fs.existsSync(filePath)
    });

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('PDF file not found:', filePath);
      return NextResponse.json(
        { success: false, error: 'PDF file not found' },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = fs.readFileSync(filePath);
    const stats = fs.statSync(filePath);

    console.log('Serving PDF:', {
      filename,
      size: stats.size,
      bufferLength: fileBuffer.length
    });

    // Return the PDF file
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Length': fileBuffer.length.toString(),
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    });

  } catch (error) {
    console.error('Error serving PDF:', error);
    return NextResponse.json(
      { success: false, error: 'Error serving PDF file', details: error.message },
      { status: 500 }
    );
  }
}
