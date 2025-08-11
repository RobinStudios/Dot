import { useState, useCallback } from 'react';
import { isRetryableError, getErrorMessage } from '@/lib/error/error-handler';
import { toast } from '@/components/ui/toast';

interface UseRetryOptions {
  maxRetries?: number;
  delay?: number;
  onError?: (error: unknown) => void;
}

export function useRetry<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: UseRetryOptions = {}
) {
  const { maxRetries = 3, delay = 1000, onError } = options;
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const execute = useCallback(async (...args: T): Promise<R | null> => {
    setIsLoading(true);
    setError(null);

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        const result = await fn(...args);
        setRetryCount(0);
        setIsLoading(false);
        return result;
      } catch (err) {
        const errorMessage = getErrorMessage(err);
        
        if (attempt === maxRetries || !isRetryableError(err)) {
          setError(errorMessage);
          setIsLoading(false);
          onError?.(err);
          
          toast.error(errorMessage, {
            label: 'Try Again',
            onClick: () => execute(...args)
          });
          
          return null;
        }

        setRetryCount(attempt + 1);
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
        }
      }
    }

    setIsLoading(false);
    return null;
  }, [fn, maxRetries, delay, onError]);

  const retry = useCallback(() => {
    setRetryCount(0);
    setError(null);
  }, []);

  return {
    execute,
    retry,
    isLoading,
    error,
    retryCount
  };
}