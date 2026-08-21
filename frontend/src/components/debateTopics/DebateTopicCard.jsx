import React from "react";
import "./DebateTopicCard.css";

const DebateTopicCard = ({
  topic,
  onViewDetails,
  onSelectTopic,
}) => {
  return (
    <div className="debate-topic-card">
      {/* Header */}
      <div className="topic-card-header">
        <h3>{topic.title}</h3>

        <span className={`topic-type-badge ${topic.topic_type?.toLowerCase()}`}>
          {topic.topic_type?.toUpperCase() === "OFFICIAL" && "Official"}
          {topic.topic_type?.toUpperCase() === "CUSTOM" && "My Topic"}
          {topic.topic_type?.toUpperCase() === "RECOMMENDED" && "AI Recommended"}
        </span>
      </div>

      {/* Description */}
      <p className="topic-description">
        {topic.description}
      </p>

      {/* Information */}
      <div className="topic-meta">
        <div className="meta-item">
          <span className="label">Category</span>
          <span>{topic.category}</span>
        </div>

        <div className="meta-item">
          <span className="label">Difficulty</span>

          <span
            className={`difficulty ${(
              topic.difficulty ||
              topic.difficulty_level ||
              "easy"
            ).toLowerCase()}`}
          >
            {topic.difficulty || topic.difficulty_level}
          </span>
        </div>

        <div className="meta-item">
          <span className="label">Duration</span>
          <span>{topic.estimated_duration} mins</span>
        </div>

        <div className="meta-item">
          <span className="label">Sessions</span>
          <span>{topic.available_sessions ?? 0}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="topic-footer">
        <small>
          Updated {topic.updated_at}
        </small>

        <div className="topic-actions">
          <button
            className="view-btn"
            onClick={() => onViewDetails(topic)}
          >
            View Details
          </button>

          <button
            className="select-btn"
            onClick={() => onSelectTopic(topic)}
          >
            Select Topic
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebateTopicCard;