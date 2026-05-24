import axios from "axios";

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
API.interceptors.request.use((config) => {

  console.log("REQUEST METHOD:", config.method);
  console.log("REQUEST URL:", config.baseURL + config.url);
  console.log("REQUEST DATA:", config.data);
  console.log("REQUEST HEADERS:", config.headers);

  return config;
});

API.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("RESPONSE ERROR STATUS:", error.response?.status);
    console.log("RESPONSE ERROR DATA:", error.response?.data);
    console.log("RESPONSE ERROR MESSAGE:", error.message);
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