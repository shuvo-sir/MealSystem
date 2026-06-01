/**
 * Retry logic for handling rate-limited (429) API requests
 * Uses exponential backoff: 1s, 2s, 4s (max 3 retries)
 */

const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  BASE_DELAY_MS: 1000, // 1 second
  MAX_DELAY_MS: 4000, // 4 seconds
};

/**
 * Calculate delay with exponential backoff
 * @param {number} attemptNumber - Current attempt (0-indexed)
 * @returns {number} Delay in milliseconds
 */
const getBackoffDelay = (attemptNumber) => {
  const delay = RETRY_CONFIG.BASE_DELAY_MS * Math.pow(2, attemptNumber);
  return Math.min(delay, RETRY_CONFIG.MAX_DELAY_MS);
};

/**
 * Sleep for specified milliseconds
 * @param {number} ms - Milliseconds to sleep
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry a failed request with exponential backoff
 * @param {Function} requestFn - Function that returns a promise (the API call)
 * @param {Object} error - The original error that triggered the retry
 * @returns {Promise} Result of the retried request or the original error if all retries fail
 */
export const retryWithBackoff = async (requestFn, error) => {
  // Only retry on 429 (Too Many Requests)
  if (error?.response?.status !== 429) {
    return Promise.reject(error);
  }

  console.log("RATE_LIMIT_RETRY: Starting exponential backoff retry logic");

  for (let attempt = 0; attempt < RETRY_CONFIG.MAX_RETRIES; attempt++) {
    try {
      const delay = getBackoffDelay(attempt);
      console.log(
        `RATE_LIMIT_RETRY: Attempt ${attempt + 1}/${RETRY_CONFIG.MAX_RETRIES} after ${delay}ms delay`
      );

      // Wait before retrying
      await sleep(delay);

      // Retry the request
      const response = await requestFn();
      console.log(
        `RATE_LIMIT_RETRY: Success on attempt ${attempt + 1}/${RETRY_CONFIG.MAX_RETRIES}`
      );
      return response;
    } catch (retryError) {
      // If it's not a 429, don't retry further
      if (retryError?.response?.status !== 429) {
        console.log("RATE_LIMIT_RETRY: Non-429 error encountered, aborting retry");
        return Promise.reject(retryError);
      }

      // If this was the last attempt, reject
      if (attempt === RETRY_CONFIG.MAX_RETRIES - 1) {
        console.log(
          `RATE_LIMIT_RETRY: All ${RETRY_CONFIG.MAX_RETRIES} retries exhausted`
        );
        return Promise.reject(retryError);
      }

      // Continue to next attempt
      console.log(
        `RATE_LIMIT_RETRY: Still getting 429, will retry (attempt ${attempt + 1}/${RETRY_CONFIG.MAX_RETRIES})`
      );
    }
  }
};

/**
 * Track ongoing retries per request URL/method to provide UI feedback
 */
export const retryTracker = {
  retryingRequests: new Map(), // Map of request key to retry count

  startRetry(key) {
    this.retryingRequests.set(key, 0);
  },

  incrementRetry(key) {
    this.retryingRequests.set(key, (this.retryingRequests.get(key) || 0) + 1);
  },

  isRetrying(key) {
    return this.retryingRequests.has(key);
  },

  getRetryCount(key) {
    return this.retryingRequests.get(key) || 0;
  },

  clearRetry(key) {
    this.retryingRequests.delete(key);
  },
};
