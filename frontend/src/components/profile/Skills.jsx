import { useState } from "react";
import toast from "react-hot-toast";
import { updateProfile } from "../../services/profileService";

const skillOptions = [
  "Public Speaking",
  "Communication",
  "Leadership",
  "Critical Thinking",
  "Argumentation",
  "Programming",
];

function Skills({ profile }) {
  const [selectedSkills, setSelectedSkills] = useState(
    profile?.skills || []
  );

  const [saving, setSaving] = useState(false);

  const handleCheckbox = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      await updateProfile({
        skills: selectedSkills,
      });

      toast.success("Skills updated successfully!");
    } catch (err) {
      toast.error("Failed to update skills.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="profile-card">

      <h2>Skills</h2>

      <p className="section-description">
        Select your current skills.
      </p>

      <form onSubmit={handleSubmit}>

        {skillOptions.map((skill) => (
          <div className="form-group" key={skill}>

            <label>

              <input
                type="checkbox"
                checked={selectedSkills.includes(skill)}
                onChange={() => handleCheckbox(skill)}
              />

              {" "}
              {skill}

            </label>

          </div>
        ))}

        <button
          className="save-btn"
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Skills"}
        </button>

      </form>

    </div>
  );
}

export default Skills;