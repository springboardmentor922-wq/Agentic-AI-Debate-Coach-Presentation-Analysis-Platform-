import apiClient from "./apiClient";
import { getMySessions } from "./debateSessionService";
import { getAllReports } from "./reportService";

export const getNotifications = async () => {
    try {
        const response = await apiClient.get("/api/v1/notifications");
        if (Array.isArray(response.data) && response.data.length > 0) {
            return response.data;
        }
    } catch (err) {
        console.warn("Backend notification endpoint error, falling back to local synthesis:", err);
    }

    const [sessions, reports] = await Promise.all([
        getMySessions().catch(() => []),
        getAllReports().catch(() => ({ data: [] })),
    ]);

    const reportData = Array.isArray(reports?.data) ? reports.data : Array.isArray(reports) ? reports : [];

    const sessionNotifications = sessions.map((session) => ({
        id: `session-${session.id}`,
        type: "session",
        title: session.topic_title || `Session ${session.id}`,
        message: `Session status: ${session.session_status || session.status || "Unknown"}`,
        created_at: session.updated_at || session.created_at,
    }));

    const reportNotifications = reportData.map((report) => ({
        id: `report-${report.id}`,
        type: "report",
        title: report.title || `Report ${report.id}`,
        message: report.summary || report.message || "Debate report available.",
        created_at: report.created_at,
    }));

    return [...reportNotifications, ...sessionNotifications].sort((firstItem, secondItem) => {
        return new Date(secondItem.created_at || 0) - new Date(firstItem.created_at || 0);
    });
};

export const markNotificationRead = async (id) => {
    try {
        const response = await apiClient.put(`/api/v1/notifications/${id}/read`);
        return response.data;
    } catch (err) {
        console.warn("Mark read error:", err);
    }
};

export const markAllNotificationsRead = async () => {
    try {
        const response = await apiClient.put("/api/v1/notifications/mark-all-read");
        return response.data;
    } catch (err) {
        console.warn("Mark all read error:", err);
    }
};

export default {
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
};