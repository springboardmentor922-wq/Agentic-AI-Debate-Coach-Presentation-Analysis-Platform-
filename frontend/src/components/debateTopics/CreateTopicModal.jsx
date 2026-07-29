import React, { useState, useEffect } from "react";
import "./CreateTopicModal.css";

const initialForm = {
  title: "",
  description: "",
  category: "",
  difficulty_level: "Beginner",
  estimated_duration: 20,
  learning_goal: "",
  visibility: "PUBLIC",
};

const CreateTopicModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState(initialForm);

  useEffect(() => {
    if (isOpen) {
      setFormData(initialForm);
    }
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "estimated_duration"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">

      <div className="create-topic-modal">

        <div className="modal-header">

          <h2>Create Debate Topic</h2>

          <button
            className="close-btn"
            onClick={onClose}
          >
            ✕
          </button>

        </div>

        <form onSubmit={handleSubmit}>

          <div className="form-group">

            <label>Topic Title *</label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter debate topic"
              required
            />

          </div>

          <div className="form-group">

            <label>Description *</label>

            <textarea
              rows="4"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the debate topic"
              required
            />

          </div>

          <div className="form-row">

            <div className="form-group">

              <label>Category</label>

              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                placeholder="Technology"
              />

            </div>

            <div className="form-group">

              <label>Difficulty</label>

              <select
                name="difficulty_level"
                value={formData.difficulty_level}
                onChange={handleChange}
              >
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>

            </div>

          </div>

          <div className="form-row">

            <div className="form-group">

              <label>Duration (Minutes)</label>

              <input
                type="number"
                min="5"
                max="120"
                name="estimated_duration"
                value={formData.estimated_duration}
                onChange={handleChange}
              />

            </div>

            <div className="form-group">

              <label>Visibility</label>

              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>

            </div>

          </div>

          <div className="form-group">

            <label>Learning Goal</label>

            <textarea
              rows="3"
              name="learning_goal"
              value={formData.learning_goal}
              onChange={handleChange}
              placeholder="Example: Improve persuasive speaking"
            />

          </div>

          {/* Future AI Button */}
          <div className="future-ai-placeholder">

            🤖 AI Topic Generator
            <span>(Coming in Milestone 3)</span>

          </div>

          <div className="modal-actions">

            <button
              type="button"
              className="cancel-btn"
              onClick={onClose}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="save-btn"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Topic"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default CreateTopicModal;