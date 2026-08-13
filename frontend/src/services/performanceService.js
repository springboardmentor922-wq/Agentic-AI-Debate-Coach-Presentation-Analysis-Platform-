import { getMyProfile } from "./profileService";
import { getMySkill } from "./skillService";
import { getMySessions } from "./debateSessionService";
import { getAllReports } from "./reportService";

const toNumeric = (value) => Number(value || 0);

export const getPerformanceOverview = async () => {
    const [profile, skill, sessions, reports] = await Promise.all([
        getMyProfile().catch(() => null),
        getMySkill().catch(() => null),
        getMySessions().catch(() => []),
        getAllReports().catch(() => ({ data: [] })),
    ]);

    const reportData = Array.isArray(reports?.data) ? reports.data : Array.isArray(reports) ? reports : [];

    return {
        profile,
        skill,
        sessions,
        reports: reportData,
        summary: {
            communication_score: toNumeric(skill?.communication_score),
            critical_thinking_score: toNumeric(skill?.critical_thinking_score),
            presentation_score: toNumeric(skill?.presentation_score),
            argument_score: toNumeric(skill?.argument_score),
            confidence_score: toNumeric(skill?.confidence_score),
            total_debates: toNumeric(skill?.total_debates),
            total_presentations: toNumeric(skill?.total_presentations),
            completed_sessions: sessions.filter((session) => (session.session_status || "").toLowerCase() === "completed").length,
        },
    };
};

export const getPerformanceMetrics = getPerformanceOverview;

export default {
    getPerformanceOverview,
    getPerformanceMetrics,
};