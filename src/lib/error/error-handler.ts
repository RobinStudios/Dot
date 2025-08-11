export class AppError extends Error {
  constructor(
    message: string,
    public code: string = 'UNKNOWN_ERROR',
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export const errorMessages = {
  NETWORK_ERROR: 'Connection failed. Please check your internet connection.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  UNAUTHORIZED: 'Please log in to continue.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  SERVER_ERROR: 'Something went wrong on our end. Please try again.',
  AI_GENERATION_FAILED: 'AI generation failed. Please try again.',
  FILE_UPLOAD_FAILED: 'File upload failed. Please try again.',
  SAVE_FAILED: 'Failed to save. Please try again.',
};

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) return error.message;
  if (error instanceof Error) {
    if (error.message.includes('fetch')) return errorMessages.NETWORK_ERROR;
    if (error.message.includes('429')) return errorMessages.RATE_LIMIT;
    if (error.message.includes('401')) return errorMessages.UNAUTHORIZED;
  }
  return errorMessages.SERVER_ERROR;
}

export function isRetryableError(error: unknown): boolean {
  if (error instanceof AppError) return error.retryable;
  if (error instanceof Error) {
    return error.message.includes('fetch') || 
           error.message.includes('timeout') ||
           error.message.includes('500');
  }
  return false;
}