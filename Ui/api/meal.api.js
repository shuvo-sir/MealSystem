import API, { authConfig } from "./api";

const MY_GROUP_CACHE_TTL_MS = 5000;

const myGroupCache = new Map();
const myGroupInFlight = new Map();

const getMyGroupCacheKey = (token) => token || "anonymous";

export const invalidateMyMealGroupCache = (token) => {
  if (token) {
    myGroupCache.delete(getMyGroupCacheKey(token));
    myGroupInFlight.delete(getMyGroupCacheKey(token));
    return;
  }

  myGroupCache.clear();
  myGroupInFlight.clear();
};


// get current user's meal group details
export const getMyMealGroup = async (token) => {
  const cacheKey = getMyGroupCacheKey(token);
  const cached = myGroupCache.get(cacheKey);

  if (cached && Date.now() - cached.timestamp < MY_GROUP_CACHE_TTL_MS) {
    return cached.data;
  }

  if (myGroupInFlight.has(cacheKey)) {
    return myGroupInFlight.get(cacheKey);
  }

  const request = (async () => {
      const response = await API.get("/meals/my-group", authConfig(token));
    myGroupCache.set(cacheKey, {
      data: response.data,
      timestamp: Date.now(),
    });

    return response.data;
  })();

  myGroupInFlight.set(cacheKey, request);

  try {
    return await request;
  } finally {
    myGroupInFlight.delete(cacheKey);
  }
};


// create meal group
export const createMealGroup = async (data, token) => {
  const response = await API.post(
    "/meals/create",
    data,
    authConfig(token)
  );

  invalidateMyMealGroupCache(token);

  return response.data;
};


// join meal
export const joinMeal = async (data, token) => {
  const response = await API.post(
    "/member/join",
    data,
    authConfig(token)
  );

  invalidateMyMealGroupCache(token);

  return response.data;
};


// add daily meal entry
export const addMealEntry = async (data, token) => {
  const response = await API.post(
    "/meal-entries/add",
    data,
    authConfig(token)
  );

  invalidateMyMealGroupCache(token);

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


// transfer manager role
export const transferManager = async (data, token) => {
  const response = await API.patch(
    "/member/transfer-manager",
    data,
    authConfig(token)
  );

  invalidateMyMealGroupCache(token);

  return response.data;
};


// leave meal group
export const leaveMealGroup = async (token) => {
  const response = await API.post(
    "/member/leave",
    {},
    authConfig(token)
  );

  invalidateMyMealGroupCache(token);

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

    invalidateMyMealGroupCache(token);

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

    invalidateMyMealGroupCache(token);

    return response.data;
  } catch (error) {
    throw {
      ...error,
      message: error.response?.data?.message || error.message,
      code: error.response?.data?.code,
    };
  }
};
