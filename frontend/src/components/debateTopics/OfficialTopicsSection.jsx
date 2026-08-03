import React from "react";
import DebateTopicCard from "./DebateTopicCard";
import "./OfficialTopicsSection.css";

const OfficialTopicsSection = ({
  topics = [],
  loading = false,
  onViewDetails,
  onSelectTopic,
}) => {
  return (
    <section className="official-topics-section">

      <div className="section-header">
        <div>
          <h2>Official Debate Topics</h2>
          <p>
            Explore platform-curated debate topics designed to improve critical
            thinking, communication, and public speaking skills.
          </p>
        </div>

        <span className="topic-count">
          {topics.length} Topics
        </span>
      </div>

      {loading ? (
        <div className="official-loading">
          Loading official debate topics...
        </div>
      ) : topics.length === 0 ? (
        <div className="official-empty">
          <h3>No Official Topics Found</h3>
          <p>
            There are currently no official debate topics available.
          </p>
        </div>
      ) : (
        <div className="official-topics-grid">
          {topics.map((topic) => (
            <DebateTopicCard
              key={topic.id}
              topic={topic}
              onViewDetails={onViewDetails}
              showViewDetails={false}
              onSelectTopic={onSelectTopic}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default OfficialTopicsSection;