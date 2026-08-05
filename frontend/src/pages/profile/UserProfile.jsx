import "./UserProfile.css";

import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../../hooks/useAuth";
import MainLayout from "../../components/layout/MainLayout";
import {
    createProfile,
    getMyProfile,
    updateMyProfile,
} from "../../services/profileService";

import {
    FaCamera,
    FaCalendarAlt,
    FaUserTag,
    FaBullseye,
    FaStar,
} from "react-icons/fa";

const emptyForm = {
    full_name: "",
    email: "",
    phone_number: "",
    gender: "",
    date_of_birth: "",
    bio: "",
    institution: "",
    location: "",
    experience_level: "",
    learning_goals: "",
    preferred_topics: "",
    presentation_domains: "",
    coaching_preferences: "",
};

const UserProfile = () => {
    const { user } = useAuth();

    const [profile, setProfile] = useState(null);
    const [formData, setFormData] = useState(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");
    const [error, setError] = useState("");

    const fetchProfile = useCallback(async () => {
        try {
            setLoading(true);
            const response = await getMyProfile();
            setProfile(response);
            setFormData({
                full_name: response.full_name || "",
                email: response.email || "",
                phone_number: response.phone_number || "",
                gender: response.gender || "",
                date_of_birth: response.date_of_birth || "",
                bio: response.bio || "",
                institution: response.institution || "",
                location: response.location || "",
                experience_level: response.experience_level || "",
                learning_goals: response.learning_goals || "",
                preferred_topics: response.preferred_debate_topics || "",
                presentation_domains: response.presentation_domains || "",
                coaching_preferences: response.coaching_preferences || "",
            });
            setError("");
        } catch (fetchError) {
            console.error(fetchError);
            setError("Unable to load profile.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        void fetchProfile();
    }, [fetchProfile]);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const buildPayload = () => ({
        ...formData,
        full_name: formData.full_name || user?.full_name || null,
        email: formData.email || user?.email || null,
        phone_number: formData.phone_number || null,
        gender: formData.gender || null,
        date_of_birth: formData.date_of_birth || null,
        bio: formData.bio || null,
        institution: formData.institution || null,
        location: formData.location || null,
        experience_level: formData.experience_level || "Beginner",
        learning_goals: formData.learning_goals || null,
        preferred_debate_topics: formData.preferred_topics || null,
        presentation_domains: formData.presentation_domains || null,
        coaching_preferences: formData.coaching_preferences || null,
    });

    const handleSave = async () => {
        try {
            setSaving(true);
            setSuccessMessage("");
            setError("");

            const payload = buildPayload();

            if (profile?.id) {
                await updateMyProfile(payload);
            } else {
                await createProfile(payload);
            }

            setSuccessMessage("Profile updated successfully.");
            await fetchProfile();
        } catch (saveError) {
            console.error(saveError);
            setError("Unable to save profile.");
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        void fetchProfile();
    };

    const initial = (formData.full_name || user?.full_name || "G").charAt(0).toUpperCase();

    if (loading) {
        return (
            <MainLayout>
                <div className="profile-loading">Loading profile...</div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="profile-page-header">
                <div>
                    <h1>My Profile</h1>
                    <p>Dashboard &gt; My Profile</p>
                </div>

                <div className="profile-header-buttons">
                    <button className="cancel-btn" onClick={handleCancel}>
                        Cancel
                    </button>
                    <button className="save-btn" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </div>

            {successMessage && <div className="success-message">{successMessage}</div>}
            {error && <div className="error-message">{error}</div>}

            <div className="profile-summary-card">
                <div className="profile-avatar-section">
                    <div className="avatar-wrapper">
                        <div className="profile-avatar">{initial}</div>
                        <button className="camera-btn" type="button">
                            <FaCamera />
                        </button>
                    </div>
                </div>

                <div className="profile-basic-info">
                    <h2>{formData.full_name || user?.full_name}</h2>
                    <p>{formData.email || user?.email}</p>
                    <div className="profile-meta">
                        <span>
                            <FaCalendarAlt />
                            {" "}
                            Joined:{" "}
                            {profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : "--"}
                        </span>
                        <span>
                            <FaUserTag />
                            {" "}
                            {user?.role}
                        </span>
                    </div>
                </div>

                <div className="profile-progress">
                    <div className="progress-header">
                        <FaBullseye />
                        <span>Profile Completion</span>
                    </div>
                    <div className="progress-bar">
                        <div className="progress-fill" style={{ width: "75%" }} />
                    </div>
                    <span>75%</span>
                </div>

                <div className="profile-level">
                    <FaStar />
                    <h4>Experience Level</h4>
                    <p>{formData.experience_level || "Beginner"}</p>
                </div>
            </div>

            <div className="profile-details-grid">
                <section className="profile-card">
                    <h3>Personal Details</h3>
                    <div className="profile-form-grid">
                        <label>
                            Full Name
                            <input name="full_name" value={formData.full_name} onChange={handleChange} />
                        </label>
                        <label>
                            Email
                            <input name="email" type="email" value={formData.email} onChange={handleChange} />
                        </label>
                        <label>
                            Phone Number
                            <input name="phone_number" value={formData.phone_number} onChange={handleChange} />
                        </label>
                        <label>
                            Gender
                            <input name="gender" value={formData.gender} onChange={handleChange} />
                        </label>
                        <label>
                            Date of Birth
                            <input name="date_of_birth" type="date" value={formData.date_of_birth || ""} onChange={handleChange} />
                        </label>
                        <label>
                            Institution
                            <input name="institution" value={formData.institution} onChange={handleChange} />
                        </label>
                    </div>
                </section>

                <section className="profile-card">
                    <h3>Coaching Profile</h3>
                    <div className="profile-form-grid">
                        <label>
                            Location
                            <input name="location" value={formData.location} onChange={handleChange} />
                        </label>
                        <label>
                            Experience Level
                            <input name="experience_level" value={formData.experience_level} onChange={handleChange} />
                        </label>
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
                    </div>
                </section>
            </div>

            <section className="profile-card">
                <h3>Biography</h3>
                <textarea name="bio" value={formData.bio} onChange={handleChange} rows={6} />
            </section>
        </MainLayout>
    );
};

export default UserProfile;
