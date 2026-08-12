import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, CheckCircle2, ChevronDown, Menu, UserPlus, LogOut, Shield, Sparkles, Sun, Moon } from 'lucide-react';
import { UserRole, UserProfile } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange?: (role: UserRole) => void;
  title?: string;
  onNavigateNotifications: () => void;
  onToggleMobileSidebar?: () => void;
  activeUser: UserProfile;
  onOpenAuthModal: () => void;
  onLogout?: () => void;
  existingUsers?: UserProfile[];
  onSelectUser?: (user: UserProfile) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  title = 'Learner Dashboard',
  onNavigateNotifications,
  onToggleMobileSidebar,
  activeUser,
  onOpenAuthModal,
  onLogout,
  existingUsers = [],
  onSelectUser
}) => {
  const { toggleTheme, isDark } = useTheme();
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showUserPopover, setShowUserPopover] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifPopover(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setShowUserPopover(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className={`h-16 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors border-b ${
      isDark 
        ? 'bg-[#1E293B] border-slate-700/50 text-white shadow-md' 
        : 'bg-white border-slate-200 text-slate-900 shadow-xs'
    }`}>
      {/* Mobile Hamburger Toggle & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className={`lg:hidden p-2 rounded-xl transition-colors shrink-0 ${
            isDark ? 'text-slate-300 hover:text-white hover:bg-slate-800' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Toggle Navigation Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md shrink-0">
          DC
        </div>

        <h1 className={`text-sm sm:text-base lg:text-lg font-semibold tracking-tight truncate max-w-[140px] sm:max-w-xs md:max-w-none ${
          isDark ? 'text-white' : 'text-slate-900'
        }`}>
          {title}
        </h1>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center relative w-36 lg:w-56 shrink-0">
        <Search className={`w-4 h-4 absolute left-3 pointer-events-none ${
          isDark ? 'text-slate-400' : 'text-slate-500'
        }`} />
        <input
          type="text"
          placeholder="Search arguments, topics..."
          className={`w-full pl-9 pr-3 py-1.5 rounded-lg text-xs transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
            isDark 
              ? 'bg-slate-900/80 border border-slate-700/80 text-slate-200 placeholder-slate-400 focus:bg-slate-900' 
              : 'bg-slate-100 border border-slate-300 text-slate-800 placeholder-slate-500 focus:bg-white'
          }`}
        />
      </div>

      {/* Right Actions: Theme Toggle, Role Switcher, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Light / Dark Sky Mood Toggle Button */}
        <button
          onClick={toggleTheme}
          id="theme-toggle-btn"
          className={`p-2 rounded-lg transition-all shadow-xs border ${
            isDark
              ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-slate-700'
              : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
          }`}
          aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
          )}
        </button>

        {/* Notifications Popover Trigger */}
        <div ref={notifRef} className="relative">
          <button
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            className={`relative p-2 rounded-lg transition-colors ${
              isDark ? 'text-slate-300 hover:text-indigo-400 hover:bg-slate-800' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-100'
            }`}
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900">
              5
            </span>
          </button>

          {showNotifPopover && (
            <div className={`absolute right-0 mt-2 w-72 sm:w-80 rounded-xl shadow-2xl border p-4 z-50 ${
              isDark ? 'bg-slate-900 border-slate-700 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              <div className={`flex items-center justify-between mb-3 pb-2 border-b ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-slate-900'}`}>System Notifications</span>
                <span className="text-xs text-indigo-500 font-medium">5 New</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className={`p-2.5 rounded-lg border ${
                  isDark ? 'bg-indigo-950/60 border-indigo-800/60' : 'bg-indigo-50 border-indigo-200'
                }`}>
                  <p className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>Policy Debate Practice</p>
                  <p className={`mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Session starts in 2 hours. Agent 1 Referee ready.</p>
                  <span className="text-[10px] text-indigo-500 font-semibold mt-1 block">10 mins ago</span>
                </div>
                <div className={`p-2.5 rounded-lg border ${
                  isDark ? 'bg-slate-800/80 border-slate-700/60' : 'bg-slate-50 border-slate-200'
                }`}>
                  <p className={`font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>New AI Evaluation Score</p>
                  <p className={`mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Your argument logic received 85/100.</p>
                  <span className={`text-[10px] mt-1 block ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>1 hour ago</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowNotifPopover(false);
                  onNavigateNotifications();
                }}
                className="w-full text-center text-xs text-indigo-500 font-semibold hover:underline mt-3 block"
              >
                View All Notifications →
              </button>
            </div>
          )}
        </div>

        {/* Active User Profile Badge & Account Switcher Menu */}
        <div ref={userRef} className={`relative pl-2 sm:pl-3 border-l shrink-0 ${
          isDark ? 'border-slate-700/80' : 'border-slate-200'
        }`}>
          <button
            onClick={() => setShowUserPopover(!showUserPopover)}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity text-left group"
            title="Account Options & Profile Management"
          >
            <div className="text-right flex flex-col justify-center hidden sm:flex">
              <div className="flex items-center gap-1.5">
                <p className={`text-xs font-semibold leading-snug whitespace-nowrap ${
                  isDark ? 'text-slate-100 group-hover:text-indigo-300' : 'text-slate-800 group-hover:text-indigo-600'
                }`}>
                  {activeUser.name}
                </p>
                {activeUser.isCustomAccount && (
                  <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded font-mono font-bold">
                    User
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium leading-tight text-indigo-500 whitespace-nowrap">
                {activeUser.roleLabel}
              </p>
            </div>
            <div className="relative shrink-0">
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-indigo-500/40 border border-slate-300 dark:border-slate-700 shadow-xs"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900" />
            </div>
            <ChevronDown className={`w-3.5 h-3.5 transition-colors ${
              isDark ? 'text-slate-400 group-hover:text-white' : 'text-slate-500 group-hover:text-slate-900'
            }`} />
          </button>

          {/* User Account Popover */}
          {showUserPopover && (
            <div className={`absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl p-4 z-50 border animate-in fade-in slide-in-from-top-2 duration-150 ${
              isDark ? 'bg-[#1E293B] border-slate-700/90 text-slate-200' : 'bg-white border-slate-200 text-slate-800'
            }`}>
              {/* User info card */}
              <div className={`flex items-center gap-3 pb-3 border-b ${
                isDark ? 'border-slate-700/80' : 'border-slate-200'
              }`}>
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/50"
                />
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-bold truncate ${isDark ? 'text-white' : 'text-slate-900'}`}>{activeUser.name}</p>
                  <p className="text-xs text-indigo-500 font-medium truncate">{activeUser.roleLabel}</p>
                  <p className={`text-[11px] truncate mt-0.5 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{activeUser.email}</p>
                  {activeUser.institution && (
                    <p className={`text-[10px] truncate italic ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>@{activeUser.institution}</p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className={`mt-3 space-y-1.5 text-xs border-t pt-3 ${
                isDark ? 'border-slate-800' : 'border-slate-200'
              }`}>
                <button
                  onClick={() => {
                    setShowUserPopover(false);
                    onOpenAuthModal();
                  }}
                  className={`w-full py-2 px-3 font-semibold rounded-xl border flex items-center justify-between transition-colors ${
                    isDark 
                      ? 'bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border-indigo-500/30'
                      : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-indigo-500" />
                    Register New Profile
                  </span>
                  <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-600 font-bold">+ New</span>
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowUserPopover(false);
                      onLogout();
                    }}
                    className="w-full py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 font-medium rounded-xl border border-rose-500/20 flex items-center gap-2 transition-colors mt-2"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out Session
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};


