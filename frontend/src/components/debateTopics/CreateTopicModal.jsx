import React, { useState, useEffect } from "react";
import "./CreateTopicModal.css";

const initialForm = {
  title: "",
  category: "Technology",
  debate_format: "Public Forum Debate",
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

          {/* Topic Title */}
          <div className="form-group">

            <label>Topic Title *</label>

            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Example: Should AI replace teachers?"
              required
              minLength={3}
              maxLength={150}
            />

          </div>

          {/* Category + Difficulty */}
          <div className="form-row">

            <div className="form-group">

              <label>Category *</label>

              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="Technology">Technology</option>
                <option value="Artificial Intelligence">
                  Artificial Intelligence
                </option>
                <option value="Education">Education</option>
                <option value="Environment">Environment</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Politics">Politics</option>
                <option value="Business">Business</option>
                <option value="Economics">Economics</option>
                <option value="Ethics">Ethics</option>
                <option value="Law">Law</option>
                <option value="Science">Science</option>
                <option value="Social Issues">Social Issues</option>
                <option value="General">General</option>
                <option value="Other">Other</option>
              </select>

            </div>

            <div className="form-group">

              <label>Difficulty *</label>

              <select
                name="difficulty_level"
                value={formData.difficulty_level}
                onChange={handleChange}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>

            </div>

          </div>

          {/* Debate Format + Duration */}
          <div className="form-row">

            <div className="form-group">

              <label>Debate Format *</label>

              <select
                name="debate_format"
                value={formData.debate_format}
                onChange={handleChange}
              >
                <option value="Public Forum Debate">
                  Public Forum Debate
                </option>

                <option value="Oxford Debate">
                  Oxford Debate
                </option>

                <option value="Parliamentary Debate">
                  Parliamentary Debate
                </option>

                <option value="Policy Debate">
                  Policy Debate
                </option>

                <option value="One-on-One Debate">
                  One-on-One Debate
                </option>
              </select>

            </div>

            <div className="form-group">

              <label>Duration *</label>

              <select
                name="estimated_duration"
                value={formData.estimated_duration}
                onChange={handleChange}
              >
                <option value={5}>5 Minutes</option>
                <option value={10}>10 Minutes</option>
                <option value={15}>15 Minutes</option>
                <option value={20}>20 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={45}>45 Minutes</option>
                <option value={60}>60 Minutes</option>
              </select>

            </div>

          </div>

          {/* Visibility */}
          <div className="form-group">

            <label>Visibility *</label>

            <select
              name="visibility"
              value={formData.visibility}
              onChange={handleChange}
            >
              <option value="PUBLIC">Public</option>
              <option value="PRIVATE">Private</option>
            </select>

          </div>

          {/* Learning Goal */}
          <div className="form-group">

            <label>Learning Goal (Optional)</label>

            <textarea
              rows="3"
              name="learning_goal"
              value={formData.learning_goal}
              onChange={handleChange}
              placeholder="Example: Improve rebuttal skills, confidence and critical thinking."
            />

          </div>

          {/* AI Topic Generator */}
          <div className="future-ai-placeholder">

            ✨ AI Topic Generator

            <span>
              Generate a debate topic automatically using AI
              <br />
              <small>(Milestone 3)</small>
            </span>

          </div>

          {/* Buttons */}
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