import { getMySessions } from "./debateSessionService";
import { getAllReports } from "./reportService";

export const getNotifications = async () => {
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

export default {
    getNotifications,
};