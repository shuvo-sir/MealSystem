import API, { authConfig } from "./api";

// create user
export const createUser = async (userData) => {
  try {
    if (__DEV__) {
      console.log("Sending user to backend");
    }
    const response = await API.post("/users/create", userData);
    return response.data;
  } catch (error) {
    if (__DEV__) {
      console.log("CREATE USER API ERROR:", error.message);
    }
    throw error;
  }
};


// get single user
export const getUser =
  async (userId) => {

    const response =
      await API.get(
        `/users/${userId}`
      );

    return response.data;
};


// get current user 
export const getCurrentUser =
  async (token) => {

    const response =
      await API.get(
        "/users/me",
        authConfig(token)
      );

    return response.data;
};
