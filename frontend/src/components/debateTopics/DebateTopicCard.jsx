import React, { useState, useRef, useEffect } from "react";
import { FaEllipsisV, FaEdit, FaTrash, FaInfoCircle } from "react-icons/fa";
import "./DebateTopicCard.css";

const DebateTopicCard = ({
    topic,
    onViewDetails,
    onSelectTopic,
    selectButtonText = "Select Topic",
    showViewDetails = true,
    showActions = false,
    onEdit,
    onDelete,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  return (
    <div className="debate-topic-card">
     {/* Header */}
<div className="topic-card-header">
  <h3>{topic.title}</h3>

  <div className="topic-header-actions">
    <span className={`topic-type-badge ${topic.topic_type?.toLowerCase()}`}>
      {topic.topic_type?.toUpperCase() === "OFFICIAL" && "Official"}
      {topic.topic_type?.toUpperCase() === "CUSTOM" && "My Topic"}
      {topic.topic_type?.toUpperCase() === "RECOMMENDED" && "AI Recommended"}
    </span>

    {showActions && (
      <div className="topic-menu" ref={menuRef}>
        <button
          type="button"
          className="menu-btn"
          onClick={(e) => {
            e.stopPropagation();
            setMenuOpen((prev) => !prev);
          }}
          aria-label="Topic Actions Menu"
          aria-expanded={menuOpen}
        >
          <FaEllipsisV />
        </button>

        {menuOpen && (
          <div className="menu-dropdown">
            {onViewDetails && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onViewDetails(topic);
                }}
              >
                <FaInfoCircle style={{ color: "#2563eb" }} />
                <span>View Details</span>
              </button>
            )}

            {onEdit && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onEdit(topic);
                }}
              >
                <FaEdit style={{ color: "#059669" }} />
                <span>Edit Topic</span>
              </button>
            )}

            {onDelete && (
              <button
                type="button"
                className="delete-option"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                  onDelete(topic);
                }}
              >
                <FaTrash />
                <span>Delete Topic</span>
              </button>
            )}
          </div>
        )}
      </div>
    )}
  </div>
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
<div
  className={`topic-actions ${
    showViewDetails ? "" : "single-button"
  }`}
>

  {showViewDetails && (
    <button
      className="view-details-btn"
      onClick={() => onViewDetails?.(topic)}
    >
      View Details
    </button>
  )}

  <button
    className="select-topic-btn"
    onClick={() => onSelectTopic?.(topic)}
  >
    {selectButtonText}
  </button>

</div>
      </div>
    </div>
  );
};

export default DebateTopicCard;