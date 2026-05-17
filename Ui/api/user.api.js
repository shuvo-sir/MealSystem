import API from "./api";


// create user
export const createUser =
  async (userData) => {

    const response =
      await API.post(
        "/users/create",
        userData
      );

    return response.data;
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