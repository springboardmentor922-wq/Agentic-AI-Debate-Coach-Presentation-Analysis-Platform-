import React from 'react';
import { Bot, Sparkles, Cpu, Volume2, ShieldAlert, Award } from 'lucide-react';

const AGENT_PROFILES = {
  Socrates: {
    name: 'Socrates',
    title: 'Socratic Inquirer & Dialectic Master',
    color: '#06b6d4',
    bgGlow: 'rgba(6, 182, 212, 0.25)',
    border: 'rgba(6, 182, 212, 0.4)',
    icon: Bot,
    motto: 'Questioning fundamental premises to uncover absolute truth.'
  },
  Machiavelli: {
    name: 'Machiavelli',
    title: 'Strategic Rhetorician & Pragmatist',
    color: '#d946ef',
    bgGlow: 'rgba(217, 70, 239, 0.25)',
    border: 'rgba(217, 70, 239, 0.4)',
    icon: ShieldAlert,
    motto: 'Focusing on strategic dominance, leverage, and persuasive force.'
  },
  'Carl Sagan': {
    name: 'Carl Sagan',
    title: 'Empirical Reasoner & Science Orator',
    color: '#10b981',
    bgGlow: 'rgba(16, 185, 129, 0.25)',
    border: 'rgba(16, 185, 129, 0.4)',
    icon: Sparkles,
    motto: 'Illuminating claims with empirical evidence and clear wonder.'
  },
  'Winston Churchill': {
    name: 'Winston Churchill',
    title: 'High-Impact Orator & Persuasion Strategist',
    color: '#f59e0b',
    bgGlow: 'rgba(245, 158, 11, 0.25)',
    border: 'rgba(245, 158, 11, 0.4)',
    icon: Award,
    motto: 'Rallying logic with resonant cadence and impassioned eloquence.'
  }
};

export default function AgentAvatar({ 
  persona = 'Socrates', 
  state = 'idle', // 'idle' | 'thinking' | 'speaking'
  size = 'md',
  showDetails = true 
}) {
  const profile = AGENT_PROFILES[persona] || AGENT_PROFILES.Socrates;
  const IconComponent = profile.icon;

  const sizeMap = {
    sm: { box: '48px', icon: 22, ring: '56px' },
    md: { box: '64px', icon: 30, ring: '76px' },
    lg: { box: '88px', icon: 40, ring: '104px' }
  };

  const dims = sizeMap[size] || sizeMap.md;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '16px' }}>
      {/* Avatar Halo Container */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {/* Pulsing Backlight Ring */}
        <div 
          style={{
            position: 'absolute',
            width: dims.ring,
            height: dims.ring,
            borderRadius: '50%',
            background: profile.bgGlow,
            filter: 'blur(12px)',
            animation: state === 'speaking' ? 'pulseRing 1.5s infinite' : 'pulseGlow 3s infinite',
            zIndex: 0
          }}
        />

        {/* Outer Tech Ring */}
        <div
          style={{
            width: dims.box,
            height: dims.box,
            borderRadius: '50%',
            background: 'rgba(15, 23, 42, 0.85)',
            border: `2px solid ${profile.border}`,
            boxShadow: `0 0 20px ${profile.bgGlow}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            zIndex: 1,
            transition: 'all 0.3s ease'
          }}
        >
          <IconComponent size={dims.icon} color={profile.color} />

          {/* Active Status Badge */}
          {state === 'speaking' && (
            <div
              style={{
                position: 'absolute',
                bottom: '-2px',
                right: '-2px',
                background: '#10b981',
                borderRadius: '50%',
                padding: '4px',
                border: '2px solid #020617',
                display: 'flex',
                boxShadow: '0 0 10px #10b981'
              }}
            >
              <Volume2 size={12} color="#020617" />
            </div>
          )}

          {state === 'thinking' && (
            <div
              style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                background: profile.color,
                borderRadius: '50%',
                padding: '4px',
                border: '2px solid #020617',
                display: 'flex',
                animation: 'spin 2s linear infinite'
              }}
            >
              <Cpu size={12} color="#020617" />
            </div>
          )}
        </div>
      </div>

      {/* Optional Details Panel */}
      {showDetails && (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.05rem', fontWeight: '700', color: '#f8fafc' }}>
              {profile.name}
            </span>
            <span 
              className="badge" 
              style={{ 
                background: profile.bgGlow, 
                color: profile.color, 
                borderColor: profile.border,
                fontSize: '0.7rem' 
              }}
            >
              {state === 'speaking' ? 'SPEAKING' : state === 'thinking' ? 'ANALYZING...' : 'AGENT READY'}
            </span>
          </div>
          <span style={{ fontSize: '0.82rem', color: '#94a3b8', marginTop: '2px' }}>
            {profile.title}
          </span>
        </div>
      )}
    </div>
  );
}
