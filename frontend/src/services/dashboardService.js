import api from "./api";

export const getDashboardStats = async () => {
  const response = await api.get("/dashboard/stats");
  return response.data;
};

export const getLearnerDashboard = async () => {
  const response = await api.get("/learner/dashboard");
  return response.data;
};
export const getCoachDashboard = async () => {
  const response = await api.get("/coach/dashboard");
  return response.data;
};
export const getEducatorDashboard = async () => {
  const response = await api.get("/educator/dashboard");
  return response.data;
};