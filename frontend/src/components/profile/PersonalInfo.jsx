import { useState } from "react";
import toast from "react-hot-toast";
import { FaUser, FaEnvelope, FaGraduationCap, FaBullseye } from "react-icons/fa";

import { updateProfile } from "../../services/profileService";

function PersonalInfo({ profile, setProfile }) {

    const [formData, setFormData] = useState({
    full_name: profile.full_name || "",
    phone: profile.phone || "",
    about: profile.about || "",
    experience_level: profile.experience_level || "",
    learning_goal: profile.learning_goal || "",
});

    const [saving, setSaving] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {

            setSaving(true);

            const updatedProfile = await updateProfile(formData);

            setProfile(updatedProfile);

            toast.success("Profile updated successfully!");

        } catch (error) {

            console.error(error);

            toast.error("Failed to update profile.");

        } finally {

            setSaving(false);

        }
    };

    return (

        <div className="profile-card">

            <h2>Personal Information</h2>

            <p className="section-description">
                Keep your personal information up to date.
            </p>

            <form onSubmit={handleSubmit}>

                <div className="form-group">

                    <label>
                        <FaUser />
                        Full Name
                    </label>

                    <input
                        type="text"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                    />

                </div>

                <div className="form-group">

                    <label>
                        <FaEnvelope />
                        Email
                    </label>

                    <input
                        type="email"
                        value={profile.email}
                        disabled
                    />

                </div>

                <div className="form-group">

    <label>
        📞 Phone Number
    </label>

    <input
        type="text"
        name="phone"
        value={formData.phone}
        onChange={handleChange}
        placeholder="Enter phone number"
    />

</div>

<div className="form-group">

    <label>
        👤 About Me
    </label>

    <textarea
        rows="4"
        name="about"
        value={formData.about}
        onChange={handleChange}
        placeholder="Tell us something about yourself..."
    />

</div>

                <div className="form-group">

                    <label>
                        <FaGraduationCap />
                        Experience Level
                    </label>

                    <select
                        name="experience_level"
                        value={formData.experience_level}
                        onChange={handleChange}
                    >

                        <option value="">Select</option>

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

                <div className="form-group">

                    <label>
                        <FaBullseye />
                        Learning Goal
                    </label>

                    <textarea
                        rows="4"
                        name="learning_goal"
                        value={formData.learning_goal}
                        onChange={handleChange}
                        placeholder="What do you want to improve?"
                    />

                </div>

                <button
                    className="save-btn"
                    disabled={saving}
                >

                    {saving ? "Saving..." : "Save Changes"}

                </button>

            </form>

        </div>

    );

}

export default PersonalInfo;