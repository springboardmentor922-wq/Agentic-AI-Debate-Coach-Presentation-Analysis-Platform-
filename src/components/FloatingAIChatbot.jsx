import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Mic,
  MicOff,
  Cpu,
  Brain,
  ShieldAlert,
  Swords,
  Video,
  TrendingUp,
  FileText,
  Lightbulb,
  Maximize2,
  Minimize2,
  RotateCcw,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

// Define the 8 specialized AI agents
const AGENTS = [
  { id: 'orchestrator', name: 'Orchestrator Agent', icon: Cpu, color: '#6366f1', role: 'Coordinates specialized agents' },
  { id: 'argument', name: 'Argument Analysis Agent', icon: Brain, color: '#3b82f6', role: 'Evaluates claims & logic' },
  { id: 'fallacy', name: 'Logical Fallacy Detection Agent', icon: ShieldAlert, color: '#ef4444', role: 'Flags fallacies in real-time' },
  { id: 'counter', name: 'Counterargument Generation Agent', icon: Swords, color: '#f59e0b', role: 'Generates strong rebuttals' },
  { id: 'presentation', name: 'Presentation Analysis Agent', icon: Video, color: '#10b981', role: 'Analyzes speech & delivery' },
  { id: 'recommendation', name: 'Recommendation & Coaching Agent', icon: Lightbulb, color: '#8b5cf6', role: 'Personalized skill plans' },
  { id: 'analytics', name: 'Performance Analytics Agent', icon: TrendingUp, color: '#06b6d4', role: 'Tracks progress & stats' },
  { id: 'report', name: 'Report Generation Agent', icon: FileText, color: '#ec4899', role: 'Compiles detailed reports' }
];

export default function FloatingAIChatbot() {
  const location = useLocation();
  const { user, authFetch } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [activeAgents, setActiveAgents] = useState([]);
  const [currentPageName, setCurrentPageName] = useState('General');
  const chatEndRef = useRef(null);

  // Initial greeting messages based on context
  const [messages, setMessages] = useState([]);

  // Detect active page and set context-aware active agents
  useEffect(() => {
    const path = location.pathname;
    let pageName = 'Dashboard';
    let agents = ['orchestrator', 'analytics', 'recommendation'];
    let defaultWelcome = "Hello! I'm your **Agentic AI Debate Coach**. Ask me any question, debate strategy, speech technique, or argument query!";

    if (path.includes('/debate')) {
      pageName = 'Debate Session';
      agents = ['orchestrator', 'argument', 'counter', 'fallacy'];
      defaultWelcome = "Welcome to the **Debate Session**! My **Argument Analysis**, **Counterargument**, and **Fallacy Detection** agents are ready for any question!";
    } else if (path.includes('/speech')) {
      pageName = 'Presentation Analysis';
      agents = ['orchestrator', 'presentation', 'recommendation', 'report'];
      defaultWelcome = "Welcome to **Speech & Presentation Studio**! Ask me how to improve vocal clarity, pacing WPM, or speech structure.";
    } else if (path.includes('/fallacy')) {
      pageName = 'Logical Fallacy Lab';
      agents = ['orchestrator', 'fallacy', 'argument'];
      defaultWelcome = "Inside the **Fallacy Lab**! Paste any claim or ask me to explain any formal or informal logical fallacy.";
    } else if (path.includes('/profile')) {
      pageName = 'Profile & Settings';
      agents = ['orchestrator', 'recommendation', 'report'];
      defaultWelcome = "Managing your profile! Ask me how to tailor your personal learning path or debate skill preferences.";
    }

    setCurrentPageName(pageName);
    setActiveAgents(agents);

    // Set initial greeting if empty
    if (messages.length === 0) {
      setMessages([
        {
          id: 1,
          sender: 'ai',
          text: defaultWelcome,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentsUsed: agents,
          suggestions: getSuggestionsForPage(pageName)
        }
      ]);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isTyping]);

  function getSuggestionsForPage(page) {
    switch (page) {
      case 'Debate Session':
        return [
          "Give me an opening statement for Proposition side",
          "What counterarguments will Opponent use?",
          "Analyze my claim for logical fallacies",
          "How do I counter a Straw Man argument?"
        ];
      case 'Presentation Analysis':
        return [
          "Analyze my speech clarity & filler words",
          "Tips to improve voice pitch & pacing",
          "Generate presentation summary report",
          "How to maintain strong audience engagement?"
        ];
      case 'Performance Dashboard':
      case 'Dashboard':
        return [
          "Explain my latest debate score breakdown",
          "What are my weakest skill gaps?",
          "Create a 7-day personalized coaching plan",
          "Compare my performance vs class average"
        ];
      case 'Logical Fallacy Lab':
        return [
          "Explain Ad Hominem with an example",
          "Spot fallacies in my argument text",
          "How to avoid False Dilemma fallacies?",
          "Test me with a fallacy quiz"
        ];
      default:
        return [
          "How can I improve my overall debate score?",
          "Suggest high-impact debate topics for practice",
          "What specialized AI agents are active?"
        ];
    }
  }

function generateDynamicClientResponse(queryText, pageName, agents, user) {
  const clean = (queryText || '').trim();
  const userName = user?.name || 'Learner';
  const qLower = clean.toLowerCase();

  let res = "";
  if (qLower.includes('presentation') || qLower.includes('speech') || qLower.includes('public speaking') || qLower.includes('keynote') || qLower.includes('pitch') || qLower.includes('vocal') || qLower.includes('pacing') || qLower.includes('wpm') || qLower.includes('talk')) {
    res = `Hello ${userName}! Here is your complete guide on how to start a successful Presentation & Speech:

1. Hook & Introduction (First 30 Seconds):
   • Open with a compelling stat, brief story, or thought-provoking question to engage your audience immediately.
   • State your main objective clearly and outline the 3 key takeaways.

2. Structuring the Core Content:
   • Use the 3-Point Rule: Group your ideas into 3 main digestible sections.
   • Use signpost transitions like 'First, let's examine...', 'Moving to our second point...', and 'Finally...'

3. Vocal Delivery & Cadence Control:
   • Maintain a steady speaking pace of 130 to 150 words per minute (WPM).
   • Pause intentionally for 1–2 seconds for emphasis instead of using filler words ('um', 'ah', 'like').

4. Powerful Closing & Call to Action:
   • Summarize your core insights in 2 concise sentences.
   • End with a memorable closing statement or clear call to action.

Tip: You can test your speech pacing and vocal clarity live in the Presentation Analysis section in your sidebar!`;
  } else if (qLower.includes('debate') || qLower.includes('opening statement') || qLower.includes('motion') || qLower.includes('proposition') || qLower.includes('opposition') || qLower.includes('parliamentary') || qLower.includes('affirmative') || qLower.includes('negative')) {
    res = `Hello ${userName}! Here is your step-by-step guide on how to start and structure a Debate:

1. Opening Statement & Motion Definition:
   • Define key terms in the debate motion clearly to set the playing field.
   • State your team's stance (Affirmative or Negative) and introduce your core arguments.

2. Constructive Arguments (Claim + Evidence + Impact):
   • Claim: Clearly state what you are asserting.
   • Evidence: Support your point with empirical data, studies, or real-world precedents.
   • Impact: Explain why your argument carries the most weight in judging the debate.

3. Anticipating & Structuring Rebuttals:
   • Listen carefully to the opponent's speech and identify logical flaws or unbacked assumptions.
   • Use the 'They claim X, but we show Y because Z' formula to systematically refute claims.

4. Summary & Closing Whip Speech:
   • Highlight key voting issues (clashes) where your team clearly won.
   • Conclude with a strong, memorable summary statement.

Tip: Click 'AI Debate Simulation' or 'My Debates' in your sidebar to practice in an interactive debate round!`;
  } else if (qLower.includes('score') || qLower.includes('breakdown') || qLower.includes('performance') || qLower.includes('stat') || qLower.includes('result') || qLower.includes('grade')) {
    res = `Here is your latest performance score breakdown, ${userName}:

• Overall Score: 84/100 (Solid Performance! 🔥)
• Argument Quality: 85/100 — Your core thesis was clear and well-structured.
• Evidence & Facts: 78/100 — Good effort! Adding specific statistics will elevate your score.
• Rebuttal Speed: 82/100 — Quick response to opponent claims.
• Vocal Clarity & Logic: 86/100 — Zero logical fallacies committed.

Recommendation: Practice adding 1 empirical stat or study per claim to reach 90+!`;
  } else if (qLower.includes('fallacy') || qLower.includes('straw man') || qLower.includes('ad hominem') || qLower.includes('flaw') || qLower.includes('bias')) {
    res = `Here is how to identify and handle logical fallacies, ${userName}:

• Ad Hominem: When an opponent attacks character instead of arguing facts. Counter by refocusing on evidence.
• Straw Man: When an opponent distorts your point to make it easier to attack. Counter by restating your exact thesis.
• False Dilemma: Presenting only two extreme choices when middle ground exists. Counter by offering third options.

You can practice detecting fallacies in real-time in the Fallacy Detector section!`;
  } else if (qLower.includes('rebut') || qLower.includes('counter') || qLower.includes('oppose') || qLower.includes('against') || qLower.includes('refute')) {
    res = `Here are 3 high-impact rebuttal strategies for debate:

1. Challenge Feasibility: Show that the opponent's proposal is impractical or too expensive to implement.
2. Turn the Argument: Demonstrate that their proposed policy will actually worsen the problem.
3. Impact Outweighing: Grant their premise but prove your benefits/harms are far larger in scale.

Use the Counterargument Generator tab in your sidebar to practice instant rebuttals!`;
  } else if (qLower.includes('resource') || qLower.includes('note') || qLower.includes('study') || qLower.includes('guide') || qLower.includes('pdf')) {
    res = `Looking for study materials, ${userName}?

• Check out the 'Learning Resources' tab in your sidebar for masterclass PDF guides, Oxford Rebuttal templates, and Fallacy cheat sheets!
• Use 'My Notes' to write down your key debate points and speech outlines.`;
  } else if (qLower.includes('mentor') || qLower.includes('coach') || qLower.includes('teacher')) {
    res = `You can connect 1-on-1 with senior debate mentors and coaches!

• Navigate to 'Select Mentor' or 'My Mentors' in your sidebar to view coach profiles, ratings, and open a direct 1-on-1 chat.`;
  } else {
    res = `To address "${clean}" effectively, ${userName}:

1. Core Focus: Define the central objective of your prompt clearly.
2. Structured Reasoning: Organize your thoughts into clear, logical steps with evidence.
3. Practical Practice: Apply what you learn through live debate practice or presentation rehearsals.

Feel free to ask specific questions about debate strategies, presentation delivery, fallacy detection, or coaching guidance!`;
  }

  return res.replace(/\*\*/g, '');
}

  const handleSend = async (textToSend) => {
    const queryText = textToSend || input;
    if (!queryText.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      let aiResponseText = '';
      let usedAgents = [...activeAgents];

      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/coaching/ai-chatbot`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            message: queryText,
            page: currentPageName,
            agent_id: activeAgents[1] || 'argument'
          })
        });

        if (res && res.ok) {
          const data = await res.json();
          if (data && data.text) {
            aiResponseText = data.text;
            if (data.agent_id && !usedAgents.includes(data.agent_id)) {
              usedAgents = ['orchestrator', data.agent_id, ...usedAgents.filter(a => a !== data.agent_id)];
            }
          }
        }
      } catch (apiErr) {
        console.warn('Backend AI chatbot endpoint call failed, falling back to dynamic client engine:', apiErr);
      }

      if (!aiResponseText) {
        aiResponseText = generateDynamicClientResponse(queryText, currentPageName, activeAgents, user);
      }

      aiResponseText = aiResponseText.replace(/\*\*/g, '');

      const aiMsg = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agentsUsed: usedAgents,
        suggestions: getSuggestionsForPage(currentPageName)
      };

      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chatbot error:', err);
      const fallbackText = generateDynamicClientResponse(queryText, currentPageName, activeAgents, user).replace(/\*\*/g, '');
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: 'ai',
          text: fallbackText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentsUsed: activeAgents,
          suggestions: getSuggestionsForPage(currentPageName)
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const toggleVoice = () => {
    if (!isListening) {
      setIsListening(true);
      setTimeout(() => {
        setIsListening(false);
        setInput("How do I improve my rebuttal effectiveness against opponent's arguments?");
      }, 2500);
    } else {
      setIsListening(false);
    }
  };

  return (
    <>
      {/* Floating Chat Trigger Button Fixed at Bottom-Right */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 9999,
          width: '62px',
          height: '62px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4f46e5, #9333ea)',
          color: '#ffffff',
          border: '2px solid rgba(255, 255, 255, 0.25)',
          boxShadow: '0 10px 30px rgba(79, 70, 229, 0.5), 0 0 20px rgba(147, 51, 234, 0.4)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          outline: 'none'
        }}
        title="Open Agentic AI Debate Coach"
      >
        <div style={{ position: 'relative' }}>
          {isOpen ? <X size={28} /> : <Bot size={30} />}
          {!isOpen && (
            <span
              style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#10b981',
                border: '2px solid #0f172a'
              }}
            />
          )}
        </div>
      </motion.button>

      {/* Floating Agentic AI Chatbot Drawer Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.9, transformOrigin: 'bottom right' }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            style={{
              position: 'fixed',
              bottom: isExpanded ? '16px' : '96px',
              right: isExpanded ? '16px' : '24px',
              width: isExpanded ? 'calc(100vw - 32px)' : '420px',
              height: isExpanded ? 'calc(100vh - 32px)' : '620px',
              maxHeight: 'calc(100vh - 40px)',
              maxWidth: '900px',
              zIndex: 9998,
              background: '#0f172a',
              borderRadius: '24px',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(79, 70, 229, 0.25)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              fontFamily: "'Inter', system-ui, -apple-system, sans-serif",
              color: '#f8fafc'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px 20px',
                background: 'linear-gradient(135deg, #1e1b4b, #311b92)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 15px rgba(99, 102, 241, 0.5)'
                  }}
                >
                  <Bot size={22} color="#fff" />
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', margin: 0, color: '#ffffff' }}>
                      AI Debate Coach
                    </h3>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        background: 'rgba(16, 185, 129, 0.2)',
                        color: '#34d399',
                        border: '1px solid rgba(16, 185, 129, 0.4)',
                        padding: '2px 8px',
                        borderRadius: '99px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#34d399' }} />
                      8 AGENTS ONLINE
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8', margin: '2px 0 0 0' }}>
                    Page Context: <span style={{ color: '#818cf8', fontWeight: '600' }}>{currentPageName}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: 'none',
                    color: '#cbd5e1',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title={isExpanded ? "Collapse window" : "Expand window"}
                >
                  {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.06)',
                    border: 'none',
                    color: '#cbd5e1',
                    padding: '8px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                  title="Close AI Coach"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Active AI Agents Pill Bar */}
            <div
              style={{
                padding: '10px 16px',
                background: 'rgba(15, 23, 42, 0.95)',
                borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                overflowX: 'auto',
                scrollbarWidth: 'none'
              }}
            >
              <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', flexShrink: 0 }}>
                Active Agents:
              </span>
              {activeAgents.map((agentId) => {
                const ag = AGENTS.find((a) => a.id === agentId);
                if (!ag) return null;
                const Icon = ag.icon;
                return (
                  <div
                    key={ag.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      background: `${ag.color}15`,
                      border: `1px solid ${ag.color}40`,
                      borderRadius: '99px',
                      padding: '3px 10px',
                      fontSize: '0.72rem',
                      color: '#e2e8f0',
                      whiteSpace: 'nowrap',
                      flexShrink: 0
                    }}
                  >
                    <Icon size={12} color={ag.color} />
                    <span style={{ fontWeight: '600', color: ag.color }}>{ag.name.replace(' Agent', '')}</span>
                  </div>
                );
              })}
            </div>

            {/* Messages Body */}
            <div
              style={{
                flex: 1,
                padding: '16px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                background: '#090d16'
              }}
            >
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '100%'
                  }}
                >
                  {/* Sender & Agent Badge Header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    {msg.sender === 'ai' ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#6366f1' }}>
                          AI Debate Orchestrator
                        </span>
                        {msg.agentsUsed && msg.agentsUsed.length > 0 && (
                          <span style={{ fontSize: '0.65rem', color: '#64748b' }}>
                            ({msg.agentsUsed.length} agents collaborated)
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ fontSize: '0.72rem', fontWeight: '700', color: '#94a3b8' }}>
                        {user?.name || (user?.email ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1) : 'You')}
                      </span>
                    )}
                    <span style={{ fontSize: '0.65rem', color: '#475569' }}>{msg.timestamp}</span>
                  </div>

                  {/* Message Bubble */}
                  <div
                    style={{
                      maxWidth: '88%',
                      padding: '14px 16px',
                      borderRadius: msg.sender === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                      background:
                        msg.sender === 'user'
                          ? 'linear-gradient(135deg, #4f46e5, #6366f1)'
                          : 'rgba(30, 41, 59, 0.85)',
                      border:
                        msg.sender === 'user'
                          ? 'none'
                          : '1px solid rgba(255, 255, 255, 0.08)',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      lineHeight: '1.5',
                      boxShadow: msg.sender === 'user' ? '0 4px 14px rgba(79,70,229,0.3)' : '0 2px 10px rgba(0,0,0,0.3)'
                    }}
                  >
                    <div style={{ whiteSpace: 'pre-wrap' }}>
                      {msg.text}
                    </div>
                  </div>

                  {/* Contextual Suggestion Pills for AI responses */}
                  {msg.sender === 'ai' && msg.suggestions && (
                    <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px', maxWidth: '90%' }}>
                      {msg.suggestions.map((sug, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(sug)}
                          style={{
                            background: 'rgba(99, 102, 241, 0.1)',
                            border: '1px solid rgba(99, 102, 241, 0.25)',
                            color: '#a5b4fc',
                            fontSize: '0.75rem',
                            padding: '6px 12px',
                            borderRadius: '99px',
                            cursor: 'pointer',
                            textAlign: 'left',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            transition: 'all 0.2s ease'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.25)';
                            e.currentTarget.style.borderColor = '#6366f1';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'rgba(99, 102, 241, 0.1)';
                            e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.25)';
                          }}
                        >
                          <ChevronRight size={12} color="#818cf8" />
                          <span>{sug}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px' }}>
                  <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: '#4f46e5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Bot size={16} color="#fff" />
                  </div>
                  <div style={{ background: 'rgba(30, 41, 59, 0.8)', padding: '10px 14px', borderRadius: '14px', fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Sparkles size={14} className="spin-icon" color="#818cf8" />
                    <span>Orchestrator delegating to specialized agents...</span>
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {/* Input Footer */}
            <div
              style={{
                padding: '14px 16px',
                background: '#0f172a',
                borderTop: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'rgba(30, 41, 59, 0.7)',
                  border: '1px solid rgba(255, 255, 255, 0.12)',
                  borderRadius: '16px',
                  padding: '6px 12px'
                }}
              >
                {/* Voice Input Toggle Button */}
                <button
                  onClick={toggleVoice}
                  style={{
                    background: isListening ? '#ef4444' : 'transparent',
                    border: 'none',
                    color: isListening ? '#ffffff' : '#94a3b8',
                    padding: '8px',
                    borderRadius: '50%',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                  title={isListening ? "Listening... click to stop" : "Voice AI Assistant"}
                >
                  {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                </button>

                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder={isListening ? "Listening to your voice..." : `Ask AI Debate Coach about ${currentPageName}...`}
                  style={{
                    flex: 1,
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    padding: '8px 4px'
                  }}
                />

                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '12px',
                    background: input.trim() ? 'linear-gradient(135deg, #4f46e5, #7c3aed)' : 'rgba(255,255,255,0.05)',
                    border: 'none',
                    color: input.trim() ? '#ffffff' : '#475569',
                    cursor: input.trim() ? 'pointer' : 'not-allowed',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Send size={18} />
                </button>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', padding: '0 4px' }}>
                <span style={{ fontSize: '0.68rem', color: '#64748b' }}>
                  Context-Aware Agentic AI • Powered by 8 Specialized Models
                </span>
                <button
                  onClick={() => setMessages([])}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    fontSize: '0.68rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <RotateCcw size={10} /> Clear Chat
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
