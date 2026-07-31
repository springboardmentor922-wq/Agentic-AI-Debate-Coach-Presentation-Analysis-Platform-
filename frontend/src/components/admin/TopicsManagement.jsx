import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { BookOpen, Plus, Trash2, Tag } from 'lucide-react';

export const TopicsManagement = () => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Technology & AI');
  const [difficulty, setDifficulty] = useState('Intermediate');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    setLoading(true);
    try {
      const data = await api.getTopics();
      if (Array.isArray(data)) setTopics(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = async (e) => {
    e.preventDefault();
    if (!title) {
      alert("Please enter a topic title.");
      return;
    }

    setSubmitting(true);
    try {
      const createdBy = localStorage.getItem('username') || 'Admin';
      const res = await api.createTopic({
        title,
        category,
        difficulty,
        created_by: createdBy
      });

      if (res.success) {
        alert("Topic added to catalog!");
        setTitle('');
        loadTopics();
      } else {
        alert(res.message || "Failed to add topic.");
      }
    } catch (err) {
      alert("Server communication error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTopic = async (topicId) => {
    if (!confirm("Remove this topic from catalog?")) return;
    try {
      const res = await api.deleteTopic(topicId);
      alert(res.message);
      loadTopics();
    } catch (err) {
      alert("Error deleting topic.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold gradient-text">Debate Topics Catalog</h2>
        <p className="text-slate-400 text-sm">Add structured debate prompts for student practice sessions.</p>
      </div>

      {/* Add Topic Form */}
      <div className="glass-card p-6 border-indigo-500/30">
        <h3 className="font-display text-lg font-bold text-slate-100 mb-4 flex items-center gap-2">
          <Plus className="w-5 h-5 text-indigo-400" /> Add New Topic Prompt
        </h3>

        <form onSubmit={handleAddTopic} className="space-y-4">
          <div className="form-group">
            <label>Topic Prompt Title</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Universal basic income should be implemented globally"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label>Category</label>
              <select
                className="form-select"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              >
                <option value="Technology & AI">Technology & AI</option>
                <option value="Economics & Business">Economics & Business</option>
                <option value="Ethics & Philosophy">Ethics & Philosophy</option>
                <option value="Environment & Policy">Environment & Policy</option>
              </select>
            </div>

            <div className="form-group">
              <label>Difficulty Level</label>
              <select
                className="form-select"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary text-xs py-2.5">
            {submitting ? "Saving..." : "Add to Catalog"}
          </button>
        </form>
      </div>

      {/* Catalog List */}
      <div className="space-y-3">
        <h3 className="font-display text-lg font-bold text-slate-200">Existing Topics ({topics.length})</h3>

        {loading ? (
          <div className="glass-card p-8 text-center text-slate-400">Loading catalog...</div>
        ) : topics.length === 0 ? (
          <div className="glass-card p-8 text-center text-slate-400">No custom topics in catalog yet.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {topics.map((t) => (
              <div key={t._id} className="glass-card p-4 flex items-center justify-between">
                <div className="space-y-1">
                  <h4 className="font-bold text-slate-100">{t.title}</h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span className="flex items-center gap-1 text-indigo-400"><Tag className="w-3 h-3" /> {t.category}</span>
                    <span>Level: {t.difficulty}</span>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteTopic(t._id)}
                  className="btn-danger text-xs p-2"
                  title="Delete Topic"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
