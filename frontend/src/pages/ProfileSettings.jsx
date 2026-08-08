import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { 
  User, 
  Sliders, 
  Award, 
  Sparkles, 
  Shield, 
  Save, 
  CheckCircle2, 
  Activity,
  Bot,
  Flame,
  Zap
} from 'lucide-react';
import { motion } from 'framer-motion';
import AgentAvatar from '../components/AgentAvatar';


export default function ProfileSettings() {
  const { authFetch, updateUser, fetchUser } = useAuth();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Editable Form states
  const [name, setName] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('Beginner');
  const [preferredTopics, setPreferredTopics] = useState([]);
  const [presentationDomains, setPresentationDomains] = useState([]);
  const [learningGoals, setLearningGoals] = useState([]);
  const [coachingStyle, setCoachingStyle] = useState('Encouraging');
  const [rebuttalIntensity, setRebuttalIntensity] = useState('Medium');

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await authFetch('/auth/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data);
        
        // Bind values
        setName(data.name || '');
        setExperienceLevel(data.experience_level || 'Beginner');
        setPreferredTopics(data.preferred_topics || []);
        setPresentationDomains(data.presentation_domains || []);
        setLearningGoals(data.learning_goals || []);
        setCoachingStyle(data.coaching_preferences?.style || 'Encouraging');
        setRebuttalIntensity(data.coaching_preferences?.rebuttal_intensity || 'Medium');
      }
    } catch (err) {
      console.error(err);
      setError('Could not retrieve profile settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckboxChange = (val, state, setState) => {
    if (state.includes(val)) {
      setState(state.filter(item => item !== val));
    } else {
      setState([...state, val]);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const body = {
        name,
        experience_level: experienceLevel,
        preferred_topics: preferredTopics,
        presentation_domains: presentationDomains,
        learning_goals: learningGoals,
        coaching_preferences: {
          style: coachingStyle,
          rebuttal_intensity: rebuttalIntensity
        }
      };

      const res = await authFetch('/auth/profile', {
        method: 'PUT',
        body
      });

      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);

        // Instantly update user state in global AuthContext so changes reflect everywhere in real time!
        if (updateUser) {
          updateUser({
            name: name,
            experience_level: experienceLevel,
            preferred_topics: preferredTopics,
            presentation_domains: presentationDomains,
            coaching_preferences: {
              style: coachingStyle,
              rebuttal_intensity: rebuttalIntensity
            }
          });
        }

        if (fetchUser) {
          fetchUser();
        }

        setMessage('Profile & AI Persona settings updated successfully! Changes reflected across your account.');
        setTimeout(() => setMessage(''), 4000);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.centered}>
        <div style={styles.spinner}></div>
        <p style={{ marginTop: '10px', color: '#94a3b8' }}>Syncing Profile Data...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.backLink}>← Back to Dashboard</Link>

      <h2 style={styles.mainTitle}>Profile & Skill Settings</h2>
      <p style={styles.mainSub}>Customize your coaching preferences, tracking dimensions, and experience levels.</p>

      {message && <div style={styles.successAlert}>{message}</div>}
      {error && <div style={styles.errorAlert}>{error}</div>}

      <div style={styles.splitLayout}>
        {/* Profile update form */}
        <form onSubmit={handleSave} className="glass-panel" style={styles.formCard}>
          <h3 style={styles.sectionTitle}>User Preferences</h3>
          
          <div style={styles.inputGroup}>
            <label style={styles.label}>Profile Display Name</label>
            <input 
              type="text" 
              required 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              placeholder="Your Name"
            />
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Debate Experience Level</label>
            <select value={experienceLevel} onChange={(e) => setExperienceLevel(e.target.value)}>
              <option value="Beginner">Beginner (Novice / Learner)</option>
              <option value="Intermediate">Intermediate (Club / College Competitor)</option>
              <option value="Advanced">Advanced (Varsity / Competition Coach)</option>
            </select>
          </div>

          {/* Preferred Topics */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Preferred Debate Topics</label>
            <div style={styles.checkboxGrid}>
              {['Technology & AI', 'Global Economics', 'Ethics & Philosophy', 'Climate Policy', 'Public Health', 'Politics'].map((topic) => (
                <label key={topic} style={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={preferredTopics.includes(topic)}
                    onChange={() => handleCheckboxChange(topic, preferredTopics, setPreferredTopics)}
                    style={styles.checkbox}
                  />
                  {topic}
                </label>
              ))}
            </div>
          </div>

          {/* Presentation Domains */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Presentation Domains</label>
            <div style={styles.checkboxGrid}>
              {['Corporate & Business', 'Academic & Research', 'Keynote Speaking', 'Technical Demos', 'Political Rhetoric'].map((domain) => (
                <label key={domain} style={styles.checkboxLabel}>
                  <input 
                    type="checkbox" 
                    checked={presentationDomains.includes(domain)}
                    onChange={() => handleCheckboxChange(domain, presentationDomains, setPresentationDomains)}
                    style={styles.checkbox}
                  />
                  {domain}
                </label>
              ))}
            </div>
          </div>

          {/* Coaching Preferences */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>AI Coach Personality Feedback</label>
            <select value={coachingStyle} onChange={(e) => setCoachingStyle(e.target.value)}>
              <option value="Encouraging">Encouraging (Constructive & Positive)</option>
              <option value="Analytical">Analytical (Logical Gaps & Structural Focus)</option>
              <option value="Socratic">Socratic (Probing Questions & Premise Testing)</option>
            </select>
          </div>

          <div style={styles.inputGroup}>
            <label style={styles.label}>Opponent Rebuttal Intensity</label>
            <select value={rebuttalIntensity} onChange={(e) => setRebuttalIntensity(e.target.value)}>
              <option value="Low">Low (Fewer Fallacies Highlighted)</option>
              <option value="Medium">Medium (Balanced Argument Challenges)</option>
              <option value="High">High (Strict logical checks & Fast rebuttal counter-points)</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save Settings'}
          </button>
        </form>

        {/* Skills Overview Summary */}
        <div className="glass-panel" style={styles.skillsCard}>
          <h3 style={styles.sectionTitle}>Calculated Skills Rating</h3>
          <p style={styles.cardSub}>Derived dynamically based on session metrics.</p>

          <div style={styles.skillList}>
            {profile?.skills_json && Object.entries(profile.skills_json).map(([key, val]) => (
              <div key={key} style={styles.skillBarRow}>
                <div style={styles.skillLabelRow}>
                  <span style={styles.skillName}>{key.toUpperCase().replace('_', ' ')}</span>
                  <span style={styles.skillVal}>{val} / 100</span>
                </div>
                <div style={styles.progressBarBg}>
                  <div 
                    style={{ 
                      ...styles.progressBarFill, 
                      width: `${val}%`,
                      background: val >= 80 ? 'var(--color-success)' : val >= 60 ? 'var(--color-primary)' : 'var(--color-accent)'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  backLink: {
    color: 'var(--color-primary)',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    display: 'inline-flex',
    alignItems: 'center',
    marginBottom: '25px',
    transition: 'var(--transition-smooth)',
  },
  mainTitle: {
    fontSize: '2.4rem',
    fontWeight: '800',
    color: '#f8fafc',
    marginBottom: '10px',
    letterSpacing: '-0.02em',
  },
  mainSub: {
    color: '#94a3b8',
    fontSize: '1.05rem',
    marginBottom: '40px',
  },
  splitLayout: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '35px',
  },
  formCard: {
    padding: '35px',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
    boxShadow: 'var(--glass-shadow)',
  },
  skillsCard: {
    padding: '35px',
    alignSelf: 'start',
    boxShadow: 'var(--glass-shadow)',
  },
  sectionTitle: {
    fontSize: '1.35rem',
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: '10px',
  },
  cardSub: {
    color: '#64748b',
    fontSize: '0.9rem',
    marginBottom: '25px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  label: {
    color: '#94a3b8',
    fontSize: '0.85rem',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
    textAlign: 'left',
  },
  checkboxGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '14px',
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    padding: '16px',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    color: '#f8fafc',
    fontSize: '0.9rem',
    cursor: 'pointer',
    fontWeight: '500',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  skillList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  skillBarRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  skillLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.85rem',
  },
  skillName: {
    color: '#94a3b8',
    fontWeight: '600',
    letterSpacing: '0.05em',
  },
  skillVal: {
    color: '#f8fafc',
    fontWeight: '700',
  },
  progressBarBg: {
    height: '10px',
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    borderRadius: '99px',
    overflow: 'hidden',
    border: '1px solid rgba(255,255,255,0.02)',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '99px',
    boxShadow: '0 0 10px rgba(6, 182, 212, 0.25)',
  },
  successAlert: {
    backgroundColor: 'rgba(16, 185, 129, 0.12)',
    color: '#10b981',
    padding: '20px',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid rgba(16, 185, 129, 0.2)',
    marginBottom: '35px',
    fontSize: '0.95rem',
  },
  errorAlert: {
    backgroundColor: 'rgba(244, 63, 94, 0.12)',
    color: '#f43f5e',
    padding: '20px',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid rgba(244, 63, 94, 0.2)',
    marginBottom: '35px',
    fontSize: '0.95rem',
  },
  centered: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--bg-app)',
  },
  spinner: {
    width: '45px',
    height: '45px',
    border: '3px solid rgba(6, 182, 212, 0.1)',
    borderTopColor: 'var(--color-primary)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    boxShadow: '0 0 15px rgba(6, 182, 212, 0.15)',
  }
};

// Window sizing adjustments
if (typeof window !== 'undefined') {
  const matchMedia = window.matchMedia('(min-width: 900px)');
  const handleResize = () => {
    if (matchMedia.matches) {
      styles.splitLayout.gridTemplateColumns = '1.4fr 1fr';
    } else {
      styles.splitLayout.gridTemplateColumns = '1fr';
    }
  };
  handleResize();
  matchMedia.addEventListener('change', handleResize);
}
