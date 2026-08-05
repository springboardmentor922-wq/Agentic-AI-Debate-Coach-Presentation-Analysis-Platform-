import { useEffect, useState } from "react";
import { FaCog } from "react-icons/fa";

import MainLayout from "../../components/layout/MainLayout";
import Breadcrumb from "../../components/common/Breadcrumb";
import { useAuth } from "../../hooks/useAuth";
import { getMyProfile, updateMyProfile } from "../../services/profileService";

import "./Settings.css";

const Settings = () => {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        learning_goals: "",
        preferred_topics: "",
        presentation_domains: "",
        coaching_preferences: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        let active = true;

        const loadSettings = async () => {
            try {
                setLoading(true);
                const profile = await getMyProfile().catch(() => null);
                if (!active || !profile) return;
                setFormData({
                    learning_goals: profile.learning_goals || "",
                    preferred_topics: profile.preferred_debate_topics || "",
                    presentation_domains: profile.presentation_domains || "",
                    coaching_preferences: profile.coaching_preferences || "",
                });
            } finally {
                if (active) {
                    setLoading(false);
                }
            }
        };

        void loadSettings();
        return () => { active = false; };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({ ...current, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setMessage("");

        try {
            await updateMyProfile({
                learning_goals: formData.learning_goals || null,
                preferred_debate_topics: formData.preferred_topics || null,
                presentation_domains: formData.presentation_domains || null,
                coaching_preferences: formData.coaching_preferences || null,
                full_name: user?.full_name || null,
                email: user?.email || null,
            });

            setMessage("Settings updated successfully.");
        } catch (error) {
            console.error(error);
            setMessage("Unable to save settings.");
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
                        <h1>Settings</h1>
                        <p>Manage learning preferences and coaching configuration.</p>
                    </div>
                    <div className="settings-icon"><FaCog /></div>
                </div>

                {message && <div className="success-message">{message}</div>}

                <section className="settings-card">
                    <label>
                        Learning Goals
                        <textarea name="learning_goals" value={formData.learning_goals} onChange={handleChange} />
                    </label>
                    <label>
                        Preferred Debate Topics
                        <textarea name="preferred_topics" value={formData.preferred_topics} onChange={handleChange} />
                    </label>
                    <label>
                        Presentation Domains
                        <textarea name="presentation_domains" value={formData.presentation_domains} onChange={handleChange} />
                    </label>
                    <label>
                        Coaching Preferences
                        <textarea name="coaching_preferences" value={formData.coaching_preferences} onChange={handleChange} />
                    </label>

                    <button type="button" className="btn-primary" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Settings"}
                    </button>
                </section>
            </div>
        </MainLayout>
    );
};

export default Settings;
