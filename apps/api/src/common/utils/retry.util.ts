import { Logger } from '@nestjs/common';

const logger = new Logger('RetryUtil');

export interface RetryOptions {
  maxRetries?: number;
  baseDelayMs?: number;
}

/**
 * Executes a function with bounded retries and exponential backoff.
 * Useful for handling transient concurrency conflicts (e.g., optimistic locking failures).
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries ?? 2;
  const baseDelayMs = options.baseDelayMs ?? 100;
  
  let attempt = 0;
  
  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      if (attempt >= maxRetries) {
        logger.error(`Operation failed after ${maxRetries} retries`, error.stack || error);
        throw error;
      }
      
      attempt++;
      // Exponential backoff: baseDelay * (2 ^ (attempt - 1)) + jitter (0-50ms)
      const delay = baseDelayMs * Math.pow(2, attempt - 1) + Math.random() * 50;
      logger.warn(`Concurrency conflict detected. Retrying (attempt ${attempt}/${maxRetries}) in ${Math.round(delay)}ms`);
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
