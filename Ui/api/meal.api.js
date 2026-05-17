import API, { authConfig } from "./api";


// get current user's meal group details
export const getMyMealGroup = async (token) => {
  const response = await API.get(
    "/meals/my-group",   // ✅ FIXED
    authConfig(token)
  );

  return response.data;
};


// create meal group
export const createMealGroup =
  async (data, token) => {

    const response =
      await API.post(
        "/meals/create",
        data,
        authConfig(token)
      );

    return response.data;
};


// join meal
export const joinMeal =
  async (data, token) => {

    const response =
      await API.post(
        "/member/join",
        data,
        authConfig(token)
      );

    return response.data;
};


// add daily meal entry
export const addMealEntry =
  async (data, token) => {

    const response =
      await API.post(
        "/meal-entries/add",
        data,
        authConfig(token)
      );

    return response.data;
};


// get pending requests
export const getPendingRequests =
  async (groupId, token) => {

    const response =
      await API.get(
        `/member/requests/${groupId}`,
        authConfig(token)
      );

    return response.data;
};


// accept member
export const acceptMember =
  async (requestId, token) => {

    const response =
      await API.patch(
        `/member/accept/${requestId}`,
        undefined,
        authConfig(token)
      );

    return response.data;
};
