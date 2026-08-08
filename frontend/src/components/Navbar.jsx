import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Bot, 
  LayoutDashboard, 
  Mic, 
  Swords, 
  Zap, 
  User, 
  LogOut, 
  Volume2, 
  VolumeX, 
  Activity,
  Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/debate', label: 'Debate Arena', icon: Swords },
    { path: '/speech', label: 'Presentation & Speech', icon: Mic },
    { path: '/fallacy-lab', label: 'Fallacy Arcade', icon: Zap },
    { path: '/profile', label: 'AI Persona & Profile', icon: User }
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 100,
        background: 'rgba(2, 6, 23, 0.75)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        padding: '0 24px',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.8)'
      }}
    >
      <div
        style={{
          maxWidth: '1400px',
          margin: '0 auto',
          height: '74px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        {/* Brand Logo & Telemetry Status */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #06b6d4, #d946ef)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 20px rgba(6, 182, 212, 0.4)',
                position: 'relative'
              }}
            >
              <Bot size={24} color="#020617" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span 
                  style={{ 
                    fontFamily: 'var(--font-title)', 
                    fontSize: '1.25rem', 
                    fontWeight: '800', 
                    letterSpacing: '-0.02em',
                    color: '#f8fafc' 
                  }}
                >
                  DEBATE<span className="gradient-text-primary">AI</span>
                </span>
                <span 
                  style={{
                    fontSize: '0.65rem',
                    background: 'rgba(6, 182, 212, 0.15)',
                    color: '#06b6d4',
                    border: '1px solid rgba(6, 182, 212, 0.3)',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontWeight: '700'
                  }}
                >
                  AGENTIC v2.5
                </span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', marginTop: '-2px' }}>
                Neural Coach & Speech Analysis
              </span>
            </div>
          </Link>

          {/* Agent Status Chip */}
          <div
            className="glass-pill"
            style={{ display: 'none' }}
          >
            <Activity size={14} color="#10b981" />
            <span style={{ fontSize: '0.75rem', color: '#e2e8f0', fontWeight: '600' }}>
              Engine: <span style={{ color: '#10b981' }}>ONLINE</span>
            </span>
          </div>
        </div>

        {/* Center Animated Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                style={{
                  position: 'relative',
                  padding: '10px 18px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: isActive ? '#f8fafc' : '#94a3b8',
                  fontSize: '0.9rem',
                  fontWeight: isActive ? '700' : '500',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.25s ease'
                }}
              >
                <Icon size={18} color={isActive ? '#06b6d4' : '#94a3b8'} />
                <span>{item.label}</span>

                {/* Animated Selection Pill indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    style={{
                      position: 'absolute',
                      inset: 0,
                      borderRadius: '12px',
                      background: 'rgba(6, 182, 212, 0.12)',
                      border: '1px solid rgba(6, 182, 212, 0.3)',
                      zIndex: -1
                    }}
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Right Actions & Profile Menu */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Sound Toggle Button */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={{
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: soundEnabled ? '#06b6d4' : '#64748b',
              padding: '10px',
              borderRadius: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s ease'
            }}
            title={soundEnabled ? 'Mute Interface SFX' : 'Enable Interface SFX'}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>

          {/* User Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              style={{
                background: 'rgba(15, 23, 42, 0.7)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                padding: '6px 14px 6px 8px',
                borderRadius: '99px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #d946ef, #06b6d4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '700',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              >
                {user?.name ? user.name[0].toUpperCase() : (user?.email ? user.email[0].toUpperCase() : 'U')}
              </div>
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#f8fafc', display: 'block', lineHeight: 1.1 }}>
                  {user?.name || (user?.email ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1) : 'Debater')}
                </span>
                <span style={{ fontSize: '0.68rem', color: '#06b6d4', fontWeight: '700', textTransform: 'uppercase' }}>
                  {user?.role || 'Learner'}
                </span>
              </div>
            </button>

            {/* Profile Dropdown Drawer */}
            {showProfileMenu && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '52px',
                  width: '230px',
                  background: 'rgba(15, 23, 42, 0.95)',
                  backdropFilter: 'blur(25px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '16px',
                  padding: '12px',
                  boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                  zIndex: 200
                }}
              >
                <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', marginBottom: '8px' }}>
                  <p style={{ fontSize: '0.78rem', color: '#94a3b8' }}>Signed in as</p>
                  <p style={{ fontSize: '0.88rem', fontWeight: '700', color: '#f8fafc', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {user?.email || 'user@example.com'}
                  </p>
                </div>

                <Link
                  to="/profile"
                  onClick={() => setShowProfileMenu(false)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    color: '#e2e8f0',
                    textDecoration: 'none',
                    fontSize: '0.88rem',
                    fontWeight: '500',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <User size={16} color="#06b6d4" />
                  <span>Profile & AI Coach Tuner</span>
                </Link>

                <button
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    color: '#f43f5e',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    marginTop: '4px',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(244, 63, 94, 0.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
