import React from "react";
import "./DebateTopicsHeader.css";

const DebateTopicsHeader = ({ onCreateTopic }) => {
  return (
    <div className="debate-topics-header">
      <div className="header-content">
        <div className="header-text">
          <h1>Debate Topics</h1>
          <p>
            Discover official debate topics, create your own practice topics,
            and improve your public speaking, critical thinking, and debating
            skills.
          </p>
        </div>

        <button
          className="create-topic-btn"
          onClick={onCreateTopic}
        >
          + Create Topic
        </button>
      </div>
    </div>
  );
};

export default DebateTopicsHeader;