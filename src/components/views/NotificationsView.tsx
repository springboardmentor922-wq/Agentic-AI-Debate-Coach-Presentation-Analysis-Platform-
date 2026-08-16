import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  MessageSquare, 
  Award, 
  Clock, 
  Trash2, 
  CheckCheck, 
  ArrowRight,
  Filter,
  Check,
  Zap
} from 'lucide-react';
import { NotificationItem } from '../../types';
import { useTheme } from '../../context/ThemeContext';
import { 
  getNotifications, 
  markNotificationAsRead, 
  markAllNotificationsAsRead, 
  deleteNotification, 
  clearAllNotifications 
} from '../../services/feedbackAndNotificationService';

interface NotificationsViewProps {
  onNavigate?: (tab: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ onNavigate }) => {
  const { isDark } = useTheme();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'coaching' | 'evaluation' | 'session'>('all');

  const loadNotifs = () => {
    setNotifications(getNotifications());
  };

  useEffect(() => {
    loadNotifs();

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setNotifications(e.detail);
      } else {
        loadNotifs();
      }
    };

    window.addEventListener('debate_notifications_updated', handleUpdate);
    return () => window.removeEventListener('debate_notifications_updated', handleUpdate);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const coachingCount = notifications.filter(n => n.type === 'coaching').length;
  const evalCount = notifications.filter(n => n.type === 'evaluation').length;
  const sessionCount = notifications.filter(n => n.type === 'session').length;

  const filteredNotifications = notifications.filter(n => {
    if (filterType === 'unread') return !n.read;
    if (filterType === 'coaching') return n.type === 'coaching';
    if (filterType === 'evaluation') return n.type === 'evaluation';
    if (filterType === 'session') return n.type === 'session';
    return true;
  });

  const handleItemClick = (n: NotificationItem) => {
    markNotificationAsRead(n.id);
    if (n.link && onNavigate) {
      onNavigate(n.link);
    }
  };

  const cardBgClass = isDark 
    ? 'bg-[#1E293B] border-slate-700/80 text-white shadow-xl' 
    : 'bg-white border-slate-200 text-slate-900 shadow-md';

  const textHeader = isDark ? 'text-white' : 'text-slate-900';
  const textSub = isDark ? 'text-slate-400' : 'text-slate-600';

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className={`p-6 rounded-2xl border ${cardBgClass} flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-lg shrink-0">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-800">
                Activity & Alerts Hub
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded-full border border-rose-800 animate-pulse">
                  {unreadCount} Unread
                </span>
              )}
            </div>
            <h2 className={`text-xl sm:text-2xl font-extrabold tracking-tight mt-1 ${textHeader}`}>
              Notifications Center
            </h2>
            <p className={`text-xs ${textSub} mt-0.5`}>
              Stay updated on coach feedback notes, AI debate evaluation reports, and live sparring milestones.
            </p>
          </div>
        </div>

        {/* Global Bulk Actions */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => markAllNotificationsAsRead()}
            disabled={unreadCount === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isDark 
                ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700' 
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
            }`}
          >
            <CheckCheck className="w-4 h-4" /> Mark All as Read
          </button>
          <button
            onClick={() => clearAllNotifications()}
            disabled={notifications.length === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
              isDark 
                ? 'bg-slate-800 hover:bg-rose-950 text-rose-300 border-slate-700 hover:border-rose-800' 
                : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200'
            }`}
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            filterType === 'all'
              ? 'bg-indigo-600 text-white shadow-md'
              : isDark ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-800' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          All Activity ({notifications.length})
        </button>

        <button
          onClick={() => setFilterType('unread')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            filterType === 'unread'
              ? 'bg-indigo-600 text-white shadow-md'
              : isDark ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-800' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          Unread ({unreadCount})
        </button>

        <button
          onClick={() => setFilterType('coaching')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            filterType === 'coaching'
              ? 'bg-purple-600 text-white shadow-md'
              : isDark ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-800' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Coach Feedback ({coachingCount})
        </button>

        <button
          onClick={() => setFilterType('evaluation')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            filterType === 'evaluation'
              ? 'bg-emerald-600 text-white shadow-md'
              : isDark ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-800' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          <Award className="w-3.5 h-3.5" /> AI Scores & Evaluations ({evalCount})
        </button>

        <button
          onClick={() => setFilterType('session')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
            filterType === 'session'
              ? 'bg-sky-600 text-white shadow-md'
              : isDark ? 'bg-slate-800/80 text-slate-300 hover:bg-slate-800' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Practice Sessions ({sessionCount})
        </button>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((n) => (
          <div
            key={n.id}
            className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
              !n.read
                ? isDark
                  ? 'bg-indigo-950/40 border-indigo-500/40 shadow-lg shadow-indigo-950/20'
                  : 'bg-indigo-50/70 border-indigo-200 shadow-sm'
                : cardBgClass
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Type Avatar */}
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                n.type === 'coaching'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                  : n.type === 'evaluation'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : n.type === 'session'
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {n.type === 'coaching' && <MessageSquare className="w-5 h-5" />}
                {n.type === 'evaluation' && <Award className="w-5 h-5" />}
                {n.type === 'session' && <Clock className="w-5 h-5" />}
                {n.type === 'system' && <Sparkles className="w-5 h-5" />}
              </div>

              {/* Text info */}
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className={`font-bold text-sm ${!n.read ? (isDark ? 'text-indigo-200' : 'text-indigo-950') : textHeader}`}>
                    {n.title}
                  </h3>
                  {!n.read && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500 text-white">
                      New
                    </span>
                  )}
                  {n.targetLearner && (
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                      isDark ? 'bg-slate-800 text-purple-300' : 'bg-purple-100 text-purple-700'
                    }`}>
                      For: {n.targetLearner}
                    </span>
                  )}
                </div>

                <p className={`text-xs leading-relaxed max-w-3xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  {n.message}
                </p>

                <div className="flex items-center gap-3 pt-1 text-[11px]">
                  <span className="text-indigo-400 font-medium font-mono">{n.timestamp}</span>
                  <span className="text-slate-400 capitalize">• Type: {n.type}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
              {!n.read && (
                <button
                  onClick={() => markNotificationAsRead(n.id)}
                  title="Mark as read"
                  className={`p-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                    isDark 
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                  }`}
                >
                  <Check className="w-4 h-4" />
                </button>
              )}

              {n.link && (
                <button
                  onClick={() => handleItemClick(n)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <span>Open</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}

              <button
                onClick={() => deleteNotification(n.id)}
                title="Delete notification"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {filteredNotifications.length === 0 && (
          <div className={`p-12 text-center rounded-2xl border ${cardBgClass} space-y-3`}>
            <Bell className="w-10 h-10 text-slate-400 mx-auto opacity-50" />
            <h4 className={`text-base font-bold ${textHeader}`}>No notifications found</h4>
            <p className={`text-xs ${textSub} max-w-sm mx-auto`}>
              {filterType === 'unread' 
                ? 'You are all caught up! No unread notifications at the moment.' 
                : 'No activity logs matching this filter category.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
