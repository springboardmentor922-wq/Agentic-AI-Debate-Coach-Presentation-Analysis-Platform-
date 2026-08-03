import React from "react";
import DebateTopicCard from "./DebateTopicCard";
import "./MyTopicsSection.css";

const MyTopicsSection = ({
  topics = [],
  loading = false,
  onViewDetails,
  onSelectTopic,
  onCreateTopic,
  onEditTopic,
  onDeleteTopic,
  onJoinDebate,
}) => {
  return (
    <section className="my-topics-section">

      <div className="section-header">
        <div>
          <h2>My Practice Topics</h2>
          <p>
            Create your own debate topics to practice public speaking,
            interview communication, and critical thinking skills.
          </p>
        </div>

        <button
          className="create-topic-btn"
          onClick={onCreateTopic}
        >
          + Create Topic
        </button>
      </div>

      {loading ? (

        <div className="my-topics-loading">
          Loading your topics...
        </div>

      ) : topics.length === 0 ? (

        <div className="my-topics-empty">

          <h3>No Practice Topics Yet</h3>

          <p>
            Start by creating your first debate topic and practice
            speaking with the AI Debate Coach.
          </p>

          <button
            className="empty-create-btn"
            onClick={onCreateTopic}
          >
            Create Your First Topic
          </button>

        </div>

      ) : (

        <div className="my-topics-grid">

          {topics.map((topic) => (
            <DebateTopicCard
    key={topic.id}
    topic={topic}
    onViewDetails={onViewDetails}
    onSelectTopic={onJoinDebate}

    selectButtonText="Join Debate"

    showActions={true}

    onEdit={onEditTopic}

    onDelete={onDeleteTopic}
/>

          ))}

        </div>

      )}

    </section>
  );
};

export default MyTopicsSection;