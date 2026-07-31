import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { api } from '../../services/api';

export const CreateUserModal = ({ isOpen, onClose, onCreated }) => {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Learner');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullname || !email || !username || !password || !role) {
      alert("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.adminCreateUser({
        fullname,
        email,
        username,
        password,
        role,
        status: 'Active'
      });

      if (res.success) {
        alert("User account created successfully!");
        setFullname('');
        setEmail('');
        setUsername('');
        setPassword('');
        setRole('Learner');
        onCreated();
      } else {
        alert(res.message || "Failed to create user.");
      }
    } catch (err) {
      alert("Server communication error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Platform User">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. John Doe"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              className="form-input"
              placeholder="john@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>User ID / Username</label>
            <input
              type="text"
              className="form-input"
              placeholder="johndoe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Account Role</label>
            <select
              className="form-select"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="Learner">Learner</option>
              <option value="Debate Coach">Debate Coach</option>
              <option value="Educator">Educator</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
        </div>

        <button type="submit" disabled={loading} className="w-full btn-primary py-3 justify-center mt-2">
          {loading ? "Creating Account..." : "Create User Account"}
        </button>
      </form>
    </Modal>
  );
};
