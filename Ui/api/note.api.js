import API from "./api";


// add note
export const addGroupNote =
  async (data) => {

    const response =
      await API.post(
        "/group-notes/add",
        data
      );

    return response.data;
};


// get notes
export const getGroupNotes =
  async (groupId) => {

    const response =
      await API.get(
        `/group-notes/${groupId}`
      );

    return response.data;
};