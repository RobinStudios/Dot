export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  // Remove HTML tags and dangerous characters
  const cleaned = input.replace(/[<>"'&]/g, '').replace(/\b(script|javascript|vbscript|onload|onerror)\b/gi, '');
  // Additional sanitization for prompt injection
  return cleaned.trim().substring(0, 1000);
}

export function validateMockupData(mockup: any): boolean {
  if (!mockup || typeof mockup !== 'object') return false;
  if (!mockup.id || typeof mockup.id !== 'string') return false;
  if (mockup.elements && !Array.isArray(mockup.elements)) return false;
  return true;
}

export function sanitizeLogData(data: any): string {
  if (typeof data === 'string') {
    return data.replace(/[\r\n]/g, ' ').substring(0, 200);
  }
  return JSON.stringify(data).replace(/[\r\n]/g, ' ').substring(0, 200);
}

export function validateEnvironmentVars(): void {
  const required = ['NEXT_PUBLIC_AWS_REGION', 'NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID'];
  
  for (const envVar of required) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}