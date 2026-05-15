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