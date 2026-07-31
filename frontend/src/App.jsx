import React, { useState } from 'react';
import { useAuth } from './context/AuthContext';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Chatbot } from './components/common/Chatbot';

export function App() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState('login'); // 'login' | 'register'

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400 font-semibold text-sm">
        Initializing AI Debate Coach Workspace...
      </div>
    );
  }

  if (user) {
    return (
      <>
        <Dashboard />
        <Chatbot />
      </>
    );
  }

  if (page === 'register') {
    return <Register onNavigateLogin={() => setPage('login')} />;
  }

  return <Login onNavigateRegister={() => setPage('register')} />;
}

export default App;
