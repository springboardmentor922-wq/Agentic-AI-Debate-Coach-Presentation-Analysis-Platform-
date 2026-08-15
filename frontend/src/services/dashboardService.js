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
export const getAssignedLearners = async () => {
  const response = await api.get("/coach/assigned-learners");
  return response.data;
};
export const getMyCoach = async () => {
  const response = await api.get("/learner/my-coach");
  return response.data;
};
export const getLearningActivities = async () => {
  const response = await api.get("/learner/activities");
  return response.data;
};
export const getMonitoringData = async () => {
  const response = await api.get("/educator/monitoring");
  return response.data;
};
export const getCoachNotes = async () => {
  const response = await api.get("/coach-notes/");
  return response.data;
};
export const getDailyMissions = async () => {
  const response = await api.get("/missions/");
  return response.data;
};
export const getAttentionLearners = async () => {
  const response = await api.get("/coach/attention");
  return response.data;
};
export const getAISummary = async () => {
  const response = await api.get("/educator/ai-summary");
  return response.data;
};
export const getCoachMessages = async () => {
  const response = await api.get("/messages/");
  return response.data;
};
export const sendCoachMessage = async (messageData) => {
  const response = await api.post("/messages/", messageData);
  return response.data;
};
export const sendMessage = async (messageData) => {
  const response = await api.post("/messages/", messageData);
  return response.data;
};

export const getMyMessages = async () => {
  const response = await api.get("/messages/");
  return response.data;
};