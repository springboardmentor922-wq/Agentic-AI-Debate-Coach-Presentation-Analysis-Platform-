import React from "react";
import "./DeleteTopicModal.css";

const DeleteTopicModal = ({
  isOpen,
  topic,
  loading = false,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !topic) return null;

  return (
    <div className="modal-overlay">
      <div className="delete-topic-modal">

        <div className="modal-header">
          <h2>Delete Debate Topic</h2>

          <button
            className="close-btn"
            onClick={onClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <div className="delete-modal-content">

          <div className="warning-icon">
            🗑️
          </div>

          <h3>Are you sure?</h3>

          <p>
            You are about to delete
            <strong> "{topic.title}"</strong>.
          </p>

          <p className="warning-text">
            This action cannot be undone.
          </p>

        </div>

        <div className="modal-actions">

          <button
            type="button"
            className="cancel-btn"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </button>

          <button
            type="button"
            className="delete-btn"
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete Topic"}
          </button>

        </div>

      </div>
    </div>
  );
};

export default DeleteTopicModal;