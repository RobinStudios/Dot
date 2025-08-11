import DOMPurify from 'isomorphic-dompurify';

export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove HTML tags and dangerous characters
  const cleaned = DOMPurify.sanitize(input, { 
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
  
  // Additional sanitization for API keys and sensitive data
  return cleaned.trim().replace(/[<>'"&]/g, '');
}

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'span'],
    ALLOWED_ATTR: ['class']
  });
}

export function validateApiKey(key: string): boolean {
  // Basic API key format validation
  const patterns = {
    openai: /^sk-[a-zA-Z0-9]{48}$/,
    anthropic: /^sk-ant-[a-zA-Z0-9-]{95}$/,
    replicate: /^r8_[a-zA-Z0-9]{40}$/
  };
  
  return Object.values(patterns).some(pattern => pattern.test(key));
}