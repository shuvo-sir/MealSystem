import axios from "axios";
import { retryWithBackoff } from "./retryLogic";

// 1. Safely resolve the base URL by ensuring it's a real, non-empty string
const getBaseURL = () => {
  const publicUrl = process.env.EXPO_PUBLIC_API_URL;
  if (publicUrl && publicUrl !== "undefined") return publicUrl;

  const standardUrl = process.env.API_URL;
  if (standardUrl && standardUrl !== "undefined") return standardUrl;

  // Fallback production URL
  return "https://mealsystem.onrender.com/api";
};

const resolvedURL = getBaseURL();

console.log("API BASE URL:", resolvedURL);

const API = axios.create({
  baseURL: resolvedURL,
  timeout:10000,
});

// Store the original request config for potential retries
API.interceptors.request.use((config) => {
  console.log("REQUEST METHOD:", config.method);
  console.log("REQUEST URL:", config.baseURL + config.url);
  console.log("REQUEST DATA:", config.data);
  console.log("REQUEST HEADERS:", config.headers);

  // Store original config for retries
  config.metadata = { startTime: Date.now() };

  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    console.log("RESPONSE ERROR STATUS:", error.response?.status);
    console.log("RESPONSE ERROR DATA:", error.response?.data);
    console.log("RESPONSE ERROR MESSAGE:", error.message);

    // Handle 429 (Rate Limit Exceeded) with retry logic
    if (error.response?.status === 429 && error.config) {
      // Check if already retried to prevent infinite loops
      if (!error.config.__retryCount) {
        error.config.__retryCount = 0;
      }

      if (error.config.__retryCount < 3) {
        error.config.__retryCount++;

        try {
          // Create a function that retries the request with the same config
          const retryRequest = () => {
            return API.request(error.config);
          };

          // Attempt retry with exponential backoff
          const response = await retryWithBackoff(retryRequest, error);
          return response;
        } catch (retryError) {
          // All retries exhausted or different error occurred
          console.log("RETRY_EXHAUSTED: All retries failed, returning error to caller");
          return Promise.reject(retryError);
        }
      }
    }

    return Promise.reject(error);
  }
);

// 2. Helper for authenticated headers
export const authConfig = (token) =>
  token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : {};

export default API;