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
  Zap,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Target,
  FileText,
  UserCheck,
  Layers,
  Activity
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
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

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

  const handleOpenNotificationModal = (n: NotificationItem) => {
    markNotificationAsRead(n.id);
    setSelectedNotification(n);
  };

  const handleDirectNavigate = (n: NotificationItem, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    markNotificationAsRead(n.id);
    if (n.link && onNavigate) {
      onNavigate(n.link);
    }
  };

  const toggleExpandCard = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedCardIds(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
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
              Inspect coach feedback notes, AI debate evaluation reports, and live sparring milestones.
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
        {filteredNotifications.map((n) => {
          const isExpanded = !!expandedCardIds[n.id];
          return (
            <div
              key={n.id}
              onClick={() => handleOpenNotificationModal(n)}
              className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:border-indigo-500/60 ${
                !n.read
                  ? isDark
                    ? 'bg-indigo-950/40 border-indigo-500/40 shadow-lg shadow-indigo-950/20'
                    : 'bg-indigo-50/70 border-indigo-200 shadow-sm'
                  : cardBgClass
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
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
                  <div className="space-y-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className={`font-bold text-sm ${!n.read ? (isDark ? 'text-indigo-200' : 'text-indigo-950') : textHeader}`}>
                        {n.title}
                      </h3>
                      {!n.read && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500 text-white shadow-xs">
                          New
                        </span>
                      )}
                      {n.source && (
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-semibold ${
                          isDark ? 'bg-slate-800 text-sky-300' : 'bg-sky-100 text-sky-700'
                        }`}>
                          {n.source}
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
                  {/* Open / Inspect Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenNotificationModal(n);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                    title="Open full notification report & details"
                  >
                    <span>Open</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Direct Jump to Module */}
                  {n.link && (
                    <button
                      onClick={(e) => handleDirectNavigate(n, e)}
                      title={`Go to ${n.link}`}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1 cursor-pointer ${
                        isDark 
                          ? 'bg-slate-800 hover:bg-slate-700 text-indigo-300 border-slate-700' 
                          : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Go to Module</span>
                    </button>
                  )}

                  {!n.read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        markNotificationAsRead(n.id);
                      }}
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

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n.id);
                    }}
                    title="Delete notification"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Inline Quick Expand Snippet (if available) */}
              {n.details && (
                <div className="mt-3 pt-3 border-t border-slate-200/40 dark:border-slate-800/80">
                  <button
                    onClick={(e) => toggleExpandCard(n.id, e)}
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    {isExpanded ? (
                      <>
                        <ChevronUp className="w-3 h-3" /> Hide Breakdown Preview
                      </>
                    ) : (
                      <>
                        <ChevronDown className="w-3 h-3" /> Preview Full Feedback & Telemetry
                      </>
                    )}
                  </button>

                  {isExpanded && (
                    <div className="mt-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-xs space-y-3 animate-in fade-in duration-150">
                      <p className="text-slate-300 leading-relaxed">{n.details}</p>
                      
                      {n.metrics && n.metrics.length > 0 && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {n.metrics.map((m, idx) => (
                            <div key={idx} className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                              <p className="text-[10px] text-slate-400 font-medium">{m.label}</p>
                              <p className="text-xs font-bold text-white mt-0.5">{m.value}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}

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

      {/* FULL NOTIFICATION DETAIL MODAL / INSPECTOR */}
      {selectedNotification && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200">
          <div className={`w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border shadow-2xl p-6 space-y-5 animate-in zoom-in-95 duration-200 ${
            isDark ? 'bg-[#1E293B] border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-700/50">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  selectedNotification.type === 'coaching'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                    : selectedNotification.type === 'evaluation'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : selectedNotification.type === 'session'
                    ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}>
                  {selectedNotification.type === 'coaching' && <MessageSquare className="w-5 h-5" />}
                  {selectedNotification.type === 'evaluation' && <Award className="w-5 h-5" />}
                  {selectedNotification.type === 'session' && <Clock className="w-5 h-5" />}
                  {selectedNotification.type === 'system' && <Sparkles className="w-5 h-5" />}
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-950/80 px-2.5 py-0.5 rounded-full border border-indigo-800">
                      {selectedNotification.type} Alert
                    </span>
                    {selectedNotification.source && (
                      <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded-full border border-sky-800">
                        {selectedNotification.source}
                      </span>
                    )}
                    {selectedNotification.targetLearner && (
                      <span className="text-[10px] font-semibold text-purple-300 bg-purple-950/80 px-2 py-0.5 rounded-full border border-purple-800">
                        Learner: {selectedNotification.targetLearner}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold mt-1 text-white">
                    {selectedNotification.title}
                  </h3>
                  <p className="text-xs text-indigo-400 font-mono mt-0.5">
                    Received: {selectedNotification.timestamp}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedNotification(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification Summary */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                Notification Summary
              </p>
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {selectedNotification.message}
              </p>
            </div>

            {/* Detailed Content / Critique ("What is under this notification") */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Comprehensive Analysis & Feedback Notes
              </h4>
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 leading-relaxed space-y-3">
                <p>
                  {selectedNotification.details || selectedNotification.message}
                </p>
              </div>
            </div>

            {/* Live Metrics Telemetry */}
            {selectedNotification.metrics && selectedNotification.metrics.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Key Telemetry & Scores
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {selectedNotification.metrics.map((m, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1">
                      <p className="text-[10px] font-semibold text-slate-400">{m.label}</p>
                      <p className="text-sm font-bold text-white">{m.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Actionable Takeaways */}
            {selectedNotification.keyTakeaways && selectedNotification.keyTakeaways.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-amber-400" />
                  Actionable Steps & Strategic Takeaways
                </h4>
                <div className="space-y-1.5">
                  {selectedNotification.keyTakeaways.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 p-2.5 rounded-xl bg-slate-900/50 border border-slate-800 text-xs text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-700/50">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => {
                    deleteNotification(selectedNotification.id);
                    setSelectedNotification(null);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-500/10 border border-rose-500/20 transition-all flex items-center justify-center gap-1.5 w-full sm:w-auto cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-all cursor-pointer w-full sm:w-auto text-center"
                >
                  Close
                </button>

                {selectedNotification.link && (
                  <button
                    onClick={() => {
                      const targetLink = selectedNotification.link;
                      setSelectedNotification(null);
                      if (onNavigate && targetLink) {
                        onNavigate(targetLink);
                      }
                    }}
                    className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                  >
                    <span>{selectedNotification.actionLabel || 'Launch in Workspace'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

