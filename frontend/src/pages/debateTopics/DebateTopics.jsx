import { useEffect, useMemo, useState } from "react";

import { FaChartLine, FaComments, FaStar, FaUser } from "react-icons/fa";

import { useAuth } from "../../context/AuthContext";

import StatCard from "../../components/cards/StatCard";
import CreateTopicModal from "../../components/debateTopics/CreateTopicModal";
import DebateTopicFilters from "../../components/debateTopics/DebateTopicFilters";
import DebateTopicsHeader from "../../components/debateTopics/DebateTopicsHeader";
import MyTopicsSection from "../../components/debateTopics/MyTopicsSection";
import OfficialTopicsSection from "../../components/debateTopics/OfficialTopicsSection";
import RecommendedTopics from "../../components/debateTopics/RecommendedTopics";
import MainLayout from "../../components/layout/MainLayout";
import debateTopicService from "../../services/debateTopicService";
import { useNavigate } from "react-router-dom";
import "./DebateTopics.css";

const formatDate = (value) => {
    if (!value) {
        return "Recently";
    }

    const parsedDate = new Date(value);

    if (Number.isNaN(parsedDate.getTime())) {
        return "Recently";
    }

    return parsedDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
};

const normalizeDifficulty = (value) => {
    const normalized = (value || "").toString().trim().toLowerCase();

    if (["beginner", "easy", "basic"].includes(normalized)) {
        return "Beginner";
    }

    if (["intermediate", "medium", "moderate"].includes(normalized)) {
        return "Intermediate";
    }

    if (["advanced", "hard", "expert"].includes(normalized)) {
        return "Advanced";
    }

    return "Beginner";
};

const normalizeTopicType = (topic, currentUserId) => {
    const rawType = (topic?.topic_type || "").toString().trim().toLowerCase();

    if (["official", "custom", "recommended"].includes(rawType)) {
        return rawType;
    }

    if (
        topic?.created_by &&
        currentUserId &&
        Number(topic.created_by) === Number(currentUserId)
    ) {
        return "custom";
    }

    return "official";
};

const normalizeTopic = (topic, currentUserId) => ({
    id: topic.id,
    title: topic.title,
    description: topic.description || "No description available.",
    category: topic.category || "General",
    difficulty: normalizeDifficulty(topic.difficulty_level),
    estimated_duration: topic.estimated_duration || 20,
    available_sessions: topic.available_sessions || 0,
    updated_at: formatDate(topic.updated_at || topic.created_at),
    topic_type: normalizeTopicType(topic, currentUserId),
    visibility: topic.visibility,
    created_by: topic.created_by,
    is_system_generated: Boolean(topic.is_system_generated),
    learning_goal: topic.learning_goal,
    created_at: topic.created_at
});

const DebateTopics = () => {
    const { user, loading: authLoading } = useAuth();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [createLoading, setCreateLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [category, setCategory] = useState("all");
    const [difficulty, setDifficulty] = useState("all");
    const [topicType, setTopicType] = useState("all");
    const [sortBy, setSortBy] = useState("latest");

    const navigate = useNavigate();
    const loadTopics = async ({ showLoading = true, suppressErrors = false } = {}) => {
        if (showLoading) {
            setLoading(true);
        }

        try {
            const response = await debateTopicService.getAllTopics();
            setTopics(Array.isArray(response) ? response : []);
            setError("");
            return true;
        } catch (loadError) {
            console.error("Error loading debate topics:", loadError);

            if (!suppressErrors) {
                setError("Unable to load debate topics right now. Please try again later.");
            }

            return false;
        } finally {
            if (showLoading) {
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (authLoading || !user) {
            return;
        }

        loadTopics();
    }, [authLoading, user?.id]);

    useEffect(() => {
        if (!successMessage) {
            return undefined;
        }

        const timer = setTimeout(() => {
            setSuccessMessage("");
        }, 3500);

        return () => clearTimeout(timer);
    }, [successMessage]);

    const normalizedTopics = useMemo(() => {
        return topics.map((topic) => normalizeTopic(topic, user?.id));
    }, [topics, user?.id]);

    const filteredTopics = useMemo(() => {
        const query = searchTerm.trim().toLowerCase();

        const filtered = normalizedTopics.filter((topic) => {
            const searchableText = [
                topic.title,
                topic.description,
                topic.category,
                topic.learning_goal
            ]
                .filter(Boolean)
                .join(" ")
                .toLowerCase();

            const matchesSearch = !query || searchableText.includes(query);
            const matchesCategory = category === "all" || topic.category === category;
            const matchesDifficulty = difficulty === "all" || topic.difficulty === difficulty;
            const matchesTopicType = topicType === "all" || topic.topic_type === topicType;

            return matchesSearch && matchesCategory && matchesDifficulty && matchesTopicType;
        });

        const sortByDate = (firstTopic, secondTopic) => {
            const firstDate = new Date(firstTopic.created_at || 0).getTime();
            const secondDate = new Date(secondTopic.created_at || 0).getTime();

            if (sortBy === "oldest") {
                return firstDate - secondDate;
            }

            return secondDate - firstDate;
        };

        const sortByTitle = (firstTopic, secondTopic) => {
            const comparison = firstTopic.title.localeCompare(secondTopic.title);
            return sortBy === "za" ? -comparison : comparison;
        };

        if (sortBy === "az" || sortBy === "za") {
            return [...filtered].sort(sortByTitle);
        }

        return [...filtered].sort(sortByDate);
    }, [normalizedTopics, searchTerm, category, difficulty, topicType, sortBy]);

    const officialTopics = useMemo(() => {
        return filteredTopics.filter((topic) => topic.topic_type === "official");
    }, [filteredTopics]);

    const myTopics = useMemo(() => {
        return filteredTopics.filter((topic) => topic.topic_type === "custom");
    }, [filteredTopics]);

    const recommendedTopics = useMemo(() => {
        return filteredTopics
            .filter((topic) => topic.topic_type === "official")
            .slice(0, 3)
            .map((topic) => ({
                ...topic,
                topic_type: "recommended"
            }));
    }, [filteredTopics]);

    const statistics = useMemo(() => ([
        {
            title: "Total Topics",
            value: normalizedTopics.length,
            icon: <FaComments />,
            color: "#2563EB"
        },
        {
            title: "Official Topics",
            value: officialTopics.length,
            icon: <FaStar />,
            color: "#10B981"
        },
        {
            title: "My Practice Topics",
            value: myTopics.length,
            icon: <FaUser />,
            color: "#F59E0B"
        },
        {
            title: "Recommended Topics",
            value: recommendedTopics.length,
            icon: <FaChartLine />,
            color: "#8B5CF6"
        }
    ]), [normalizedTopics.length, officialTopics.length, myTopics.length, recommendedTopics.length]);

    const handleCreateTopic = async (data) => {
        try {
            setCreateLoading(true);
            setError("");

            const createdTopic = await debateTopicService.createTopic({
                ...data,
                topic_type: data.topic_type || "CUSTOM"
            });

            setTopics((previousTopics) => {
                const withoutDuplicate = previousTopics.filter(
                    (topic) => topic.id !== createdTopic.id
                );

                return [createdTopic, ...withoutDuplicate];
            });

            setIsCreateModalOpen(false);
            setSuccessMessage(`Topic "${createdTopic.title}" created successfully.`);

            await loadTopics({
                showLoading: false,
                suppressErrors: true
            });
        } catch (createError) {
            console.error("Error creating debate topic:", createError);
            setError("Unable to create the topic right now. Please try again.");
        } finally {
            setCreateLoading(false);
        }
    };

    const handleViewDetails = (topic) => {
    navigate(`/debate-sessions/topic/${topic.id}`, {
        state: {
            selectedTopic: topic,
        },
    });
};

    const handleSelectTopic = (topic) => {
    navigate(`/debate-sessions/topic/${topic.id}`, {
        state: {
            selectedTopic: topic,
        },
    });
};

    return (
        <MainLayout>
            <div className="debate-topics-page">
                <div className="topics-hero-card">
                    <div className="topics-hero-copy">
                        <span className="page-badge">Topic Library</span>
                        <h1>Explore debate topics with clarity and purpose</h1>
                        <p>Browse curated prompts, review recommended practice material, and keep your prep organized with a polished topic workspace.</p>
                    </div>

                    <div className="topics-hero-metrics">
                        <div className="hero-metric-card">
                            <strong>{normalizedTopics.length}</strong>
                            <span>available topics</span>
                        </div>
                        <div className="hero-metric-card">
                            <strong>{officialTopics.length}</strong>
                            <span>official topics</span>
                        </div>
                    </div>
                </div>

                <DebateTopicsHeader onCreateTopic={() => setIsCreateModalOpen(true)} />

                <div className="topics-stats-grid">
                    {statistics.map((stat) => (
                        <StatCard
                            key={stat.title}
                            title={stat.title}
                            value={stat.value}
                            icon={stat.icon}
                            color={stat.color}
                        />
                    ))}
                </div>

                {successMessage && (
                    <div className="topics-success-banner" role="status">
                        {successMessage}
                    </div>
                )}

                {error ? (
                    <div className="topics-error-banner" role="alert">
                        <h2>Unable to load Debate Topics</h2>
                        <p>{error}</p>
                    </div>
                ) : (
                    <>
                        <div className="topics-filter-shell">
                            <DebateTopicFilters
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}

                                category={category}
                                onCategoryChange={setCategory}

                                difficulty={difficulty}
                                onDifficultyChange={setDifficulty}

                                topicType={topicType}
                                onTopicTypeChange={setTopicType}

                                sortBy={sortBy}
                                onSortChange={setSortBy}
                            />
                        </div>

                        <div className="topics-content-grid">
                            <RecommendedTopics
                                recommendedTopics={recommendedTopics}
                                loading={loading}
                                onViewDetails={handleViewDetails}
                                onSelectTopic={handleSelectTopic}
                            />

                            <OfficialTopicsSection
                                topics={officialTopics}
                                loading={loading}
                                onViewDetails={handleViewDetails}
                                onSelectTopic={handleSelectTopic}
                            />

                            <MyTopicsSection
                                topics={myTopics}
                                loading={loading}
                                onCreateTopic={() => setIsCreateModalOpen(true)}
                                onViewDetails={handleViewDetails}
                                onSelectTopic={handleSelectTopic}
                            />
                        </div>
                    </>
                )}

                {loading && !error && (
                    <div className="topics-loading-banner" role="status">
                        Loading debate topics...
                    </div>
                )}

                <CreateTopicModal
                    isOpen={isCreateModalOpen}
                    onClose={() => setIsCreateModalOpen(false)}
                    onSubmit={handleCreateTopic}
                    loading={createLoading}
                />
            </div>
        </MainLayout>
    );
};

export default DebateTopics;