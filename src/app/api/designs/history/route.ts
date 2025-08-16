import { NextRequest } from 'next/server';
import { authService } from '@/lib/auth/auth';
import { designVersionService } from '@/lib/db/design_versions';
import { logError, apiError, apiSuccess } from '@/lib/utils/api-helpers';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return apiError('Unauthorized', 401);
    }
    const user = await authService.verifySession(token);
    if (!user) {
      return apiError('Invalid token', 401);
    }
    const { searchParams } = new URL(request.url);
    const designId = searchParams.get('designId');
    if (!designId) {
      return apiError('Design ID required', 400);
    }
    // Fetch design history from DynamoDB
    const history = await designVersionService.getVersions(designId);
    return apiSuccess({ history });
  } catch (error) {
    logError('DesignsHistoryAPI', error);
    return apiError('Failed to fetch design history', 500);
  }
}
