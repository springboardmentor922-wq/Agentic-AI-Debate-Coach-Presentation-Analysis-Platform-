import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AnimatePresence, motion } from 'framer-motion';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SpeechStudio from './pages/SpeechStudio';
import DebateRoom from './pages/DebateRoom';
import ProfileSettings from './pages/ProfileSettings';
import FallacyLab from './pages/FallacyLab';

import ParticleCanvas from './components/ParticleCanvas';
import Navbar from './components/Navbar';
import FloatingAIChatbot from './components/FloatingAIChatbot';

// Route guard helper for authenticated pages
const ProtectedRoute = ({ children }) => {
  const { token, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner}></div>
      </div>
    );
  }
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <>
      <Navbar />
      <main style={{ position: 'relative', zIndex: 1, minHeight: 'calc(100vh - 74px)', paddingBottom: '60px' }}>
        {children}
      </main>
      <FloatingAIChatbot />
    </>
  );
};

// Route guard to prevent authenticated users from visiting the login screen
const GuestRoute = ({ children }) => {
  const { token, user, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner}></div>
      </div>
    );
  }
  
  if (token && user) {
    return <Navigate to="/" replace />;
  }
  
  return <main style={{ position: 'relative', zIndex: 1 }}>{children}</main>;
};

function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route 
          path="/login" 
          element={
            <GuestRoute>
              <PageTransitionWrapper>
                <Login />
              </PageTransitionWrapper>
            </GuestRoute>
          } 
        />
        <Route 
          path="/" 
          element={
            <ProtectedRoute>
              <PageTransitionWrapper>
                <Dashboard />
              </PageTransitionWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/speech" 
          element={
            <ProtectedRoute>
              <PageTransitionWrapper>
                <SpeechStudio />
              </PageTransitionWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/debate" 
          element={
            <ProtectedRoute>
              <PageTransitionWrapper>
                <DebateRoom />
              </PageTransitionWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <ProtectedRoute>
              <PageTransitionWrapper>
                <ProfileSettings />
              </PageTransitionWrapper>
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/fallacy-lab" 
          element={
            <ProtectedRoute>
              <PageTransitionWrapper>
                <FallacyLab />
              </PageTransitionWrapper>
            </ProtectedRoute>
          } 
        />
        
        {/* Wildcard Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

function PageTransitionWrapper({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught UI Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#020617',
          color: '#f8fafc',
          padding: '24px',
          textAlign: 'center'
        }}>
          <div style={{
            background: '#0f172a',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '560px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.8)'
          }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#06b6d4', marginBottom: '12px' }}>
              ⚡ Workspace Online & Recovered
            </h2>
            <p style={{ fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '20px' }}>
              {this.state.error?.message || 'An unexpected rendering state occurred. Click below to reload your dashboard workspace.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              style={{
                background: 'linear-gradient(135deg, #06b6d4, #3b82f6)',
                color: '#fff',
                border: 'none',
                padding: '10px 24px',
                borderRadius: '12px',
                fontWeight: '800',
                fontSize: '0.85rem',
                cursor: 'pointer'
              }}
            >
              🔄 Refresh Dashboard Workspace
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function AppContent() {
  return (
    <Router>
      <ParticleCanvas />
      <AnimatedRoutes />
    </Router>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ErrorBoundary>
  );
}

const styles = {
  centered: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#020617',
    position: 'relative',
    zIndex: 10
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '3px solid rgba(6, 182, 212, 0.15)',
    borderTopColor: '#06b6d4',
    borderRadius: '50%',
    animation: 'spin 0.9s linear infinite',
    boxShadow: '0 0 25px rgba(6, 182, 212, 0.3)'
  }
};
