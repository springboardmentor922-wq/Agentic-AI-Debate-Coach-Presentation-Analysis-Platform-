import { useEffect, useState } from "react";
import api from "../../services/api";

function AdminProfile() {
  const [profile, setProfile] = useState({
    college: "",
    department: "",
    year: "",
    language: "",
    experience: "",
  });

  const [profileExists, setProfileExists] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await api.get("/profile/");

      setProfile(response.data);
      setProfileExists(true);
    } catch (error) {
      console.log("No profile found.");
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (profileExists) {
        await api.put("/profile/", profile);
        alert("Profile Updated Successfully!");
      } else {
        await api.post("/profile/", profile);
        alert("Profile Created Successfully!");
        setProfileExists(true);
      }
    } catch (error) {
      console.error(error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="p-8">
      <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">

        <h1 className="text-3xl font-bold text-green-700">
          Administrator Profile
        </h1>

        <p className="text-gray-500 mb-8">
          Complete your administrator profile
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label>Organization</label>
            <input
              type="text"
              name="college"
              value={profile.college}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 mt-2"
            />
          </div>

          <div>
            <label>Designation</label>
            <input
              type="text"
              name="department"
              value={profile.department}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 mt-2"
            />
          </div>

          <div>
            <label>Working Year</label>
            <input
              type="text"
              name="year"
              value={profile.year}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 mt-2"
            />
          </div>

          <div>
            <label>Preferred Language</label>
            <input
              type="text"
              name="language"
              value={profile.language}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 mt-2"
            />
          </div>

          <div>
            <label>Experience</label>
            <textarea
              name="experience"
              rows="4"
              value={profile.experience}
              onChange={handleChange}
              className="w-full border rounded-lg p-3 mt-2"
            />
          </div>

          <button
            className="bg-green-700 hover:bg-green-800 text-white px-8 py-3 rounded-lg"
          >
            {profileExists ? "Update Profile" : "Save Profile"}
          </button>

        </form>

      </div>
    </div>
  );
}

export default AdminProfile;