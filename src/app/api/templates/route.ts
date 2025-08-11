import { NextRequest, NextResponse } from 'next/server';
import { templateService } from '@/lib/templates/template-service';
import { authService } from '@/lib/auth/auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    
    if (type === 'user') {
      const token = request.headers.get('authorization')?.replace('Bearer ', '');
      if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const user = await authService.verifySession(token);
      if (!user) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
      }

      const templates = await templateService.getUserTemplates(user.id);
      return NextResponse.json({ templates });
    }

    const templates = await templateService.getPublicTemplates();
    return NextResponse.json({ templates });
    
  } catch (error) {
    console.error('Templates fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch templates' }, { status: 500 });
  }
}