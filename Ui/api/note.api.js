import API, { authConfig } from "./api";


// add note
export const addGroupNote =
  async (data, token) => {

    const response =
      await API.post(
        "/group-notes/add",
        data,
        authConfig(token)
      );

    return response.data;
};


// get notes
export const getGroupNotes =
  async (groupId, token) => {

    const response =
      await API.get(
        `/group-notes/${groupId}`,
        authConfig(token)
      );

    return response.data;
};
