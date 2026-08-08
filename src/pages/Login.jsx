import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bot, Mail, Lock, UserCheck, ArrowRight, Sparkles, Shield, Cpu, Activity, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('Learner');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        await register(email, password, role);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'An unexpected error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '30px 20px',
        position: 'relative',
        zIndex: 1
      }}
    >
      <div
        className="login-container-grid"
        style={{
          width: '100%',
          maxWidth: '1100px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
          gap: '40px',
          alignItems: 'center'
        }}
      >
        {/* Left Hero Showcase - Hidden on Mobile via CSS */}
        <motion.div
          className="login-hero-showcase"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          style={{ paddingRight: '20px' }}
        >
          <div
            className="glass-pill active"
            style={{ marginBottom: '20px', display: 'inline-flex' }}
          >
            <Sparkles size={14} color="#06b6d4" />
            <span>Agentic AI Debate Coach v2.5</span>
          </div>

          <h1
            style={{
              fontSize: '3rem',
              fontWeight: '800',
              lineHeight: 1.1,
              letterSpacing: '-0.03em',
              color: '#f8fafc',
              marginBottom: '20px'
            }}
          >
            Agentic AI Debate Coach & <span className="gradient-text-primary">Presentation Analysis Platform</span>
          </h1>

          <p style={{ fontSize: '1.05rem', color: '#94a3b8', lineHeight: 1.6, marginBottom: '32px' }}>
            Train against Socratic & Machiavellian AI Debaters. Rehearse slide deck presentations with real-time audio visualizers, live pace gauges, and automated logical fallacy audits.
          </p>

          {/* Feature Highlights Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div
              className="glass-panel"
              style={{ padding: '16px 20px', borderRadius: '16px', backdropFilter: 'blur(16px)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <Cpu size={20} color="#06b6d4" />
                <span style={{ fontWeight: '700', fontSize: '0.92rem', color: '#f8fafc' }}>
                  Agentic Personalities
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Socrates, Machiavelli, Sagan & Churchill.
              </span>
            </div>

            <div
              className="glass-panel"
              style={{ padding: '16px 20px', borderRadius: '16px', backdropFilter: 'blur(16px)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <Activity size={20} color="#d946ef" />
                <span style={{ fontWeight: '700', fontSize: '0.92rem', color: '#f8fafc' }}>
                  Live Speech Telemetry
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Real-time WPM pace, fillers & audio spectrum.
              </span>
            </div>

            <div
              className="glass-panel"
              style={{ padding: '16px 20px', borderRadius: '16px', backdropFilter: 'blur(16px)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <Shield size={20} color="#10b981" />
                <span style={{ fontWeight: '700', fontSize: '0.92rem', color: '#f8fafc' }}>
                  Fallacy Defense Radar
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Detect strawman, ad hominem & false dilemmas.
              </span>
            </div>

            <div
              className="glass-panel"
              style={{ padding: '16px 20px', borderRadius: '16px', backdropFilter: 'blur(16px)' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                <Award size={20} color="#fbbf24" />
                <span style={{ fontWeight: '700', fontSize: '0.92rem', color: '#f8fafc' }}>
                  Gamified Mastery
                </span>
              </div>
              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                Arcade quizzes, badges & performance cards.
              </span>
            </div>
          </div>
        </motion.div>

        {/* Right Glassmorphic Auth Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div
            className="glass-panel login-glass-card pulse-glow"
            style={{
              padding: '44px 40px',
              borderRadius: '28px',
              background: 'rgba(15, 23, 42, 0.65)',
              border: '1px solid rgba(6, 182, 212, 0.25)'
            }}
          >
            {/* Header Logo */}
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #06b6d4, #d946ef)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 30px rgba(6, 182, 212, 0.4)',
                  marginBottom: '16px'
                }}
              >
                <Bot size={36} color="#020617" />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: '800', color: '#f8fafc', letterSpacing: '-0.02em' }}>
                {isRegister ? 'Create Neural Portal' : 'Authenticate Credentials'}
              </h2>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', marginTop: '4px' }}>
                {isRegister ? 'Sign up to unlock your personal AI debate coach' : 'Enter your credentials to access your debate dashboard'}
              </p>
            </div>

            {/* Mode Switcher Tabs */}
            <div
              style={{
                display: 'flex',
                background: 'rgba(2, 6, 23, 0.6)',
                borderRadius: '14px',
                padding: '4px',
                marginBottom: '28px',
                border: '1px solid rgba(255, 255, 255, 0.06)'
              }}
            >
              <button
                onClick={() => { setIsRegister(false); setError(''); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '10px',
                  background: !isRegister ? 'rgba(6, 182, 212, 0.2)' : 'transparent',
                  color: !isRegister ? '#06b6d4' : '#94a3b8',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                Sign In
              </button>
              <button
                onClick={() => { setIsRegister(true); setError(''); }}
                style={{
                  flex: 1,
                  padding: '10px',
                  border: 'none',
                  borderRadius: '10px',
                  background: isRegister ? 'rgba(217, 70, 239, 0.2)' : 'transparent',
                  color: isRegister ? '#d946ef' : '#94a3b8',
                  fontWeight: '700',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  transition: 'all 0.25s ease'
                }}
              >
                Register
              </button>
            </div>

            {/* Error Notification */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(244, 63, 94, 0.12)',
                  border: '1px solid rgba(244, 63, 94, 0.3)',
                  color: '#f43f5e',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  fontSize: '0.88rem',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Shield size={18} />
                <span>{error}</span>
              </motion.div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Mail size={14} color="#06b6d4" />
                  <span>Email Address</span>
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="orator@arena.ai"
                />
              </div>

              <div>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                  <Lock size={14} color="#d946ef" />
                  <span>Security Password</span>
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                />
              </div>

              {isRegister && (
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', fontWeight: '700', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                    <UserCheck size={14} color="#10b981" />
                    <span>Arena Persona Role</span>
                  </label>
                  <select value={role} onChange={(e) => setRole(e.target.value)}>
                    <option value="Learner">Learner (Debater)</option>
                    <option value="Debate Coach">Debate Coach</option>
                    <option value="Educator">Educator</option>
                    <option value="Administrator">Administrator</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="btn-primary"
                disabled={loading}
                style={{ width: '100%', height: '52px', marginTop: '10px' }}
              >
                {loading ? (
                  <span className="spinner"></span>
                ) : (
                  <>
                    <span>{isRegister ? 'Initialize Agent Access' : 'Authenticate Session'}</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
