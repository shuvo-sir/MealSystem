import API, { authConfig } from "./api";


// add deposit
export const addDeposit =
  async (data, token) => {

    const response =
      await API.post(
        "/finance/deposit",
        data,
        authConfig(token)
      );

    return response.data;
};


// add expense
export const addExpense =
  async (data, token) => {

    const response =
      await API.post(
        "/finance/expense",
        data,
        authConfig(token)
      );

    return response.data;
};
