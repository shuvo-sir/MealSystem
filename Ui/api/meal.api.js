import API, { authConfig } from "./api";


// get current user's meal group details
export const getMyMealGroup = async (token) => {
  const response = await API.get("/meals/my-group", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};


// create meal group
export const createMealGroup = async (data, token) => {
  const response = await API.post("/meals/create", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};


// join meal
export const joinMeal = async (data, token) => {
  const response = await API.post("/member/join", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
};


// add daily meal entry
export const addMealEntry = async (data, token) => {
  const response = await API.post("/meal-entries/add", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

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


// reject member
export const rejectMember =
  async (requestId, token) => {

    const response =
      await API.patch(
        `/member/reject/${requestId}`,
        undefined,
        authConfig(token)
      );

    return response.data;
};


// leave meal group
export const leaveMealGroup = async (token) => {
  const response = await API.post(
    "/member/leave",
    {},
    authConfig(token)
  );

  return response.data;
};


// get meal history
export const getMealHistory = async (
  groupId,
  filters = {},
  token
) => {
  try {
    const params = new URLSearchParams({
      groupId,
      ...filters,
    });

    const response = await API.get(
      `/meal-entries/history?${params.toString()}`,
      authConfig(token)
    );

    return response.data;
  } catch (error) {
    throw {
      ...error,
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code,
    };
  }
};


// update meal entry
export const updateMealEntry = async (
  entryId,
  updates,
  token
) => {
  try {
    const response = await API.patch(
      `/meal-entries/${entryId}`,
      updates,
      authConfig(token)
    );

    return response.data;
  } catch (error) {
    throw {
      ...error,
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code,
    };
  }
};


// delete meal entry
export const deleteMealEntry = async (
  entryId,
  token
) => {
  try {
    const response = await API.delete(
      `/meal-entries/${entryId}`,
      authConfig(token)
    );

    return response.data;
  } catch (error) {
    throw {
      ...error,
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code,
    };
  }
};
