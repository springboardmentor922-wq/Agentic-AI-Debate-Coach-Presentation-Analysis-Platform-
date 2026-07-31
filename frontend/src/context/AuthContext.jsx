import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const username = localStorage.getItem('username');
    const fullname = localStorage.getItem('fullname');
    const email = localStorage.getItem('email');
    const role = localStorage.getItem('role');

    if (username && role) {
      setUser({ username, fullname: fullname || username, email: email || '', role });
    }
    setLoading(false);
  }, []);

  const loginUser = (userData) => {
    localStorage.setItem('username', userData.username || '');
    localStorage.setItem('fullname', userData.fullname || userData.username || '');
    localStorage.setItem('email', userData.email || '');
    localStorage.setItem('role', userData.role || 'Learner');

    setUser({
      username: userData.username || '',
      fullname: userData.fullname || userData.username || '',
      email: userData.email || '',
      role: userData.role || 'Learner'
    });
  };

  const logoutUser = () => {
    localStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
