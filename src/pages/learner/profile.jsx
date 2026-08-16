import { useState } from "react";
import api from "../../services/api";

function Profile() {
  const [profile, setProfile] = useState({
    college: "",
    department: "",
    year: "",
    language: "",
    experience: "",
  });

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
      await api.post("/profile/", profile);

      alert("Profile Saved Successfully!");
    } catch (error) {
      console.error(error);
      alert("Failed to save profile.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-10">

      <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">

        <h1 className="text-3xl font-bold text-green-700 mb-8">
          My Profile
        </h1>

        <form onSubmit={handleSave} className="space-y-6">

          <div>
            <label className="font-semibold">
              College
            </label>

            <input
              type="text"
              name="college"
              value={profile.college}
              onChange={handleChange}
              className="w-full mt-2 border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="font-semibold">
              Department
            </label>

            <input
              type="text"
              name="department"
              value={profile.department}
              onChange={handleChange}
              className="w-full mt-2 border rounded-lg p-3"
            />
          </div>

          <div>
            <label className="font-semibold">
              Year
            </label>

            <select
              name="year"
              value={profile.year}
              onChange={handleChange}
              className="w-full mt-2 border rounded-lg p-3"
            >
              <option value="">Select Year</option>
              <option>1st Year</option>
              <option>2nd Year</option>
              <option>3rd Year</option>
              <option>4th Year</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">
              Preferred Language
            </label>

            <select
              name="language"
              value={profile.language}
              onChange={handleChange}
              className="w-full mt-2 border rounded-lg p-3"
            >
              <option value="">Select Language</option>
              <option>English</option>
              <option>Telugu</option>
              <option>Hindi</option>
            </select>
          </div>

          <div>
            <label className="font-semibold">
              Experience Level
            </label>

            <select
              name="experience"
              value={profile.experience}
              onChange={handleChange}
              className="w-full mt-2 border rounded-lg p-3"
            >
              <option value="">Select Level</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold"
          >
            Save Profile
          </button>

        </form>

      </div>

    </div>
  );
}

export default Profile;