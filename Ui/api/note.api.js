import API, { authConfig } from "./api";


// add note
export const addGroupNote =
  async (data, token) => {
    console.log(`[addGroupNote] Adding note:`, data);

    const response =
      await API.post(
        "/group-notes/add",
        data,
        authConfig(token)
      );

    console.log(`[addGroupNote] Response:`, response.data);
    return response.data;
};


// get notes
export const getGroupNotes =
  async (groupId, token) => {
    console.log(`[getGroupNotes] Fetching notes for group: ${groupId}`);

    const response =
      await API.get(
        `/group-notes/${groupId}`,
        authConfig(token)
      );

    console.log(`[getGroupNotes] Retrieved ${response.data.notes?.length || 0} notes`);
    return response.data;
};


// delete note
export const deleteGroupNote =
  async (noteId, token) => {
    console.log(`[deleteGroupNote] Deleting note: ${noteId}`);

    const response =
      await API.delete(
        `/group-notes/${noteId}`,
        authConfig(token)
      );

    console.log(`[deleteGroupNote] Response:`, response.data);
    return response.data;
};
