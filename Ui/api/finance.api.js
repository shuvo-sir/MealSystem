import API from "./api";


// add deposit
export const addDeposit =
  async (data) => {

    const response =
      await API.post(
        "/finance/deposit",
        data
      );

    return response.data;
};


// add expense
export const addExpense =
  async (data) => {

    const response =
      await API.post(
        "/finance/expense",
        data
      );

    return response.data;
};