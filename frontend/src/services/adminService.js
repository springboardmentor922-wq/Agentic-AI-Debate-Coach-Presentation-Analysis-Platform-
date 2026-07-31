import api from "./api";

export const getAllUsers = async () => {
  const response = await api.get("/admin/users");
  return response.data;
};