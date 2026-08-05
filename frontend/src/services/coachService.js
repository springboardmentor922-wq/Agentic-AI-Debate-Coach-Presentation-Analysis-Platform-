import { getMySessions } from "./debateSessionService";
import { getMySkill } from "./skillService";
import { getAllReports } from "./reportService";

export const getCoachOverview = async () => {
    const [sessions, skill, reports] = await Promise.all([
        getMySessions().catch(() => []),
        getMySkill().catch(() => null),
        getAllReports().catch(() => ({ data: [] })),
    ]);

    const reportData = Array.isArray(reports?.data) ? reports.data : Array.isArray(reports) ? reports : [];

    return {
        assignedLearners: [],
        pendingReviews: reportData.filter((report) => (report.status || "").toLowerCase() !== "completed"),
        reports: reportData,
        sessions,
        coachingPlans: [],
        studentAnalytics: skill,
    };
};

export default {
    getCoachOverview,
};