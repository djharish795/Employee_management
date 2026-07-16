/**
 * Default batch size for chunked database operations
 * to prevent exhausting the database connection pool.
 */
export const DEFAULT_BATCH_SIZE = 500;

/**
 * Helper to split an array into smaller chunks for batch processing.
 */
export function chunkArray<T>(array: T[], size: number = DEFAULT_BATCH_SIZE): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}
