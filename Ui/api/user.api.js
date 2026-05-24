import API, { authConfig } from "./api";

// CREATE USER
export const createUser = async (
  userData,
  token
) => {

  try {

    console.log(
      "🚀 POSTING USER..."
    );

    console.log("User Data:", userData);
    console.log("Token received:", token ? "✓ Yes" : "❌ No");

    const response =
      await API.post(
        "/users/create",
        userData,
        authConfig(token)
      );

    console.log(
      "✓ CREATE RESPONSE:"
    );

    console.log("Status:", response.status);
    console.log("Data:", response.data);

    return response.data;

  } catch (error) {

    console.error(
      "❌ CREATE USER ERROR:"
    );

    console.error("Error Status:", error.response?.status);
    console.error("Error Data:", error.response?.data);
    console.error("Error Message:", error.message);
    console.error("Full Error:", error);

    // Return meaningful error for UI
    const errorData = error.response?.data;
    if (errorData) {
      throw {
        ...error,
        message: errorData.message || error.message,
        code: errorData.code,
        details: errorData.errors
      };
    }

    throw error;
  }
};

// GET USER
export const getUser = async (
  userId
) => {

  const response =
    await API.get(
      `/users/${userId}`
    );

  return response.data;
};

// CURRENT USER
export const getCurrentUser =
  async (token) => {

    const response =
      await API.get(
        "/users/me",
        authConfig(token)
      );

    return response.data;
};

// UPDATE USER PROFILE
export const updateUser = async (
  userData,
  token
) => {
  try {
    console.log("🚀 UPDATING USER...");
    console.log("User Data:", userData);

    const response = await API.patch(
      "/users/me",
      userData,
      authConfig(token)
    );

    console.log("✓ UPDATE RESPONSE:");
    console.log("Data:", response.data);

    return response.data;
  } catch (error) {
    console.error("❌ UPDATE USER ERROR:");
    console.error("Error Data:", error.response?.data);
    console.error("Error Message:", error.message);

    const errorData = error.response?.data;
    if (errorData) {
      throw {
        ...error,
        message: errorData.message || error.message,
        code: errorData.code
      };
    }

    throw error;
  }
};