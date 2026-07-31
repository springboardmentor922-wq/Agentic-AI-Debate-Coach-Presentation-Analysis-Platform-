import api from "./api";

export const getProfile = async () => {
  const response = await api.get("/auth/profile");
  return response.data;
};