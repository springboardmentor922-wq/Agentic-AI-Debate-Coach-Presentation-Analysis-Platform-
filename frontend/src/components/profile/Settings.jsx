import { useState } from "react";
import toast from "react-hot-toast";

function Settings() {

    const [notifications, setNotifications] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [language, setLanguage] = useState("English");

    const handleSave = () => {
        toast.success("Settings saved successfully!");
    };

    return (

        <div className="profile-card">

            <h2>Settings</h2>

            <p className="section-description">
                Customize your application preferences.
            </p>

            <div className="form-group">

                <label>
                    <input
                        type="checkbox"
                        checked={notifications}
                        onChange={() => setNotifications(!notifications)}
                    />

                    Enable Notifications

                </label>

            </div>

            <div className="form-group">

                <label>

                    <input
                        type="checkbox"
                        checked={darkMode}
                        onChange={() => setDarkMode(!darkMode)}
                    />

                    Dark Mode

                </label>

            </div>

            <div className="form-group">

                <label>
                    Language
                </label>

                <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                >
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Telugu</option>
                </select>

            </div>

            <button
                className="save-btn"
                onClick={handleSave}
            >
                Save Settings
            </button>

        </div>

    );

}

export default Settings;