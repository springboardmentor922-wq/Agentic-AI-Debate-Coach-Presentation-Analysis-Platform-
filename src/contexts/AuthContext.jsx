import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);

export const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const getStoredToken = () => {
  const t = localStorage.getItem('token');
  if (!t || t === 'undefined' || t === 'null' || !t.trim()) {
    localStorage.removeItem('token');
    return null;
  }
  return t;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(getStoredToken());
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const fetchUser = async () => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    try {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const userData = await res.json();
        try {
          const profileRes = await fetch(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (profileRes.ok) {
            const profileData = await profileRes.json();
            userData.name = profileData.name;
          }
        } catch (e) {
          console.error("Error loading user profile:", e);
        }

        if (!userData.name && userData.email) {
          const prefix = userData.email.split('@')[0];
          userData.name = prefix.charAt(0).toUpperCase() + prefix.slice(1);
        }

        setUser(userData);
      } else {
        logout();
      }
    } catch (err) {
      clearTimeout(timeoutId);
      console.error("Error fetching user session:", err);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || 'Login failed');
    }

    const data = await res.json();
    localStorage.setItem('token', data.access_token);
    localStorage.setItem('role', data.role);
    setToken(data.access_token);
    setRole(data.role);
    return data;
  };

  const register = async (email, password, role) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password, role })
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.detail || 'Registration failed');
    }

    // Auto login after registration
    return login(email, password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setToken(null);
    setRole(null);
    setUser(null);
    setLoading(false);
  };

  // Authenticated fetch wrapper helper
  const authFetch = async (endpoint, options = {}) => {
    const headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    if (!(options.body instanceof FormData) && options.body && typeof options.body === 'object') {
      headers['Content-Type'] = 'application/json';
      options.body = JSON.stringify(options.body);
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.detail || `Request failed with status ${res.status}`);
    }

    return res;
  };

  const updateUser = (newFields) => {
    setUser(prev => {
      const updated = { ...(prev || {}), ...newFields };
      try {
        localStorage.setItem('cached_user_profile', JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const value = {
    token,
    role,
    user,
    loading,
    login,
    register,
    logout,
    authFetch,
    fetchUser,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
