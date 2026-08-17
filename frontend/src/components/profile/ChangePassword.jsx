import { useState } from "react";
import toast from "react-hot-toast";
import { FaLock } from "react-icons/fa";

function ChangePassword() {

    const [formData, setFormData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        toast.success("Password updated successfully!");
    };

    return (

        <div className="profile-card">

            <h2>Change Password</h2>

            <p className="section-description">
                Update your account password.
            </p>

            <form onSubmit={handleSubmit}>

                <div className="form-group">

                    <label>
                        <FaLock /> Current Password
                    </label>

                    <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleChange}
                        placeholder="Enter current password"
                    />

                </div>

                <div className="form-group">

                    <label>
                        <FaLock /> New Password
                    </label>

                    <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        placeholder="Enter new password"
                    />

                </div>

                <div className="form-group">

                    <label>
                        <FaLock /> Confirm Password
                    </label>

                    <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm new password"
                    />

                </div>

                <button className="save-btn">
                    Update Password
                </button>

            </form>

        </div>

    );

}

export default ChangePassword;