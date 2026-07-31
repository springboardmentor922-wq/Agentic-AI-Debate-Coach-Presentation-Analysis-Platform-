import api from "./api";

export const processDebate = async (debateData) => {
  const response = await api.post("/debate/process-turn", debateData);
  return response.data;
};

export const deleteDebate = async (debateId) => {
  const response = await api.delete(`/debate/history/${debateId}`);
  return response.data;
};