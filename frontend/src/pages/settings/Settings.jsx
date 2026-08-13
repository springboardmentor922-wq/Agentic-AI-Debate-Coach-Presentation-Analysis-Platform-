import { useEffect, useState } from "react";
import { FaCog, FaUser, FaSlidersH, FaSave } from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import Breadcrumb from "../../components/common/Breadcrumb";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../context/ToastContext";
import { getMyProfile, updateMyProfile } from "../../services/profileService";

import "./Settings.css";

const Settings = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        full_name: "",
        email: "",
        learning_goals: "",
        preferred_topics: "",
        presentation_domains: "",
        coaching_preferences: "",
        email_notifications: true,
        ai_suggestions: true,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [validationError, setValidationError] = useState("");

    useEffect(() => {
        let active = true;

        const loadSettings = async () => {
            try {
                setLoading(true);
                const profile = await getMyProfile().catch(() => null);
                if (!active) return;
                setFormData({
                    full_name: profile?.user?.full_name || user?.full_name || "",
                    email: profile?.user?.email || user?.email || "",
                    learning_goals: profile?.learning_goals || "",
                    preferred_topics: profile?.preferred_debate_topics || "",
                    presentation_domains: profile?.presentation_domains || "",
                    coaching_preferences: profile?.coaching_preferences || "",
                    email_notifications: true,
                    ai_suggestions: true,
                });
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadSettings();
        return () => { active = false; };
    }, [user]);

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        setFormData((current) => ({
            ...current,
            [name]: type === "checkbox" ? checked : value,
        }));
        if (validationError) setValidationError("");
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!formData.full_name.trim()) {
            setValidationError("Full Name cannot be empty.");
            showToast("Full Name is required.", "error");
            return;
        }

        setSaving(true);
        setValidationError("");

        try {
            await updateMyProfile({
                full_name: formData.full_name.trim(),
                learning_goals: formData.learning_goals || null,
                preferred_debate_topics: formData.preferred_topics || null,
                presentation_domains: formData.presentation_domains || null,
                coaching_preferences: formData.coaching_preferences || null,
            });

            showToast("Settings updated successfully.", "success");
        } catch (error) {
            console.error(error);
            showToast("Unable to save settings right now.", "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <MainLayout>
                <div className="settings-page"><div className="empty-state">Loading settings...</div></div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="settings-page">
                <Breadcrumb items={[{ label: "Dashboard", path: "/learner/dashboard" }, { label: "Settings" }]} />

                <div className="settings-header">
                    <div>
                        <h1>Account Settings</h1>
                        <p>Manage learning goals, coaching configuration, and notification preferences.</p>
                    </div>
                    <div className="settings-icon"><FaCog /></div>
                </div>

                {validationError && <div className="empty-state error">{validationError}</div>}

                <form onSubmit={handleSave} className="settings-form">
                    <section className="settings-card">
                        <div className="card-section-header">
                            <FaUser /> <h2>Personal Profile</h2>
                        </div>
                        <div className="form-group-row">
                            <label>
                                Full Name
                                <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} required />
                            </label>
                            <label>
                                Email Address
                                <input type="email" name="email" value={formData.email} disabled />
                            </label>
                        </div>
                    </section>

                    <section className="settings-card">
                        <div className="card-section-header">
                            <FaSlidersH /> <h2>Coaching & AI Preferences</h2>
                        </div>
                        <label>
                            Learning Goals
                            <textarea name="learning_goals" value={formData.learning_goals} onChange={handleChange} placeholder="e.g. Master counterargument structure, improve fluency..." />
                        </label>
                        <label>
                            Preferred Debate Topics
                            <textarea name="preferred_topics" value={formData.preferred_topics} onChange={handleChange} placeholder="e.g. AI Ethics, Climate Policy, Economics..." />
                        </label>
                        <label>
                            Presentation Domains
                            <textarea name="presentation_domains" value={formData.presentation_domains} onChange={handleChange} placeholder="e.g. Technology, Education, International Relations..." />
                        </label>
                        <label>
                            Coaching Preferences
                            <textarea name="coaching_preferences" value={formData.coaching_preferences} onChange={handleChange} placeholder="e.g. Focus on logical fallacies, aggressive debate style..." />
                        </label>
                    </section>

                    <section className="settings-card">
                        <div className="card-section-header">
                            <FaCog /> <h2>Platform Notifications</h2>
                        </div>
                        <label className="checkbox-label">
                            <input type="checkbox" name="email_notifications" checked={formData.email_notifications} onChange={handleChange} />
                            Enable Session & Report Notifications
                        </label>
                        <label className="checkbox-label">
                            <input type="checkbox" name="ai_suggestions" checked={formData.ai_suggestions} onChange={handleChange} />
                            Enable Real-time AI Assistant Suggestions
                        </label>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary" disabled={saving}>
                                <FaSave /> {saving ? "Saving..." : "Save Settings"}
                            </button>
                        </div>
                    </section>
                </form>
            </div>
        </MainLayout>
    );
};

export default Settings;
