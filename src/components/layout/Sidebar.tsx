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
  User,
  Users,
  Route,
  X
} from 'lucide-react';
import { UserRole } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: UserRole;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
  activeDebateTopic?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  activeTab, 
  setActiveTab, 
  currentRole,
  isMobileOpen = false,
  onCloseMobile = () => {},
  activeDebateTopic
}) => {
  const { isDark } = useTheme();

  // Navigation groupings per role
  const getNavSections = () => {
    switch (currentRole) {
      case 'coach':
        return [
          {
            title: 'COACHING',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'learners', label: 'Learners', icon: Users },
              { id: 'argument-reviews', label: 'Argument Reviews', icon: FileText },
              { id: 'fallacy-reports', label: 'Fallacy Reports', icon: AlertTriangle },
              { id: 'presentation-reviews', label: 'Presentation Reviews', icon: Mic },
              { id: 'coaching-plans', label: 'Coaching Plans', icon: Sparkles },
            ]
          },
          {
            title: 'ANALYZE',
            items: [
              { id: 'performance-analytics', label: 'Performance Analytics', icon: BarChart3 },
              { id: 'reports', label: 'Reports', icon: Trophy },
              { id: 'skill-gap-analysis', label: 'Skill Gap Analysis', icon: Brain },
            ]
          },
          {
            title: 'OTHER',
            items: [
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: 10 },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'help-support', label: 'Help & Support', icon: HelpCircle },
              { id: 'profile', label: 'Profile', icon: User },
            ]
          }
        ];

      case 'educator':
        return [
          {
            title: 'EDUCATOR',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'my-classes', label: 'My Classes', icon: Users },
              { id: 'assignments', label: 'Assignments', icon: BookOpen },
              { id: 'rubrics', label: 'Rubrics & Criteria', icon: BookmarkCheck },
              { id: 'evaluation-queue', label: 'Evaluation Queue', icon: FileText },
              { id: 'badges', label: 'Badges & Achievements', icon: Trophy },
            ]
          },
          {
            title: 'ANALYZE',
            items: [
              { id: 'performance-analytics', label: 'Class Analytics', icon: BarChart3 },
              { id: 'reports', label: 'Student Reports', icon: Trophy },
            ]
          },
          {
            title: 'OTHER',
            items: [
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: 10 },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'help-support', label: 'Help & Support', icon: HelpCircle },
              { id: 'profile', label: 'Profile', icon: User },
            ]
          }
        ];

      case 'admin':
        return [
          {
            title: 'ADMINISTRATION',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'user-management', label: 'User Management', icon: Users },
              { id: 'content-management', label: 'Content Management', icon: BookOpen },
              { id: 'system-health', label: 'System Health', icon: Brain },
              { id: 'audit-logs', label: 'Audit Logs', icon: FileText },
            ]
          },
          {
            title: 'OTHER',
            items: [
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: 10 },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'help-support', label: 'Help & Support', icon: HelpCircle },
              { id: 'profile', label: 'Profile', icon: User },
            ]
          }
        ];

      default: // learner
        return [
          {
            title: 'LEARN',
            items: [
              { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
              { id: 'my-debates', label: 'My Debates', icon: Trophy },
              { id: 'ai-simulation', label: 'Debate Simulation', icon: Bot },
              { id: 'practice-topics', label: 'Practice Topics', icon: BookOpen },
              { id: 'argument-analyzer', label: 'Argument Analyzer', icon: FileText },
              { id: 'fallacy-detector', label: 'Fallacy Detector', icon: AlertTriangle },
              { id: 'counterargument-gen', label: 'Counterargument Generator', icon: MessageSquareCode },
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
              { id: 'improvement-hub', label: 'Improvement Hub', icon: Sparkles },
            ]
          },
          {
            title: 'RESOURCES',
            items: [
              { id: 'learning-resources', label: 'Learning Resources', icon: BookmarkCheck },
              { id: 'my-notes', label: 'My Notes', icon: StickyNote },
            ]
          },
          {
            title: 'OTHER',
            items: [
              { id: 'notifications', label: 'Notifications', icon: Bell, badge: 10 },
              { id: 'settings', label: 'Settings', icon: Settings },
              { id: 'help-support', label: 'Help & Support', icon: HelpCircle },
              { id: 'profile', label: 'Profile', icon: User },
            ]
          }
        ];
    }
  };

  const navSections = getNavSections();

  const handleSelectTab = (id: string) => {
    setActiveTab(id);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex flex-col h-full select-none">
      {/* Brand Header */}
      <div className={`p-4 flex items-center justify-between border-b ${
        isDark ? 'border-slate-800' : 'border-slate-200'
      }`}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shrink-0">
            <Brain className="w-5 h-5" />
          </div>
          <div>
            <h1 className={`font-bold text-sm tracking-tight leading-snug ${
              isDark ? 'text-white' : 'text-slate-900'
            }`}>Debate Coach</h1>
            <p className={`text-[10px] font-medium ${
              isDark ? 'text-slate-400' : 'text-slate-500'
            }`}>Orchestrated Multi-Agent</p>
          </div>
        </div>

        {/* Mobile Close Button */}
        <button
          onClick={onCloseMobile}
          className={`lg:hidden p-1.5 rounded-lg transition-colors ${
            isDark ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Close Navigation Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Active Session Context Box */}
      <div className={`p-3 mx-3 mt-3 rounded-lg border ${
        isDark ? 'bg-indigo-500/10 border-indigo-500/30' : 'bg-indigo-50 border-indigo-200'
      }`}>
        <label className={`text-[9px] uppercase tracking-widest font-bold block mb-1 ${
          isDark ? 'text-slate-400' : 'text-indigo-800'
        }`}>Active Debate Session</label>
        <p className={`text-xs font-semibold truncate ${
          isDark ? 'text-indigo-300' : 'text-indigo-950'
        }`} title={activeDebateTopic || 'Universal Basic Income'}>
          {activeDebateTopic || 'Universal Basic Income'}
        </p>
        <p className={`text-[10px] mt-0.5 italic ${
          isDark ? 'text-slate-400' : 'text-indigo-600/90'
        }`}>Argument Phase 3/5</p>
      </div>

      {/* Nav Menu Items */}
      <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
        {navSections.map((section, sIdx) => (
          <div key={sIdx}>
            {section.title && (
              <p className={`px-3 text-[10px] font-bold uppercase tracking-widest mb-1.5 ${
                isDark ? 'text-slate-500' : 'text-slate-400'
              }`}>
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
                        ? 'bg-purple-600 text-white font-semibold shadow-md shadow-purple-600/30'
                        : isDark
                          ? 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${
                        isActive ? 'text-white' : isDark ? 'text-slate-400' : 'text-slate-500'
                      }`} />
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
        <div className={`pt-2 border-t space-y-2 ${
          isDark ? 'border-slate-800/80' : 'border-slate-200'
        }`}>
          <label className={`text-[9px] uppercase tracking-widest font-bold block px-1 ${
            isDark ? 'text-slate-500' : 'text-slate-400'
          }`}>Agentic Pipeline Status</label>
          <div className={`space-y-1 p-2 rounded-lg border text-[11px] ${
            isDark ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between py-1 px-1.5 rounded">
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Argument Analysis</span>
              <span className="text-emerald-500 font-bold">●</span>
            </div>
            <div className="flex items-center justify-between py-1 px-1.5 rounded">
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Logical Fallacies</span>
              <span className="text-emerald-500 font-bold">●</span>
            </div>
            <div className="flex items-center justify-between py-1 px-1.5 rounded">
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Presentation Sync</span>
              <span className="text-emerald-500 font-bold">●</span>
            </div>
            <div className="flex items-center justify-between py-1 px-1.5 rounded">
              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>Report Generation</span>
              <span className={isDark ? 'text-slate-500' : 'text-slate-400'}>○</span>
            </div>
          </div>
        </div>
      </div>

      {/* Speech Telemetry Card at Bottom */}
      <div className={`p-3 m-3 rounded-xl border ${
        isDark ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-100 border-slate-200 shadow-xs'
      }`}>
        <div className={`flex items-center justify-between text-xs mb-1 ${
          isDark ? 'text-slate-400' : 'text-slate-600'
        }`}>
          <span>Avg. Pace</span>
          <span className="text-[10px] text-emerald-500 font-mono font-bold">Optimal</span>
        </div>
        <div className="flex items-baseline gap-1">
          <span className={`text-2xl font-mono font-bold ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>142</span>
          <span className={`text-xs font-mono ${
            isDark ? 'text-slate-400' : 'text-slate-500'
          }`}>WPM</span>
        </div>
        <div className={`w-full h-1 mt-2 rounded-full overflow-hidden ${
          isDark ? 'bg-slate-700' : 'bg-slate-200'
        }`}>
          <div className="bg-purple-600 h-1 w-3/4 rounded-full"></div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className={`hidden lg:flex w-64 flex-col h-screen sticky top-0 z-40 shrink-0 border-r transition-colors ${
        isDark ? 'bg-[#1E293B]/90 border-slate-800 text-slate-300' : 'bg-white border-slate-200 text-slate-700 shadow-xs'
      }`}>
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Overlay Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />

          {/* Sliding Panel */}
          <aside className={`fixed inset-y-0 left-0 w-72 max-w-[85vw] z-50 flex flex-col h-full shadow-2xl border-r animate-in slide-in-from-left duration-200 ${
            isDark ? 'bg-[#1E293B] border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
          }`}>
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
};

