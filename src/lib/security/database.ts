import { z } from 'zod';

export function sanitizeForDatabase(input: any): any {
  if (typeof input === 'string') {
    return input
      .replace(/['"\\]/g, '')
      .replace(/\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER)\b/gi, '')
      .trim();
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: any = {};
    for (const [key, value] of Object.entries(input)) {
      const sanitizedKey = key.replace(/[^a-zA-Z0-9_]/g, '');
      sanitized[sanitizedKey] = sanitizeForDatabase(value);
    }
    return sanitized;
  }
  
  return input;
}

export const DatabaseQuerySchema = z.object({
  table: z.string().regex(/^[a-zA-Z_][a-zA-Z0-9_]*$/),
  operation: z.enum(['select', 'insert', 'update', 'delete']),
  data: z.record(z.any()).optional(),
  where: z.record(z.any()).optional(),
});

export function validateDatabaseQuery(query: any) {
  return DatabaseQuerySchema.parse(query);
}