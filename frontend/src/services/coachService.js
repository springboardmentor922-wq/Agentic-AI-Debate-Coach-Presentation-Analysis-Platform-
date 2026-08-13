import apiClient from "./apiClient";
import { getMySessions } from "./debateSessionService";
import { getMySkill } from "./skillService";
import { getAllReports } from "./reportService";

export const getCoachOverview = async () => {
    try {
        const [learnersRes, analyticsRes, sessions, skill, reports] = await Promise.all([
            apiClient.get("/api/v1/coach/learners").catch(() => ({ data: [] })),
            apiClient.get("/api/v1/coach/analytics").catch(() => ({ data: null })),
            getMySessions().catch(() => []),
            getMySkill().catch(() => null),
            getAllReports().catch(() => ({ data: [] })),
        ]);

        const reportData = Array.isArray(reports?.data) ? reports.data : Array.isArray(reports) ? reports : [];

        return {
            assignedLearners: learnersRes.data || [],
            pendingReviews: reportData.filter((report) => (report.status || "").toLowerCase() !== "completed"),
            reports: reportData,
            sessions,
            coachingPlans: [],
            studentAnalytics: analyticsRes.data || skill,
        };
    } catch (error) {
        console.error("Failed to load coach overview:", error);
        return {
            assignedLearners: [],
            pendingReviews: [],
            reports: [],
            sessions: [],
            coachingPlans: [],
            studentAnalytics: null
        };
    }
};

export const getMyAssignedCoach = async () => {
    const res = await apiClient.get("/api/v1/coach/my-coach");
    return res.data;
};

export const submitCoachEvaluation = async (evaluationData) => {
    const res = await apiClient.post("/api/v1/coach/evaluations", evaluationData);
    return res.data;
};

export const assignPracticeTask = async (taskData) => {
    const res = await apiClient.post("/api/v1/coach/practice", taskData);
    return res.data;
};

export const scheduleCoachingSession = async (sessionData) => {
    const res = await apiClient.post("/api/v1/coach/sessions", sessionData);
    return res.data;
};

export const getCoachAnalytics = async () => {
    const res = await apiClient.get("/api/v1/coach/analytics");
    return res.data;
};

export const getSubmissionDetails = async (sessionId) => {
    const res = await apiClient.get(`/api/v1/coach/submission/${sessionId}`);
    return res.data;
};

export const updatePracticeTaskStatus = async (taskId, status, sessionId = null) => {
    let url = `/api/v1/coach/practice/${taskId}/status?task_status=${encodeURIComponent(status)}`;
    if (sessionId) {
        url += `&session_id=${sessionId}`;
    }
    const res = await apiClient.put(url);
    return res.data;
};

export const sendCoachMessage = async (learnerId, content) => {
    const res = await apiClient.post("/api/v1/coach/messages", { learner_id: learnerId, content });
    return res.data;
};

export const getMessageHistory = async (learnerId) => {
    const res = await apiClient.get(`/api/v1/coach/messages/${learnerId}`);
    return res.data;
};

export const replyCoachMessage = async (receiverId, content) => {
    const res = await apiClient.post("/api/v1/coach/messages/reply", { receiver_id: receiverId, content });
    return res.data;
};

export default {
    getCoachOverview,
    getMyAssignedCoach,
    submitCoachEvaluation,
    assignPracticeTask,
    updatePracticeTaskStatus,
    scheduleCoachingSession,
    getCoachAnalytics,
    getSubmissionDetails,
    sendCoachMessage,
    getMessageHistory,
    replyCoachMessage,
};