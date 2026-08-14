import { useEffect, useMemo, useState } from "react";

import { FaChartLine, FaComments, FaStar, FaUser } from "react-icons/fa";

import { useAuth } from "../../hooks/useAuth";

import StatCard from "../../components/cards/StatCard";
import CreateTopicModal from "../../components/debateTopics/CreateTopicModal";
import DebateTopicFilters from "../../components/debateTopics/DebateTopicFilters";
import DebateTopicsHeader from "../../components/debateTopics/DebateTopicsHeader";
import MyTopicsSection from "../../components/debateTopics/MyTopicsSection";
import OfficialTopicsSection from "../../components/debateTopics/OfficialTopicsSection";
import RecommendedTopics from "../../components/debateTopics/RecommendedTopics";
import MainLayout from "../../components/layout/MainLayout";
import debateTopicService from "../../services/debateTopicService";
import { getMySessions, createSession } from "../../services/debateSessionService";
import { toArray } from "../../utils/learnerHelpers";
import DeleteTopicModal from "../../components/debateTopics/DeleteTopicModal";
import { useNavigate } from "react-router-dom";
import { getRecommendedTopics } from "../../services/recommendationService";
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
    debate_format: topic.debate_format|| "Public Forum Debate",
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
    const [modalMode, setModalMode] = useState("create");
    const [selectedTopic, setSelectedTopic] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [topicToDelete, setTopicToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [modalSubmitError, setModalSubmitError] = useState("");
    const [topics, setTopics] = useState([]);
    const [recommendedTopicData, setRecommendedTopicData] = useState([]);
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

    useEffect(() => {
        if (authLoading || !user) {
            return undefined;
        }

        let isActive = true;

        const run = async () => {
            setLoading(true);

            try {
                const response = await debateTopicService.getAllTopics();

                if (!isActive) {
                    return;
                }

                setTopics(Array.isArray(response) ? response : []);
                const recommendedResponse = await getRecommendedTopics().catch(() => []);
                setRecommendedTopicData(Array.isArray(recommendedResponse) ? recommendedResponse : []);
                setError("");
            } catch (loadError) {
                console.error("Error loading debate topics:", loadError);

                if (isActive) {
                    setError("Unable to load debate topics right now. Please try again later.");
                }
            } finally {
                if (isActive) {
                    setLoading(false);
                }
            }
        };

        void run();

        return () => {
            isActive = false;
        };
    }, [authLoading, user]);

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

    const personalizedRecommendedTopics = useMemo(() => {
        return recommendedTopicData.length > 0
            ? recommendedTopicData.map((topic) => ({
                ...normalizeTopic(topic, user?.id),
                topic_type: "recommended"
            }))
            : filteredTopics
                .filter((topic) => topic.topic_type === "official")
                .slice(0, 3)
                .map((topic) => ({
                    ...topic,
                    topic_type: "recommended"
                }));
    }, [filteredTopics, recommendedTopicData, user?.id]);

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
            value: personalizedRecommendedTopics.length,
            icon: <FaChartLine />,
            color: "#8B5CF6"
        }
    ]), [normalizedTopics.length, officialTopics.length, myTopics.length, personalizedRecommendedTopics.length]);

    const refreshTopics = async () => {
        const response = await debateTopicService.getAllTopics();
        setTopics(Array.isArray(response) ? response : []);
        const recommendedResponse = await getRecommendedTopics().catch(() => []);
        setRecommendedTopicData(Array.isArray(recommendedResponse) ? recommendedResponse : []);
    };

  const handleSubmitTopic = async (data) => {
    try {
        setCreateLoading(true);
        setModalSubmitError("");

        if (modalMode === "create") {

            await debateTopicService.createTopic({
                ...data,
                topic_type: "CUSTOM",
            });

            setSuccessMessage("Topic created successfully.");

        } else {

            await debateTopicService.updateTopic(
                selectedTopic.id,
                data
            );

            setSuccessMessage("Topic updated successfully.");
        }

        setIsCreateModalOpen(false);

        await refreshTopics();

    } catch (err) {

        console.error("Topic submission error:", err);

        const errorMsg =
            err.response?.data?.detail ||
            (modalMode === "create"
                ? "Unable to create topic."
                : "Unable to update topic.");

        setModalSubmitError(errorMsg);

    } finally {
        setCreateLoading(false);
    }
};

    const handleEditTopic = (topic) => {
    setSelectedTopic(topic);
    setModalMode("edit");
    setModalSubmitError("");
    setIsCreateModalOpen(true);
};

const handleDeleteTopic = (topic) => {
    setTopicToDelete(topic);
    setShowDeleteModal(true);
};

const handleConfirmDelete = async () => {
    if (!topicToDelete) return;

    try {
        setDeleteLoading(true);

        await debateTopicService.deleteTopic(topicToDelete.id);

        setSuccessMessage("Topic deleted successfully.");

        setShowDeleteModal(false);
        setTopicToDelete(null);

        await refreshTopics();

    } catch (err) {
        console.error("Delete topic error:", err);
    } finally {
        setDeleteLoading(false);
    }
};

    const handleViewDetails = (topic) => {
        if (!topic?.id) return;
        navigate(`/topics/${topic.id}`, {
            state: {
                selectedTopic: topic,
                source: "topic-details",
            },
        });
    };

    const handleJoinDebate = async (topic) => {
        if (!topic?.id) {
            setError("Invalid topic selected.");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const mySessions = await getMySessions().catch(() => []);
            const sessionList = toArray(mySessions);

            const existingSession = sessionList.find(
                (s) => Number(s.topic_id) === Number(topic.id) && (s.status !== "Completed" && s.session_status !== "Completed")
            ) || sessionList.find(
                (s) => Number(s.topic_id) === Number(topic.id)
            );

            if (existingSession && existingSession.id) {
                navigate(`/debate-room/${existingSession.id}`, {
                    state: {
                        selectedTopic: topic,
                        selectedSession: existingSession,
                    },
                });
                return;
            }

            const newSession = await createSession({
                topic_id: Number(topic.id),
                debate_format: topic.debate_format || "Public Forum Debate",
                debate_position: "Affirmative",
                scheduled_at: new Date().toISOString(),
            });

            if (newSession && newSession.id) {
                navigate(`/debate-room/${newSession.id}`, {
                    state: {
                        selectedTopic: topic,
                        selectedSession: newSession,
                    },
                });
            } else {
                setError("Unable to create a debate session for this topic.");
            }
        } catch (err) {
            console.error("Error joining debate session:", err);
            setError(
                err.response?.data?.detail || "Unable to join debate session. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setTopicToDelete(null);
};
   const handleSelectTopic = (topic) => {
    navigate(`/topics/${topic.id}`, {
        state: {
            selectedTopic: topic,
            source: "topic-details",
            action: "select",
        },
    });
};
    return (
        <MainLayout>
            <div className="debate-topics-page">
                <DebateTopicsHeader
    onCreateTopic={() => {
        setModalMode("create");
        setSelectedTopic(null);
        setModalSubmitError("");
        setIsCreateModalOpen(true);
    }}
/>

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

                        <div className="topics-content-grid">
                            <RecommendedTopics
                                recommendedTopics={personalizedRecommendedTopics}
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
                                onCreateTopic={() => {
                                    setModalMode("create");
                                    setSelectedTopic(null);
                                    setModalSubmitError("");
                                    setIsCreateModalOpen(true);
                                }}
                                onViewDetails={handleViewDetails}
                                onJoinDebate={handleJoinDebate}
                                onEditTopic={handleEditTopic}
                                onDeleteTopic={handleDeleteTopic}
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
                        mode={modalMode}
                        topic={selectedTopic}
                        onClose={() => {
                            setIsCreateModalOpen(false);
                            setModalSubmitError("");
                        }}
                        onSubmit={handleSubmitTopic}
                        loading={createLoading}
                        submitError={modalSubmitError}
                    />

                <DeleteTopicModal
                    isOpen={showDeleteModal}
                    topic={topicToDelete}
                    loading={deleteLoading}
                    onClose={handleCloseDeleteModal}
                    onConfirm={handleConfirmDelete}
                />
            </div>
        </MainLayout>
    );
};

export default DebateTopics;