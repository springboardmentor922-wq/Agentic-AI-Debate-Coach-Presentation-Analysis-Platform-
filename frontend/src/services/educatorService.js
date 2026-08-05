import { getMySessions } from "./debateSessionService";
import { getAllTopics } from "./debateTopicService";
import { getMySkill } from "./skillService";

export const getEducatorOverview = async () => {
    const [topics, sessions, skill] = await Promise.all([
        getAllTopics().catch(() => []),
        getMySessions().catch(() => []),
        getMySkill().catch(() => null),
    ]);

    return {
        classes: [],
        assignments: sessions,
        learners: [],
        reports: [],
        rankings: topics,
        analytics: skill,
    };
};

export default {
    getEducatorOverview,
};