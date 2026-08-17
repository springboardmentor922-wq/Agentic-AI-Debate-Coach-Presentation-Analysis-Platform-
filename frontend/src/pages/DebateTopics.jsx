import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import Layout from "../components/Layout";
import { getTopics } from "../services/debateService";

function DebateTopics() {
  const [topics, setTopics] = useState([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const response = await getTopics();

        setTopics(
          Array.isArray(response.data)
            ? response.data
            : []
        );
      } catch (error) {
        console.error("Failed to load debate topics:", error);
        setTopics([]);
      }
    };

    fetchTopics();
  }, []);

  const categories = [
    "All",
    "Technology",
    "Education",
    "Healthcare",
    "Environment",
    "Business",
    "Politics",
  ];

  const filteredTopics = useMemo(() => {
    return topics.filter((topic) => {
      const matchesCategory =
        category === "All" ||
        topic.category === category;

      const matchesSearch =
        topic.title
          ?.toLowerCase()
          .includes(search.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [topics, category, search]);

  const handleCreateSession = (topic) => {
    navigate("/create-session", {
      state: {
        topic: topic.title,
        topicId: topic.id,
        category: topic.category,
        difficulty: topic.difficulty,
      },
    });
  };

  return (
    <Layout>
      <div className="container">

        {/* Header */}
        <div
    style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "25px",
        gap: "20px",
        flexWrap: "wrap"
    }}
>
    <div>
        <h1>🎤 Debate Topics</h1>

        <p>
            Select a topic and create a debate session
            to start practicing your debating skills.
        </p>
    </div>

    <button
        className="btn btn-primary"
        onClick={() => navigate("/create-session")}
        style={{
            whiteSpace: "nowrap",
            padding: "12px 20px",
            fontWeight: "600"
        }}
    >
         Create Your Own Debate
    </button>
</div>

        {/* Search and Filter */}
        <div
          className="d-flex gap-3 mb-4"
          style={{
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <input
            className="form-control"
            placeholder="Search debate topics..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              maxWidth: "350px",
            }}
          />

          <select
            className="form-select"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value)
            }
            style={{
              maxWidth: "220px",
            }}
          >
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Topics */}
        <div className="row">

          {filteredTopics.length === 0 ? (
            <div className="col-12">
              <div className="card p-4">
                <h4>
                  No Debate Topics Available
                </h4>

                <p className="text-muted mb-0">
                  Try changing your search or category.
                </p>
              </div>
            </div>
          ) : (
            filteredTopics.map((topic) => (

              <div
                className="col-md-6 mb-4"
                key={topic.id}
              >

                <div className="card shadow h-100">

                  <div className="card-body d-flex flex-column">

                    <h4 className="card-title">
                      {topic.title}
                    </h4>

                    <p className="card-text">
                      {topic.description}
                    </p>

                    <div className="mb-3">

                      <span className="badge bg-primary me-2">
                        {topic.category}
                      </span>

                      <span
                        className={`badge ${
                          topic.difficulty === "Easy"
                            ? "bg-success"
                            : topic.difficulty === "Medium"
                            ? "bg-warning text-dark"
                            : "bg-danger"
                        }`}
                      >
                        {topic.difficulty}
                      </span>

                    </div>

                    {/* Create Session */}
                    <button
                      className="btn btn-success mt-auto"
                      onClick={() =>
                        handleCreateSession(topic)
                      }
                    >
                      🚀 Create Debate Session
                    </button>

                  </div>

                </div>

              </div>

            ))
          )}

        </div>

      </div>
    </Layout>
  );
}

export default DebateTopics;