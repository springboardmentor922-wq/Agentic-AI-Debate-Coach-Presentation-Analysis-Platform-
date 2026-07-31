const API_BASE_URL = `http://${window.location.hostname}:8000`;

export const api = {
  // Auth
  login: async (credentials) => {
    const res = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });
    return res.json();
  },

  register: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  // Debates
  createDebate: async (debateData) => {
    const res = await fetch(`${API_BASE_URL}/create-debate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(debateData)
    });
    return res.json();
  },

  uploadAudio: async (debateId, audioBlob) => {
    const formData = new FormData();
    formData.append("debate_id", debateId);
    formData.append("file", audioBlob, "debate.webm");

    const res = await fetch(`${API_BASE_URL}/upload-audio`, {
      method: "POST",
      body: formData
    });
    return res.json();
  },

  uploadText: async (debateId, text) => {
    const res = await fetch(`${API_BASE_URL}/upload-text`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ debate_id: debateId, text: text })
    });
    return res.json();
  },

  getUserDebates: async (username) => {
    const res = await fetch(`${API_BASE_URL}/debates/${username}`);
    return res.json();
  },

  getDebateReview: async (debateId) => {
    const res = await fetch(`${API_BASE_URL}/review/${debateId}`);
    return res.json();
  },

  getAllDebates: async () => {
    const res = await fetch(`${API_BASE_URL}/debates`);
    return res.json();
  },

  // Coach
  getCoachPendingDebates: async () => {
    const res = await fetch(`${API_BASE_URL}/coach/debates`);
    return res.json();
  },

  getCoachReviewedDebates: async () => {
    const res = await fetch(`${API_BASE_URL}/coach/reviewed-debates`);
    return res.json();
  },

  submitCoachFeedback: async (feedbackData) => {
    const res = await fetch(`${API_BASE_URL}/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedbackData)
    });
    return res.json();
  },

  // Educator
  getEducatorLearnersCount: async () => {
    const res = await fetch(`${API_BASE_URL}/educator/learners-count`);
    return res.json();
  },

  getEducatorTasksCount: async () => {
    const res = await fetch(`${API_BASE_URL}/educator/tasks-count`);
    return res.json();
  },

  getEducatorFeedbackCount: async () => {
    const res = await fetch(`${API_BASE_URL}/educator/feedback-count`);
    return res.json();
  },
  
  getEducatorTasks: async () => {
    const res = await fetch(`${API_BASE_URL}/educator/tasks`);
    return res.json();
  },

  getEducatorFeedbacks: async () => {
    const res = await fetch(`${API_BASE_URL}/educator/feedbacks`);
    return res.json();
  },

  getLearnerDebates: async (username) => {
    const res = await fetch(`${API_BASE_URL}/educator/learner-debates/${username}`);
    return res.json();
  },

  getEducatorReports: async () => {
    const res = await fetch(`${API_BASE_URL}/educator/reports`);
    return res.json();
  },

  assignTask: async (taskData) => {
    const res = await fetch(`${API_BASE_URL}/assign-task`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(taskData)
    });
    return res.json();
  },

  sendDirectFeedback: async (feedbackData) => {
    const res = await fetch(`${API_BASE_URL}/send-feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(feedbackData)
    });
    return res.json();
  },

  // Tasks & User Feedbacks
  getUserTasks: async (username) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${username}`);
    return res.json();
  },

  deleteTask: async (taskId) => {
    const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, { method: "DELETE" });
    return res.json();
  },

  getUserFeedbacks: async (username) => {
    const res = await fetch(`${API_BASE_URL}/user-feedback/${username}`);
    return res.json();
  },

  getAllTasks: async () => {
    const res = await fetch(`${API_BASE_URL}/tasks`);
    return res.json();
  },

  getAllFeedbacks: async () => {
    const res = await fetch(`${API_BASE_URL}/all-feedbacks`);
    return res.json();
  },

  // Admin
  getAdminStats: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/stats`);
    return res.json();
  },

  getAdminEducatorReports: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/reports/educators`);
    return res.json();
  },

  getAdminCoachReports: async () => {
    const res = await fetch(`${API_BASE_URL}/admin/reports/coaches`);
    return res.json();
  },

  getUsersByRole: async (role) => {
    const res = await fetch(`${API_BASE_URL}/users/role/${role}`);
    return res.json();
  },

  getAllUsers: async () => {
    const res = await fetch(`${API_BASE_URL}/users`);
    return res.json();
  },

  adminCreateUser: async (userData) => {
    const res = await fetch(`${API_BASE_URL}/admin/create-user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData)
    });
    return res.json();
  },

  deleteUser: async (userId) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}`, { method: "DELETE" });
    return res.json();
  },

  updateUserStatus: async (userId, status) => {
    const res = await fetch(`${API_BASE_URL}/users/${userId}/status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    return res.json();
  },

  // Topics
  getTopics: async () => {
    const res = await fetch(`${API_BASE_URL}/topics`);
    return res.json();
  },

  createTopic: async (topicData) => {
    const res = await fetch(`${API_BASE_URL}/topics`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(topicData)
    });
    return res.json();
  },

  deleteTopic: async (topicId) => {
    const res = await fetch(`${API_BASE_URL}/topics/${topicId}`, { method: "DELETE" });
    return res.json();
  }
};
