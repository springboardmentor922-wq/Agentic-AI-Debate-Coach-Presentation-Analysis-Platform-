import React from "react";
import DebateTopicCard from "./DebateTopicCard";
import "./RecommendedTopics.css";

const RecommendedTopics = ({
  recommendedTopics = [],
  loading = false,
  onViewDetails,
  onSelectTopic,
}) => {
  if (loading) {
    return (
      <section className="recommended-section">
        <div className="section-header">
          <h2>🤖 AI Recommended Topics</h2>
          <p>Finding the best topics for you...</p>
        </div>

        <div className="recommended-loading">
          Loading recommendations...
        </div>
      </section>
    );
  }

  return (
    <section className="recommended-section">

      <div className="section-header">
        <div>
          <h2>🤖 AI Recommended Topics</h2>
          <p>
            Practice topics recommended based on your debate performance and
            learning progress.
          </p>
        </div>

        <button className="see-all-btn">
          See All
        </button>
      </div>

      {recommendedTopics.length === 0 ? (

        <div className="recommended-empty">

          <h3>No recommendations yet</h3>

          <p>
            Complete a few debates to receive personalized topic
            recommendations from your AI Debate Coach.
          </p>

        </div>

      ) : (

        <div className="recommended-grid">

          {recommendedTopics.map((topic) => (

            <DebateTopicCard
              key={topic.id}
              topic={topic}
              onViewDetails={onViewDetails}
              onSelectTopic={onSelectTopic}
            />

          ))}

        </div>

      )}

    </section>
  );
};

export default RecommendedTopics;