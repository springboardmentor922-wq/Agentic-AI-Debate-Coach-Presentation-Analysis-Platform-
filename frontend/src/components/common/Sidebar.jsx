import React from 'react';
import { 
  Mic, History, CheckSquare, MessageSquare, 
  BarChart3, Clock, CheckCircle2, Users, 
  UserPlus, BookOpen, ShieldAlert, Cpu
} from 'lucide-react';

export const Sidebar = ({ role, activeTab, setActiveTab }) => {
  const getNavItems = () => {
    switch (role) {
      case 'Learner':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Mic },
          { id: 'tasks', label: 'Assigned Tasks', icon: CheckSquare },
          { id: 'history', label: 'Debate History', icon: History },
          { id: 'performance', label: 'Performance', icon: BarChart3 },
          { id: 'feedbacks', label: 'My Feedbacks', icon: MessageSquare }
        ];
      case 'Debate Coach':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'pending', label: 'Pending Reviews', icon: Clock },
          { id: 'completed', label: 'Completed Reviews', icon: CheckCircle2 },
          { id: 'learners', label: 'Learners Report', icon: Users },
          { id: 'myFeedbacks', label: 'My Feedbacks', icon: MessageSquare }
        ];
      case 'Educator':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'reports', label: 'Reports', icon: Users },
          { id: 'assignTask', label: 'Assign Task', icon: CheckSquare },
          { id: 'feedbacks', label: 'Feedbacks', icon: MessageSquare },
          { id: 'myFeedbacks', label: 'My Feedbacks', icon: MessageSquare }
        ];
      case 'Admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
          { id: 'reports', label: 'Reports', icon: BarChart3 },
          { id: 'users', label: 'User Accounts', icon: Users },
          { id: 'topics', label: 'Topics Catalog', icon: BookOpen }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 glass-card rounded-none border-t-0 border-l-0 border-b-0 min-h-[calc(100vh-65px)] p-4 flex flex-col justify-between bg-slate-950/40">
      <div className="space-y-6">
        <div>
          <div className="px-3 mb-2 text-[10px] font-extrabold uppercase tracking-widest text-slate-500">
            Navigation Menu
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-display font-semibold text-xs transition-all duration-200 cursor-pointer group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-500/25 border border-white/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-indigo-400/20 text-indigo-200 border border-indigo-400/30">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>


    </aside>
  );
};
