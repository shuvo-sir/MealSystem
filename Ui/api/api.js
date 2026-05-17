import axios from "axios";

const API = axios.create({
  baseURL:
    process.env.EXPO_PUBLIC_API_URL ||
    process.env.API_URL ||
    "https://mealsystem.onrender.com/api",
});

export const authConfig = (token) =>
  token
    ? {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    : undefined;

export default API;
