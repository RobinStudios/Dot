export function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
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
  const required = [
    'NEXT_PUBLIC_AWS_REGION',
    'NEXT_PUBLIC_COGNITO_IDENTITY_POOL_ID',
    'AWS_REGION',
    'AWS_ACCESS_KEY_ID',
    'AWS_SECRET_ACCESS_KEY',
    'AWS_BEDROCK_MODEL_ID',
    'AWS_BEDROCK_IMAGE_MODEL_ID'
  ];
  
  for (const envVar of required) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required environment variable: ${envVar}`);
    }
  }
}