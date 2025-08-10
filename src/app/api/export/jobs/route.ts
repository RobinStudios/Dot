import { NextRequest, NextResponse } from 'next/server';
import { BulkExportEngine } from '@/lib/ai/bulk-export-engine';

const exportEngine = new BulkExportEngine();

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, filter by user
    const jobs = []; // exportEngine.getUserJobs(userId);
    
    return NextResponse.json({ jobs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}