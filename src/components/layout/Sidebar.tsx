import React from 'react';
import { 
  LayoutDashboard, 
  Trophy, 
  Bot, 
  BookOpen, 
  FileText, 
  AlertTriangle, 
  MessageSquareCode, 
  Mic, 
  BarChart3, 
  Sparkles, 
  Compass, 
  BookmarkCheck, 
  StickyNote, 
  Bell, 
  Settings, 
  HelpCircle,
  Brain,
  X
} from 'lucide-react';
import { UserRole } from '../../types';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  currentRole,
  isMobileOpen = false,
  onCloseMobile = () => {}
}) => {
  // Navigation groupings
  const navSections = [
    {
      title: null,
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'LEARN',
      items: [
        { id: 'my-debates', label: 'My Debates', icon: Trophy },
        { id: 'ai-simulation', label: 'AI Debate Arena', icon: Bot },
        { id: 'practice-topics', label: 'Practice Topics', icon: BookOpen },
        { id: 'argument-analyzer', label: 'Argument Analyzer', icon: FileText },
        { id: 'fallacy-detector', label: 'Fallacy Detector', icon: AlertTriangle },
        { id: 'counterargument-gen', label: 'Counterargument Gen', icon: MessageSquareCode },
      ]
    },
    {
      title: 'ANALYZE',
      items: [
        { id: 'presentation-analysis', label: 'Presentation Analysis', icon: Mic },
        { id: 'performance-scores', label: 'Performance Scores', icon: BarChart3 },
      ]
    },
    {
      title: 'IMPROVE',
      items: [
        { id: 'feedback-coaching', label: 'Feedback & Coaching', icon: Sparkles },
        { id: 'recommended', label: 'Recommended Practices', icon: Compass },
      ]
    },
    {
      title: 'RESOURCES',
      items: [
        { id: 'learning-resources', label: 'Learning Resources', icon: BookmarkCheck },
        { id: 'my-notes', label: 'My Scratchpad', icon: StickyNote },
      ]
    },
    {
      title: 'OTHER',
      items: [
        { id: 'notifications', label: 'Notifications', icon: Bell, badge: 5 },
        { id: 'settings', label: 'Platform Settings', icon: Settings },
        { id: 'help-support', label: 'Help & Support', icon: HelpCircle },
      ]
    }
  ];

  const handleSelectTab = (tabId: string) => {
    setActiveTab(tabId);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full text-slate-300 select-none">
      {/* Brand Header */}
      <div className="p-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-white text-sm tracking-tight leading-snug">AI Debate Coach</h1>
            <p className="text-[10px] text-slate-400 font-medium">Orchestrated Multi-Agent</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          title="Close Navigation Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active Session Context Box */}
      <div className="p-3 mx-3 mt-3 bg-indigo-500/10 border border-indigo-500/30 rounded-lg">
        <label className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block mb-1">Active Debate Session</label>
        <p className="text-xs font-semibold text-indigo-300 truncate">Universal Basic Income</p>
        <p className="text-[10px] text-slate-400 mt-0.5 italic">Argument Phase 3/5</p>
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4 scrollbar-thin scrollbar-thumb-slate-800">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.title && (
              <p className="px-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                {section.title}
              </p>
            )}
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelectTab(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-indigo-600 text-white font-semibold shadow-md shadow-indigo-600/30'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge ? (
                      <span className="bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {item.badge}
                      </span>
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Agentic Pipeline Status Box */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <label className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block px-1">Agentic Pipeline Status</label>
          <div className="space-y-1 bg-slate-900/60 p-2 rounded-lg border border-slate-800 text-[11px]">
            <div className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-800/60">
              <span className="text-slate-300">Argument Analysis</span>
              <span className="text-emerald-400 font-bold">●</span>
            </div>
            <div className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-800/60">
              <span className="text-slate-300">Logical Fallacies</span>
              <span className="text-emerald-400 font-bold">●</span>
            </div>
            <div className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-800/60">
              <span className="text-slate-300">Presentation Sync</span>
              <span className="text-emerald-400 font-bold">●</span>
            </div>
            <div className="flex items-center justify-between py-1 px-1.5 rounded hover:bg-slate-800/60">
              <span className="text-slate-300">Report Generation</span>
              <span className="text-slate-500 font-bold">○</span>
            </div>
          </div>
        </div>
      </div>

      {/* Speech Telemetry Card at Bottom */}
      <div className="p-3 m-3 bg-slate-800/80 rounded-xl border border-slate-700">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Avg. Pace</span>
          <span className="text-[10px] text-emerald-400 font-mono font-bold">Optimal</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-mono font-bold text-white">142</span>
          <span className="text-xs font-mono text-slate-400">WPM</span>
        </div>
        <div className="w-full bg-slate-700 h-1 mt-2 rounded-full overflow-hidden">
          <div className="bg-indigo-500 h-1 w-3/4 rounded-full"></div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:flex w-64 bg-[#1E293B]/90 text-slate-300 flex-col h-screen sticky top-0 z-40 shrink-0 border-r border-slate-800">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Overlay Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Sliding Panel */}
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#1E293B] z-50 flex flex-col h-full shadow-2xl border-r border-slate-700 animate-in slide-in-from-left duration-200">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

