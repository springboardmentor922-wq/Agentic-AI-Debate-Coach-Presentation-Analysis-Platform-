import React, { useState, useEffect, useRef } from 'react';
import { Bot, X, Send, Mic, Sparkles, RefreshCw, Zap, MessageSquare, AlertCircle } from 'lucide-react';
import { queryChatbotApi } from '../../services/apiClient';

import { UserProfile } from '../../types';

interface FloatingAIChatbotProps {
  currentTab: string;
  activeUser?: UserProfile;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  agentName?: string;
}

export const FloatingAIChatbot: React.FC<FloatingAIChatbotProps> = ({ currentTab, activeUser }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showCoachingAlert, setShowCoachingAlert] = useState(true);
  const [inputQuery, setInputQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatbotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && chatbotRef.current && !chatbotRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const formatMessageText = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={index} className="font-semibold text-white">
            {part.slice(2, -2)}
          </strong>
        );
      }
      return part;
    });
  };

  // Context mapping per tab
  const getTabContext = (tab: string) => {
    switch (tab) {
      case 'ai-simulation':
      case 'my-debates':
        return {
          title: 'Debate Session Context',
          agents: ['Argument Analysis', 'Logical Fallacies (Referee)', 'Counterargument Gen (Rival)'],
          prompts: [
            'Spot fallacies in my opening claim',
            'Give me a strong counterpoint for Proposition side',
            'How can I structure my Oxford debate speech?'
          ]
        };
      case 'presentation-analysis':
        return {
          title: 'Presentation & Speech Context',
          agents: ['Speech & Presentation Analysis', 'Vocal Pace & WPM Agent'],
          prompts: [
            'Analyze my filler words count ("um", "uh")',
            'What is my optimal words-per-minute rate?',
            'How do I improve speech clarity & confidence?'
          ]
        };
      case 'performance-scores':
        return {
          title: 'Performance Analytics Context',
          agents: ['Performance Analytics Agent', 'Recommendation & Coaching Agent'],
          prompts: [
            'Explain my 87/100 score in Social Media debate',
            'Which skill dimension has the highest gap?',
            'Generate a 7-day practice plan for rebuttal skills'
          ]
        };
      case 'practice-topics':
        return {
          title: 'Practice Topics Context',
          agents: ['Recommendation Agent', 'Argument Analysis Agent'],
          prompts: [
            'Recommend a topic for my intermediate skill level',
            'Generate 3 key arguments FOR AI regulation',
            'Give me an impromptu speech prompt'
          ]
        };
      case 'fallacy-detector':
      case 'argument-analyzer':
      case 'counterargument-gen':
        return {
          title: 'Argument & Fallacy Auditor Context',
          agents: ['Agent 1 Referee (Logic Auditor)', 'Agent 2 Rival Opponent'],
          prompts: [
            'Test my sentence for Ad Hominem or Straw Man',
            'Generate 4 counter-perspectives for policy motion',
            'Refine my argument to score 90+'
          ]
        };
      default:
        return {
          title: 'Platform AI Coach Context',
          agents: ['Conversation Orchestrator Agent', 'Coaching & Guidance Agent'],
          prompts: [
            'How do I get started with AI Debate Simulation?',
            'Show my current 7-day streak progress',
            'What drills are recommended for me today?'
          ]
        };
    }
  };

  const currentContext = getTabContext(currentTab);

  const userName = activeUser?.name || 'Debater';

  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg_0',
      sender: 'ai',
      text: `Hello ${userName}! I am your AI Debate Orchestrator. Currently synced with **${currentContext.title}**. How can I assist you with argument structure or speech quality right now?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      agentName: 'Conversation Orchestrator'
    }
  ]);

  const prevUserIdRef = useRef<string | undefined>(activeUser?.id);

  useEffect(() => {
    if (activeUser && activeUser.id !== prevUserIdRef.current) {
      prevUserIdRef.current = activeUser.id;
      setMessages(prev => [
        ...prev,
        {
          id: `usr_switch_${Date.now()}`,
          sender: 'ai',
          text: `Switched active learner profile to **${activeUser.name}** (${activeUser.roleLabel}). Welcome! Currently synced with **${currentContext.title}**.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentName: 'Conversation Orchestrator'
        }
      ]);
    }
  }, [activeUser, currentContext.title]);

  useEffect(() => {
    if (messages.length > 0) {
      setMessages(prev => [
        ...prev,
        {
          id: `ctx_${Date.now()}`,
          sender: 'ai',
          text: `Switched context to **${currentContext.title}**. Active AI agents: ${currentContext.agents.join(', ')}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          agentName: 'Context Manager'
        }
      ]);
    }
  }, [currentTab]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || inputQuery;
    if (!text.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setIsLoading(true);

    try {
      const response = await queryChatbotApi(text, currentTab);
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: response.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agentName: response.activeAgents?.[0] || 'AI Coach Agent'
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      const aiMsg: ChatMessage = {
        id: `ai_${Date.now()}`,
        sender: 'ai',
        text: 'I have evaluated your query across our agentic pipeline. Ensure your arguments utilize strong evidence and avoid logical fallacies.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        agentName: 'AI Debate Coach'
      };
      setMessages(prev => [...prev, aiMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceToggle = () => {
    if (!isRecording) {
      setIsRecording(true);
      setTimeout(() => {
        setIsRecording(false);
        handleSend("My opponent claims we need social media regulation, but they have no digital policy experience!");
      }, 3000);
    } else {
      setIsRecording(false);
    }
  };

  return (
    <div ref={chatbotRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Active Orchestrator Message Speech Bubble Overlay (Design HTML match) */}
      {!isOpen && showCoachingAlert && (
        <div className="bg-white text-slate-900 p-4 rounded-2xl shadow-2xl w-72 relative animate-in fade-in slide-in-from-bottom-2 duration-200 border border-slate-200">
          <button
            onClick={() => setShowCoachingAlert(false)}
            className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
          <div className="flex gap-3 items-start">
            <div className="w-9 h-9 bg-indigo-600 rounded-xl flex-shrink-0 flex items-center justify-center text-white shadow-md">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-tight text-indigo-600 flex items-center gap-1">
                <Zap className="w-3 h-3 text-indigo-600" /> Coaching Alert
              </p>
              <p className="text-xs leading-snug mt-1 font-medium text-slate-800">
                Your eye contact is dropping. Try to engage the camera directly for higher impact.
              </p>
            </div>
          </div>
          <div className="absolute -bottom-2 right-6 w-4 h-4 bg-white rotate-45 border-r border-b border-slate-200"></div>
        </div>
      )}

      {/* Floating Main Trigger Button */}
      {!isOpen && (
        <button
          onClick={() => {
            setIsOpen(true);
            setShowCoachingAlert(false);
          }}
          className="group w-16 h-16 bg-indigo-600 hover:bg-indigo-500 rounded-full flex items-center justify-center shadow-xl shadow-indigo-900/40 ring-4 ring-indigo-500/20 transition-all transform hover:scale-105 active:scale-95"
          title="Open AI Debate Assistant"
        >
          <div className="relative">
            <Bot className="w-8 h-8 text-white" />
            <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-indigo-600 animate-pulse"></div>
          </div>
        </button>
      )}

      {/* Floating Chat Drawer Modal */}
      {isOpen && (
        <div className="w-96 max-w-[calc(100vw-2rem)] h-[580px] bg-slate-900 text-slate-100 rounded-2xl shadow-2xl border border-slate-700 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#1E293B] text-white p-4 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-sm text-white leading-none">AI Debate Orchestrator</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <p className="text-[11px] text-indigo-300 mt-1 font-medium">{currentContext.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setMessages([{
                  id: 'reset',
                  sender: 'ai',
                  text: `Chat reset. Ready on **${currentContext.title}**!`,
                  timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  agentName: 'Conversation Orchestrator'
                }])}
                title="New Chat"
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Agents Badge Bar */}
          <div className="bg-slate-800/80 border-b border-slate-700/80 px-3 py-1.5 flex items-center gap-1.5 overflow-x-auto text-[11px] text-slate-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <span className="font-semibold text-slate-400 shrink-0">Agents:</span>
            <div className="flex items-center gap-1 overflow-x-auto whitespace-nowrap scrollbar-none">
              {currentContext.agents.map((ag, i) => (
                <span key={i} className="bg-slate-900 px-2 py-0.5 rounded-full border border-slate-700 text-[10px] font-mono text-indigo-300">
                  {ag}
                </span>
              ))}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0F172A]/80">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex flex-col ${m.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                {m.agentName && (
                  <span className="text-[10px] font-bold text-indigo-400 mb-0.5 px-1 flex items-center gap-1">
                    <Zap className="w-2.5 h-2.5" /> {m.agentName}
                  </span>
                )}
                <div
                  className={`max-w-[88%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-xs shadow-md'
                      : 'bg-slate-800 text-slate-200 border border-slate-700 rounded-bl-xs shadow-md'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{formatMessageText(m.text)}</p>
                </div>
                <span className="text-[9px] text-slate-500 mt-0.5 px-1">{m.timestamp}</span>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 font-medium bg-slate-800 p-2.5 rounded-xl border border-slate-700 w-fit">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Coordinating agent pipeline...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Context Quick Prompts */}
          <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {currentContext.prompts.map((p, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(p)}
                className="whitespace-nowrap bg-slate-800 hover:bg-indigo-900/60 hover:text-indigo-300 text-slate-300 text-[11px] font-medium px-2.5 py-1 rounded-full border border-slate-700 transition-colors shrink-0"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
            <button
              onClick={handleVoiceToggle}
              className={`p-2 rounded-xl transition-all ${
                isRecording
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
              title={isRecording ? 'Recording voice turn...' : 'Record Voice Input'}
            >
              <Mic className="w-4 h-4" />
            </button>

            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? 'Listening to speech...' : 'Ask AI Debate Coach...'}
              className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-slate-800"
            />

            <button
              onClick={() => handleSend()}
              disabled={!inputQuery.trim() || isLoading}
              className="p-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl transition-colors shadow-xs"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
