import API from "./api";


// create meal group
export const createMealGroup =
  async (data) => {

    const response =
      await API.post(
        "/meals/create",
        data
      );

    return response.data;
};


// join meal
export const joinMeal =
  async (data) => {

    const response =
      await API.post(
        "/member/join",
        data
      );

    return response.data;
};


// get pending requests
export const getPendingRequests =
  async (groupId) => {

    const response =
      await API.get(
        `/member/requests/${groupId}`
      );

    return response.data;
};


// accept member
export const acceptMember =
  async (requestId) => {

    const response =
      await API.patch(
        `/member/accept/${requestId}`
      );

    return response.data;
};