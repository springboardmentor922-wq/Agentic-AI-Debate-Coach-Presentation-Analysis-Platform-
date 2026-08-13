import { useEffect, useState } from "react";
import { FaBook, FaSearch, FaFilter, FaFileAlt, FaLightbulb } from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import Breadcrumb from "../../components/common/Breadcrumb";
import { getAllTopics } from "../../services/debateTopicService";
import { toArray } from "../../utils/learnerHelpers";

import "./ResourceLibrary.css";

const ResourceLibrary = () => {
    const [topics, setTopics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    useEffect(() => {
        let active = true;

        const loadResources = async () => {
            try {
                setLoading(true);
                const topicData = await getAllTopics();
                if (!active) return;
                setTopics(toArray(topicData));
                setError("");
            } catch (err) {
                console.error(err);
                if (active) setError("Unable to load resource library.");
            } finally {
                if (active) setLoading(false);
            }
        };

        void loadResources();
        return () => { active = false; };
    }, []);

    const categories = Array.from(new Set(topics.map((t) => t.category).filter(Boolean)));

    const filteredTopics = topics.filter((t) => {
        const matchesCategory = categoryFilter === "all" || String(t.category || "").toLowerCase() === categoryFilter.toLowerCase();
        const matchesSearch = !searchQuery || (t.title || "").toLowerCase().includes(searchQuery.toLowerCase()) || (t.description || "").toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    if (loading) {
        return (
            <MainLayout>
                <div className="resource-page"><div className="empty-state">Loading resource library...</div></div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="resource-page">
                <Breadcrumb items={[{ label: "Dashboard", path: "/educator/dashboard" }, { label: "Resource Library" }]} />

                <div className="page-header">
                    <div>
                        <h1>Resource Library & Debate Materials</h1>
                        <p>Access curated debate topics, logical reasoning guides, and practice rubrics.</p>
                    </div>
                    <div className="header-badge"><FaBook /> {topics.length} Resources</div>
                </div>

                {error && <div className="empty-state">{error}</div>}

                <div className="filters-toolbar">
                    <div className="search-input-box">
                        <FaSearch />
                        <input
                            type="text"
                            placeholder="Search topics or learning materials..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <label className="filter-label">
                        <FaFilter /> Category
                        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
                            <option value="all">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </label>
                </div>

                <div className="resources-grid">
                    {filteredTopics.length === 0 ? (
                        <div className="empty-state">No debate resources found matching your filter.</div>
                    ) : (
                        filteredTopics.map((topic) => (
                            <article key={topic.id} className="resource-card">
                                <div className="card-top">
                                    <span className="category-tag">{topic.category || "General"}</span>
                                    <span className={`difficulty-tag ${(topic.difficulty_level || "intermediate").toLowerCase()}`}>
                                        {topic.difficulty_level || "Intermediate"}
                                    </span>
                                </div>

                                <h3>{topic.title}</h3>
                                <p>{topic.description || "Curated debate practice topic with AI scoring rubric and structured motion guidelines."}</p>

                                <div className="card-footer">
                                    <span><FaLightbulb /> Goal: {topic.learning_goal || "Improve Argument Structure"}</span>
                                    <small><FaFileAlt /> Format: {topic.format || "Standard"}</small>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </MainLayout>
    );
};

export default ResourceLibrary;
