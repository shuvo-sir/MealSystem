import { create as createAxios } from "axios";
const NETWORK_RETRY_CONFIG = {
  MAX_RETRIES: 2,
  BASE_DELAY_MS: 2000,
  MAX_DELAY_MS: 5000,
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const shouldRetryNetworkError = (error) => {
  const method = error?.config?.method?.toLowerCase();
  return !error?.response && (method === "get" || method === "head");
};

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

const API = createAxios({
  baseURL: resolvedURL,
  timeout: 30000,
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

    if (shouldRetryNetworkError(error) && error.config) {
      if (!error.config.__networkRetryCount) {
        error.config.__networkRetryCount = 0;
      }

      if (error.config.__networkRetryCount < NETWORK_RETRY_CONFIG.MAX_RETRIES) {
        error.config.__networkRetryCount++;

        const delay = Math.min(
          NETWORK_RETRY_CONFIG.BASE_DELAY_MS * Math.pow(2, error.config.__networkRetryCount - 1),
          NETWORK_RETRY_CONFIG.MAX_DELAY_MS
        );

        console.log(
          `NETWORK_RETRY: Retrying ${error.config.method?.toUpperCase()} ${error.config.url} in ${delay}ms (attempt ${error.config.__networkRetryCount}/${NETWORK_RETRY_CONFIG.MAX_RETRIES})`
        );

        await sleep(delay);

        try {
          return await API.request(error.config);
        } catch (retryError) {
          return Promise.reject(retryError);
        }
      }
    }

    // Do not retry 429 responses; they are server-side rate limits and retrying usually makes the burst worse.
    if (error.response?.status === 429) {
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

// 2. Helper for authenticated headers
export const authConfig = (token) => {
  if (!token || typeof token !== "string") {
    return {};
  }

    const safeToken = token.trim();
  if (!safeToken) {
    return {};
  }

  // Normalize the incoming token so we avoid duplicate Bearer prefixes
  // and always send a single clean auth value.
  const tokenWithoutBearer = safeToken.replace(/^Bearer\s*/i, "").trim();
  if (!tokenWithoutBearer) {
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${tokenWithoutBearer}`,
    },
  };
};

export default API;