import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email().max(255);
export const passwordSchema = z.string().min(8).max(128);
export const uuidSchema = z.string().uuid();

// API input validation schemas
export const designPromptSchema = z.object({
  prompt: z.string().min(1).max(1000),
  style: z.string().min(1).max(50),
  layout: z.string().min(1).max(50),
  colorScheme: z.string().min(1).max(50),
  typography: z.string().min(1).max(50),
});

export const apiKeySchema = z.object({
  name: z.string().min(1).max(100),
  provider: z.enum(['openai', 'anthropic', 'replicate', 'custom']),
  key: z.string().min(10).max(500),
});

export const projectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().max(1000).optional(),
  isPublic: z.boolean().default(false),
});

// File upload validation
export const allowedImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const maxFileSize = 10 * 1024 * 1024; // 10MB

export function validateFileUpload(file: File): { valid: boolean; error?: string } {
  if (!allowedImageTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' };
  }
  
  if (file.size > maxFileSize) {
    return { valid: false, error: 'File too large. Maximum size is 10MB.' };
  }
  
  return { valid: true };
}

// URL validation for SSRF protection
export function validateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    
    // Only allow http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }
    
    // Block private IP ranges
    const hostname = parsed.hostname;
    if (
      hostname === 'localhost' ||
      hostname.startsWith('127.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.match(/^172\.(1[6-9]|2[0-9]|3[0-1])\./)
    ) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

// Content validation
export function validateHtmlContent(html: string): boolean {
  // Basic checks for malicious content
  const dangerousPatterns = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi,
    /<iframe\b/gi,
    /<object\b/gi,
    /<embed\b/gi,
  ];
  
  return !dangerousPatterns.some(pattern => pattern.test(html));
}