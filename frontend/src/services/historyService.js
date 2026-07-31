import api from "./api";

export const getDebateHistory = async () => {
  const response = await api.get("/debate/history");
  return response.data;
};

export const getDebateById = async (id) => {
  const response = await api.get(`/debate/history/${id}`);
  return response.data;
};