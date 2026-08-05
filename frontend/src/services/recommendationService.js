import { getMySkill } from "./skillService";
import { getAllTopics } from "./debateTopicService";

const sortByDifficulty = (topics, skillScore) => {
    const targetLevel = skillScore >= 80 ? "advanced" : skillScore >= 60 ? "intermediate" : "beginner";

    return [...topics].sort((firstTopic, secondTopic) => {
        const firstDifficulty = (firstTopic.difficulty_level || "").toLowerCase();
        const secondDifficulty = (secondTopic.difficulty_level || "").toLowerCase();

        const firstMatch = firstDifficulty.includes(targetLevel) ? 1 : 0;
        const secondMatch = secondDifficulty.includes(targetLevel) ? 1 : 0;

        return secondMatch - firstMatch;
    });
};

export const getRecommendedTopics = async () => {
    const [topics, skill] = await Promise.all([
        getAllTopics(),
        getMySkill().catch(() => null),
    ]);

    const communication = Number(skill?.communication_score || 0);

    return sortByDifficulty(topics, communication).slice(0, 6);
};

export const getLearningPath = async () => {
    const recommendedTopics = await getRecommendedTopics();

    return recommendedTopics.map((topic, index) => ({
        id: topic.id,
        step: index + 1,
        title: topic.title,
        category: topic.category,
        difficulty_level: topic.difficulty_level,
        estimated_duration: topic.estimated_duration,
        learning_goal: topic.learning_goal,
    }));
};

export default {
    getRecommendedTopics,
    getLearningPath,
};