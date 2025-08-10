import { NextRequest, NextResponse } from 'next/server';
import { BulkExportEngine } from '@/lib/ai/bulk-export-engine';

const exportEngine = new BulkExportEngine();

export async function POST(request: NextRequest) {
  try {
    const { mockups, config } = await request.json();

    if (!mockups || !Array.isArray(mockups) || mockups.length === 0) {
      return NextResponse.json({ error: 'No mockups provided' }, { status: 400 });
    }

    const jobId = await exportEngine.createBulkExportJob(mockups, config);
    
    return NextResponse.json({ 
      jobId,
      message: `Started bulk export job for ${mockups.length} mockups`
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}