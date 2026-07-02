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


// add finance adjustment (credit/due)
export const addFinanceAdjustment = async (data, token) => {
  const response = await API.post(
    "/finance/adjustment",
    data,
    authConfig(token)
  );

  return response.data;
};


// get transactions
export const getTransactions = async (
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
      `/finance/transactions?${params.toString()}`,
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


// get expense history
export const getExpenseHistory = async (
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
      `/finance/expenses?${params.toString()}`,
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
