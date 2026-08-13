import React, { useState, useEffect } from "react";
import debateTopicService from "../../services/debateTopicService";
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
    mode = "create",
    topic = null,
    onClose,
    onSubmit,
    loading = false,
}) => {
  const [formData, setFormData] = useState(initialForm);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState("");

 useEffect(() => {
    if (!isOpen) return;

    if (mode === "edit" && topic) {
        setFormData({
            title: topic.title || "",
            category: topic.category || "Technology",
            debate_format: topic.debate_format || "Public Forum Debate",
            difficulty_level: topic.difficulty || topic.difficulty_level,
            estimated_duration: topic.estimated_duration || 20,
            learning_goal: topic.learning_goal || "",
            visibility: topic.visibility || "PUBLIC",
        });
    } else {
        setFormData(initialForm);
    }
    setAiError("");
}, [isOpen, mode, topic]);

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

  const [aiSuccess, setAiSuccess] = useState("");

  const handleGenerateAITopic = async () => {
    setAiLoading(true);
    setAiError("");
    setAiSuccess("");
    try {
      const generated = await debateTopicService.generateAITopic({
        category: formData.category,
        difficulty_level: formData.difficulty_level,
        debate_format: formData.debate_format,
      });

      if (generated && generated.title) {
        const cleanTitle = generated.title
          .replace(/\s*[\(\[\{]?\s*(?:Ref|Reference|Seed)\s*#?\s*\d+\s*[\)\]\}]?/gi, "")
          .replace(/\s+([?\!.,])/g, "$1")
          .trim();
        const cleanGoal = (generated.learning_goal || "")
          .replace(/\s*[\(\[\{]?\s*(?:Ref|Reference|Seed)\s*#?\s*\d+\s*[\)\]\}]?/gi, "")
          .replace(/\s+([?\!.,])/g, "$1")
          .trim();

        setFormData((prev) => ({
          ...prev,
          title: cleanTitle,
          category: generated.category || prev.category,
          difficulty_level: generated.difficulty_level || prev.difficulty_level,
          debate_format: generated.debate_format || prev.debate_format,
          estimated_duration: generated.estimated_duration || prev.estimated_duration || 20,
          learning_goal: cleanGoal || prev.learning_goal || "",
        }));
        setAiSuccess("✨ New topic generated successfully! Review or edit below before saving.");
        setTimeout(() => setAiSuccess(""), 4000);
      }
    } catch (err) {
      console.error("AI Topic Generation error:", err);
      setAiError("AI topic generation failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
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
          <h2>
              {mode === "edit"
                  ? "Edit Debate Topic"
                  : "Create Debate Topic"}
          </h2>

          <button
            type="button"
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
              maxLength={255}
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

          {/* AI Topic Generator - Only for Create */}
          {mode === "create" && (
            <div className="ai-topic-generator-card">
              <div className="ai-topic-generator-header">
                <div>
                  <h4 style={{ margin: 0, color: "#1d4ed8", fontSize: "15px", display: "flex", alignItems: "center", gap: "6px" }}>
                    ✨ AI Topic Generator
                  </h4>
                  <p style={{ margin: "4px 0 0 0", fontSize: "13px", color: "#4b5563" }}>
                    Autofill a high-quality debate topic based on your selected category and difficulty level.
                  </p>
                </div>
                <button
                  type="button"
                  className="generate-ai-btn"
                  onClick={handleGenerateAITopic}
                  disabled={aiLoading}
                >
                  {aiLoading ? "Generating..." : "Generate Topic with AI"}
                </button>
              </div>
              {aiSuccess && (
                <p className="ai-success-text" style={{ color: "#059669", fontSize: "13px", fontWeight: "600", marginTop: "8px" }}>
                  {aiSuccess}
                </p>
              )}
              {aiError && (
                <p className="ai-error-text" style={{ color: "#dc2626", fontSize: "12px", marginTop: "6px" }}>
                  {aiError}
                </p>
              )}
            </div>
          )}

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
                disabled={loading || aiLoading}
            >
                {loading
                    ? (mode === "edit" ? "Updating..." : "Creating...")
                    : (mode === "edit" ? "Update Topic" : "Create Topic")}
            </button>

          </div>

        </form>

      </div>
    </div>
  );
};

export default CreateTopicModal;