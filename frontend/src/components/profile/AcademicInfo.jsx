import { useState } from "react";
import toast from "react-hot-toast";
import {
  FaUniversity,
  FaCodeBranch,
  FaCalendarAlt,
  FaGraduationCap,
  FaLayerGroup,
} from "react-icons/fa";

import { updateProfile } from "../../services/profileService";

function AcademicInfo({ profile }) {
  const [formData, setFormData] = useState({
    college: profile?.college || "",
    branch: profile?.branch || "",
    graduation_year: profile?.graduation_year || "",
    cgpa: profile?.cgpa || "",
    experience_level: profile?.experience_level || "",
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

      await updateProfile(formData);

      toast.success("Academic information updated!");
    } catch (err) {
      toast.error("Failed to update.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-card">

      <h2>Academic Information</h2>

      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>
            <FaUniversity /> College
          </label>

          <input
            type="text"
            name="college"
            value={formData.college}
            onChange={handleChange}
            placeholder="Enter College Name"
          />
        </div>

        <div className="form-group">
          <label>
            <FaCodeBranch /> Branch
          </label>

          <input
            type="text"
            name="branch"
            value={formData.branch}
            onChange={handleChange}
            placeholder="Computer Science Engineering"
          />
        </div>

        <div className="form-group">
          <label>
            <FaCalendarAlt /> Graduation Year
          </label>

          <input
            type="number"
            name="graduation_year"
            value={formData.graduation_year}
            onChange={handleChange}
            placeholder="2028"
          />
        </div>

        <div className="form-group">
          <label>
            <FaGraduationCap /> CGPA
          </label>

          <input
            type="text"
            name="cgpa"
            value={formData.cgpa}
            onChange={handleChange}
            placeholder="9.36"
          />
        </div>

        <div className="form-group">
          <label>
            <FaLayerGroup /> Experience Level
          </label>

          <select
            name="experience_level"
            value={formData.experience_level}
            onChange={handleChange}
          >
            <option value="">Select</option>
            <option>Beginner</option>
            <option>Intermediate</option>
            <option>Advanced</option>
          </select>
        </div>

        <button className="save-btn" disabled={saving}>
          {saving ? "Saving..." : "Save Academic Details"}
        </button>

      </form>
    </div>
  );
}

export default AcademicInfo;