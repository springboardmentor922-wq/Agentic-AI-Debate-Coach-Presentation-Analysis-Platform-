import { getAllReports } from "./reportService";
import { getAllTopics } from "./debateTopicService";
import { getMySessions } from "./debateSessionService";
import { getMySkill } from "./skillService";

export const getAdminOverview = async () => {
    const [reports, topics, sessions, skill] = await Promise.all([
        getAllReports().catch(() => ({ data: [] })),
        getAllTopics().catch(() => []),
        getMySessions().catch(() => []),
        getMySkill().catch(() => null),
    ]);

    const reportData = Array.isArray(reports?.data) ? reports.data : Array.isArray(reports) ? reports : [];

    return {
        users: [],
        roles: [],
        analytics: skill,
        platformMetrics: {
            topics: topics.length,
            sessions: sessions.length,
            reports: reportData.length,
        },
        aiUsage: [],
        systemMonitoring: [],
        reports: reportData,
    };
};

export default {
    getAdminOverview,
};