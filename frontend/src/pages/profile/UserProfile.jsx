import "./UserProfile.css";

import { useEffect, useState } from "react";

import axios from "axios";

import { useAuth } from "../../context/AuthContext";

import MainLayout from "../../components/layout/MainLayout";

import {

    FaUserCircle,

    FaCamera,

    FaCalendarAlt,

    FaUserTag,

    FaBullseye,

    FaStar

} from "react-icons/fa";

const UserProfile = () => {

    const { user } = useAuth();

    // =====================================================
    // States
    // =====================================================

    const [profile, setProfile] = useState(null);

    const [loading, setLoading] = useState(true);

    const [saving, setSaving] = useState(false);

    const [successMessage, setSuccessMessage] = useState("");

    const [error, setError] = useState("");

    // =====================================================
    // Form State
    // =====================================================

    const [formData, setFormData] = useState({

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

        coaching_preferences: ""

    });

    // =====================================================
    // Load Profile
    // =====================================================

    useEffect(() => {

        fetchProfile();

    }, []);

    // =====================================================
    // Fetch Profile
    // =====================================================

    const fetchProfile = async () => {

        try {

            setLoading(true);

            const token = localStorage.getItem("access_token");

            const response = await axios.get(

                "http://127.0.0.1:8000/profile/me",

                {

                    headers: {

                        Authorization: `Bearer ${token}`

                    }

                }

            );

            setProfile(response.data);

            setFormData({

                full_name: response.data.full_name || "",

                email: response.data.email || "",

                phone_number: response.data.phone_number || "",

                gender: response.data.gender || "",

                date_of_birth: response.data.date_of_birth || "",

                bio: response.data.bio || "",

                institution: response.data.institution || "",

                location: response.data.location || "",

                experience_level: response.data.experience_level || "",

                learning_goals: response.data.learning_goals || "",

                preferred_topics: response.data.preferred_topics || "",

                presentation_domains: response.data.presentation_domains || "",

                coaching_preferences: response.data.coaching_preferences || ""

            });

        }

        catch (err) {
            console.error("PROFILE ERROR:", err);

            if (err.response) {
                console.log("Status:", err.response.status);
                console.log("Data:", err.response.data);
            }

            setError(
                err.response?.data?.detail ||
                "Unable to load profile."
            );
        }
        finally {

            setLoading(false);

        }

    };

    // =====================================================
    // Handle Input Change
    // =====================================================

    const handleChange = (e) => {

        const { name, value } = e.target;

        setFormData((prev) => ({

            ...prev,

            [name]: value

        }));

    };

    // =====================================================
    // Save Profile
    // =====================================================

    const handleSave = async () => {

        try {

            setSaving(true);

            setSuccessMessage("");

            const token = localStorage.getItem("access_token");

            const payload = {

                ...formData,

                phone_number: formData.phone_number || null,

                institution: formData.institution || null,

                location: formData.location || null,

                gender: formData.gender || null,

                bio: formData.bio || null,

                learning_goals: formData.learning_goals || null,

                preferred_topics: formData.preferred_topics || null,

                presentation_domains: formData.presentation_domains || null,

                coaching_preferences: formData.coaching_preferences || null,

                date_of_birth: formData.date_of_birth || null,

                experience_level:
                    formData.experience_level || "Beginner",

            };

            if (profile?.id) {

                await axios.put(

                    "http://127.0.0.1:8000/profile/me",

                    payload,

                    {

                        headers: {

                            Authorization: `Bearer ${token}`

                        }

                    }

                );

            }

            else {

                await axios.post(

                    "http://127.0.0.1:8000/profile",

                    payload,

                    {

                        headers: {

                            Authorization: `Bearer ${token}`

                        }

                    }

                );

            }

            setSuccessMessage(

                "Profile updated successfully."

            );

            fetchProfile();

        }

        catch (err) {

            console.error(err);

            alert("Unable to save profile.");

        }

        finally {

            setSaving(false);

        }

    };

    // =====================================================
    // Cancel Changes
    // =====================================================

    const handleCancel = () => {

        fetchProfile();

    };

        // =====================================================
    // Loading State
    // =====================================================

    if (loading) {

        return (

            <MainLayout>

                <div className="profile-loading">

                    Loading Profile...

                </div>

            </MainLayout>

        );

    }

    return (

        <MainLayout>

            {/* ==========================================
                    Page Header
            ========================================== */}

            <div className="profile-page-header">

                <div>

                    <h1>

                        My Profile

                    </h1>

                    <p>

                        Dashboard &gt; My Profile

                    </p>

                </div>

                <div className="profile-header-buttons">

                    <button

                        className="cancel-btn"

                        onClick={handleCancel}

                    >

                        Cancel

                    </button>

                    <button

                        className="save-btn"

                        onClick={handleSave}

                        disabled={saving}

                    >

                        {

                            saving

                                ? "Saving..."

                                : "Save Changes"

                        }

                    </button>

                </div>

            </div>

            {

                successMessage && (

                    <div className="success-message">

                        {successMessage}

                    </div>

                )

            }

            {

                error && (

                    <div className="error-message">

                        {error}

                    </div>

                )

            }

            {/* ==========================================
                    Profile Summary Card
            ========================================== */}

            <div className="profile-summary-card">

                {/* Avatar */}

                <div className="profile-avatar-section">

                    <div className="avatar-wrapper">

                        <div className="profile-avatar">

                            {user?.full_name?.charAt(0).toUpperCase()}
                            
                        </div>

                        <button

                            className="camera-btn"

                        >

                            <FaCamera />

                        </button>

                    </div>

                </div>

                {/* Basic Information */}

                <div className="profile-basic-info">

                    <h2>

                        {formData.full_name || user?.full_name}

                    </h2>

                    <p>

                        {formData.email || user?.email}

                    </p>

                    <div className="profile-meta">

                        <span>

                            <FaCalendarAlt />

                            {" "}

                            Joined:

                            {" "}

                            {

                                profile?.created_at

                                    ? new Date(profile.created_at).toLocaleDateString()

                                    : "--"

                            }

                        </span>

                        <span>

                            <FaUserTag />

                            {" "}

                            {user?.role}

                        </span>

                    </div>

                </div>

                {/* Completion */}

                <div className="profile-progress">

                    <div className="progress-header">

                        <FaBullseye />

                        <span>

                            Profile Completion

                        </span>

                    </div>

                    <div className="progress-bar">

                        <div

                            className="progress-fill"

                            style={{

                                width: "75%"

                            }}

                        ></div>

                    </div>

                    <span>

                        75%

                    </span>

                </div>

                {/* Experience */}

                <div className="profile-level">

                    <FaStar />

                    <h4>

                        Experience Level

                    </h4>

                    <p>

                        {

                            formData.experience_level ||

                            "Beginner"

                        }

                    </p>

                </div>

            </div>

                        {/* ==========================================
                    Profile Content
            ========================================== */}

            <div className="profile-content">

                {/* ======================================
                        Left Side Form
                ====================================== */}

                <div className="profile-form-card">

                    <h2>

                        Personal Information

                    </h2>

                    <div className="form-grid">

                        <div className="form-group">

                            <label>Full Name</label>

                            <input

                                type="text"

                                name="full_name"

                                value={formData.full_name}

                                onChange={handleChange}

                            />

                        </div>

                        <div className="form-group">

                            <label>Email Address</label>

                            <input

                                type="email"

                                name="email"

                                value={formData.email}

                                onChange={handleChange}

                            />

                        </div>

                        <div className="form-group">

                            <label>Phone Number</label>

                            <input

                                type="text"

                                name="phone_number"

                                value={formData.phone_number}

                                onChange={handleChange}

                            />

                        </div>

                        <div className="form-group">

                            <label>Institution</label>

                            <input

                                type="text"

                                name="institution"

                                value={formData.institution}

                                onChange={handleChange}

                            />

                        </div>

                        <div className="form-group">

                            <label>Location</label>

                            <input

                                type="text"

                                name="location"

                                value={formData.location}

                                onChange={handleChange}

                            />

                        </div>

                        <div className="form-group">

                            <label>Date of Birth</label>

                            <input

                                type="date"

                                name="date_of_birth"

                                value={formData.date_of_birth}

                                onChange={handleChange}

                            />

                        </div>

                        <div className="form-group">

                            <label>Gender</label>

                            <select

                                name="gender"

                                value={formData.gender}

                                onChange={handleChange}

                            >

                                <option value="">

                                    Select Gender

                                </option>

                                <option value="Male">

                                    Male

                                </option>

                                <option value="Female">

                                    Female

                                </option>

                                <option value="Other">

                                    Other

                                </option>

                            </select>

                        </div>

                        <div className="form-group">

                            <label>

                                Experience Level

                            </label>

                            <select

                                name="experience_level"

                                value={formData.experience_level}

                                onChange={handleChange}

                            >

                                <option value="">

                                    Select Level

                                </option>

                                <option value="Beginner">

                                    Beginner

                                </option>

                                <option value="Intermediate">

                                    Intermediate

                                </option>

                                <option value="Advanced">

                                    Advanced

                                </option>

                            </select>

                        </div>

                        <div className="form-group full-width">

                            <label>

                                Bio

                            </label>

                            <textarea

                                rows="5"

                                name="bio"

                                value={formData.bio}

                                onChange={handleChange}

                                placeholder="Write something about yourself..."

                            />

                        </div>

                    </div>

                    {/* ======================================
                            Role Specific Information
                    ====================================== */}

                    {

                        user?.role === "Learner" && (

                            <>

                                <h2>

                                    Learner Information

                                </h2>

                                <div className="form-grid">

                                    <div className="form-group">

                                        <label>

                                            Learning Goals

                                        </label>

                                        <input

                                            type="text"

                                            name="learning_goals"

                                            value={formData.learning_goals}

                                            onChange={handleChange}

                                        />

                                    </div>

                                    <div className="form-group">

                                        <label>

                                            Preferred Debate Topics

                                        </label>

                                        <input

                                            type="text"

                                            name="preferred_topics"

                                            value={formData.preferred_topics}

                                            onChange={handleChange}

                                        />

                                    </div>

                                    <div className="form-group full-width">

                                        <label>

                                            Presentation Domains

                                        </label>

                                        <input

                                            type="text"

                                            name="presentation_domains"

                                            value={formData.presentation_domains}

                                            onChange={handleChange}

                                        />

                                    </div>

                                    <div className="form-group full-width">

                                        <label>

                                            Coaching Preferences

                                        </label>

                                        <textarea

                                            rows="4"

                                            name="coaching_preferences"

                                            value={formData.coaching_preferences}

                                            onChange={handleChange}

                                        />

                                    </div>

                                </div>

                            </>

                        )

                    }

                </div>

                {/* ======================================
                        Right Side Summary
                ====================================== */}

                <div className="profile-sidebar">

                    <div className="profile-info-card">

                        <h3>

                            Profile Summary

                        </h3>

                        <ul>

                            <li>

                                <strong>Name:</strong>

                                {formData.full_name}

                            </li>

                            <li>

                                <strong>Email:</strong>

                                {formData.email}

                            </li>

                            <li>

                                <strong>Role:</strong>

                                {user?.role}

                            </li>

                            <li>

                                <strong>Experience:</strong>

                                {

                                    formData.experience_level ||

                                    "Beginner"

                                }

                            </li>

                            <li>

                                <strong>Location:</strong>

                                {

                                    formData.location ||

                                    "Not Provided"

                                }

                            </li>

                        </ul>

                    </div>

                    <div className="profile-info-card">

                        <h3>

                            Profile Tips

                        </h3>

                        <ul>

                            <li>

                                ✔ Complete your profile information.

                            </li>

                            <li>

                                ✔ Add learning goals.

                            </li>

                            <li>

                                ✔ Select preferred debate topics.

                            </li>

                            <li>

                                ✔ Keep your profile updated.

                            </li>

                        </ul>

                    </div>

                </div>

            </div>

                    </MainLayout>

    );

};

export default UserProfile;


