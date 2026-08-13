import apiClient from "./apiClient";
import { getMySessions } from "./debateSessionService";
import { getAllTopics } from "./debateTopicService";
import { getAllReports } from "./reportService";

export const getEducatorOverview = async () => {
    try {
        const [classesRes, learnersRes, analyticsRes, topics, sessions, reports] = await Promise.all([
            apiClient.get("/api/v1/educator/classes").catch(() => ({ data: [] })),
            apiClient.get("/api/v1/educator/learners").catch(() => ({ data: [] })),
            apiClient.get("/api/v1/educator/class-analytics").catch(() => ({ data: null })),
            getAllTopics().catch(() => []),
            getMySessions().catch(() => []),
            getAllReports().catch(() => ({ data: [] })),
        ]);

        const reportData = Array.isArray(reports?.data) ? reports.data : Array.isArray(reports) ? reports : [];

        return {
            classes: classesRes.data || [],
            learners: learnersRes.data || [],
            assignments: sessions,
            reports: reportData,
            classAnalytics: analyticsRes.data,
            rankings: topics,
            topics,
        };
    } catch (error) {
        console.error("Error loading educator overview:", error);
        return {
            classes: [],
            learners: [],
            assignments: [],
            reports: [],
            classAnalytics: null,
            rankings: [],
            topics: [],
        };
    }
};

export const getEducatorClasses = async () => {
    const res = await apiClient.get("/api/v1/educator/classes");
    return res.data;
};

export const getEnrolledLearners = async () => {
    const res = await apiClient.get("/api/v1/educator/learners");
    return res.data;
};

export const getClassAnalytics = async () => {
    const res = await apiClient.get("/api/v1/educator/class-analytics");
    return res.data;
};

export const createEducatorClass = async (classData) => {
    const res = await apiClient.post(`/api/v1/educator/classes?name=${encodeURIComponent(classData.name)}&description=${encodeURIComponent(classData.description || '')}`);
    return res.data;
};

export const assignDebateTopic = async (assignmentData) => {
    const res = await apiClient.post("/api/v1/educator/assign-debate", assignmentData);
    return res.data;
};

export default {
    getEducatorOverview,
    getEducatorClasses,
    getEnrolledLearners,
    getClassAnalytics,
    createEducatorClass,
    assignDebateTopic,
};