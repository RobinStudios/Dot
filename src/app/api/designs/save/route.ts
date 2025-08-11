import { NextRequest, NextResponse } from 'next/server';
import { supabaseClient } from '@/lib/integrations/supabase-client';

export async function POST(request: NextRequest) {
  try {
    const { elements, name, projectId } = await request.json();

    if (!elements || !Array.isArray(elements)) {
      return NextResponse.json({ 
        error: 'Design elements are required' 
      }, { status: 400 });
    }

    // Save design in memory (persists during app session)
    const savedDesign = {
      id: `design-${Date.now()}`,
      name: name || 'Untitled Design',
      elements,
      projectId,
      createdAt: new Date().toISOString()
    };

    // Store in memory for session persistence
    global.designs = global.designs || new Map();
    global.designs.set(savedDesign.id, savedDesign);

    return NextResponse.json({ 
      success: true, 
      design: savedDesign,
      message: 'Design saved successfully' 
    });

  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || 'Save failed' 
    }, { status: 500 });
  }
}