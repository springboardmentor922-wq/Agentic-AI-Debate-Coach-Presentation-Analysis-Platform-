import React, { useState } from 'react';
import { Search, Bell, CheckCircle2, ChevronDown, Menu, UserPlus, LogOut, UserCheck, Shield, Sparkles, Sun, Moon } from 'lucide-react';
import { UserRole, UserProfile } from '../../types';
import { useTheme } from '../../context/ThemeContext';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
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
  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);
  const [showUserPopover, setShowUserPopover] = useState(false);

  return (
    <header className="h-16 bg-[#1E293B] border-b border-slate-700/50 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-md">
      {/* Mobile Hamburger Toggle & Title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <button
          onClick={onToggleMobileSidebar}
          className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-xl transition-colors shrink-0"
          title="Toggle Navigation Drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-md shrink-0">
          DC
        </div>

        <h1 className="text-sm sm:text-base lg:text-lg font-semibold tracking-tight text-white truncate max-w-[140px] sm:max-w-xs md:max-w-none">
          {title}
        </h1>
        <span className="text-slate-400 font-mono text-xs hidden xl:inline-block shrink-0">
          v2.4.0-orchestrator
        </span>
      </div>

      {/* Telemetry Status Badges */}
      <div className="hidden xl:flex items-center gap-3 text-xs font-mono shrink-0">
        <div className="flex items-center gap-2 px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> POSTGRES: ACTIVE
        </div>
        <div className="flex items-center gap-2 px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
          <span className="w-2 h-2 rounded-full bg-blue-500"></span> MONGODB: CONNECTED
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="hidden md:flex items-center relative w-36 lg:w-56 shrink-0">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
        <input
          type="text"
          placeholder="Search arguments, topics..."
          className="w-full pl-9 pr-3 py-1.5 bg-slate-900/80 border border-slate-700/80 rounded-lg text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-slate-900 transition-all"
        />
      </div>

      {/* Right Actions: Theme Toggle, Role Switcher, Notifications, Profile */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Light / Dark Sky Mood Toggle Button */}
        <button
          onClick={toggleTheme}
          id="theme-toggle-btn"
          className={`p-2 rounded-lg transition-all shadow-sm border ${
            isDark
              ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-300 border-slate-700'
              : 'bg-sky-100 hover:bg-sky-200 text-sky-900 border-sky-300'
          }`}
          aria-label={isDark ? "Switch to Light Sky Mood" : "Switch to Dark Mood"}
          title={isDark ? "Switch to Light Sky Mood" : "Switch to Dark Mood"}
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-600 shrink-0" />
          )}
        </button>

        {/* Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className={`flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border shadow-xs ${
              isDark
                ? 'bg-slate-800/90 hover:bg-slate-700 text-slate-200 border-slate-700'
                : 'bg-sky-50 hover:bg-sky-100 text-slate-800 border-sky-300'
            }`}
            title="Switch Dashboard Perspective"
          >
            <span className={isDark ? "text-slate-400 hidden md:inline" : "text-slate-600 hidden md:inline"}>Perspective:</span>
            <span className={`font-bold capitalize ${isDark ? "text-indigo-400" : "text-sky-800"}`}>{currentRole}</span>
            <ChevronDown className={`w-3.5 h-3.5 ${isDark ? "text-slate-400" : "text-slate-600"}`} />
          </button>

          {showRoleMenu && (
            <div className={`absolute right-0 mt-2 w-56 rounded-xl shadow-2xl border py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
              isDark ? 'bg-slate-800 border-slate-700 text-slate-200' : 'bg-white border-sky-300 text-slate-800'
            }`}>
              <div className={`px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wider ${
                isDark ? 'text-slate-400' : 'text-slate-500'
              }`}>
                Switch View Role
              </div>
              {(['learner', 'coach', 'educator', 'admin'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  onClick={() => {
                    onRoleChange(r);
                    setShowRoleMenu(false);
                  }}
                  className={`w-full px-3 py-2 text-left text-xs font-medium flex items-center justify-between transition-colors ${
                    isDark
                      ? (currentRole === r ? 'bg-indigo-600/20 text-indigo-400 font-semibold' : 'text-slate-200 hover:bg-indigo-600/30 hover:text-indigo-300')
                      : (currentRole === r ? 'bg-sky-100 text-sky-900 font-bold' : 'text-slate-700 hover:bg-sky-50 hover:text-sky-900')
                  }`}
                >
                  <span className="capitalize">{r} Dashboard</span>
                  {currentRole === r && <CheckCircle2 className={`w-3.5 h-3.5 ${isDark ? 'text-indigo-400' : 'text-sky-600'}`} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Notifications Popover Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowNotifPopover(!showNotifPopover)}
            className="relative p-2 text-slate-300 hover:text-indigo-400 hover:bg-slate-800 rounded-lg transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-slate-900">
              5
            </span>
          </button>

          {showNotifPopover && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 p-4 z-50">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
                <span className="font-semibold text-sm text-white">System Notifications</span>
                <span className="text-xs text-indigo-400 font-medium">5 New</span>
              </div>
              <div className="space-y-2.5 text-xs">
                <div className="p-2.5 bg-indigo-950/60 rounded-lg border border-indigo-800/60">
                  <p className="font-medium text-slate-200">Policy Debate Practice</p>
                  <p className="text-slate-400 mt-0.5">Session starts in 2 hours. Agent 1 Referee ready.</p>
                  <span className="text-[10px] text-indigo-400 font-semibold mt-1 block">10 mins ago</span>
                </div>
                <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/60">
                  <p className="font-medium text-slate-200">New AI Evaluation Score</p>
                  <p className="text-slate-400 mt-0.5">Your argument logic received 85/100.</p>
                  <span className="text-[10px] text-slate-500 mt-1 block">1 hour ago</span>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowNotifPopover(false);
                  onNavigateNotifications();
                }}
                className="w-full text-center text-xs text-indigo-400 font-semibold hover:underline mt-3 block"
              >
                View All Notifications →
              </button>
            </div>
          )}
        </div>

        {/* Active User Profile Badge & Account Switcher Menu */}
        <div className="relative pl-2 sm:pl-3 border-l border-slate-700/80 shrink-0">
          <button
            onClick={() => setShowUserPopover(!showUserPopover)}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity text-left group"
            title="Account Options & Profile Management"
          >
            <div className="text-right flex flex-col justify-center hidden sm:flex">
              <div className="flex items-center gap-1.5">
                <p className="text-xs font-semibold leading-snug text-slate-100 whitespace-nowrap group-hover:text-indigo-300">
                  {activeUser.name}
                </p>
                {activeUser.isCustomAccount && (
                  <span className="text-[9px] px-1 py-0.2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded font-mono">
                    User
                  </span>
                )}
              </div>
              <p className="text-[11px] font-medium leading-tight text-indigo-400 whitespace-nowrap">
                {activeUser.roleLabel}
              </p>
            </div>
            <div className="relative shrink-0">
              <img
                src={activeUser.avatar}
                alt={activeUser.name}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover ring-2 ring-indigo-500/40 border border-slate-700 shadow-sm"
              />
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-900" />
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-colors" />
          </button>

          {/* User Account Popover */}
          {showUserPopover && (
            <div className="absolute right-0 mt-2 w-72 bg-[#1E293B] border border-slate-700/90 rounded-2xl shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              {/* User info card */}
              <div className="flex items-center gap-3 pb-3 border-b border-slate-700/80">
                <img
                  src={activeUser.avatar}
                  alt={activeUser.name}
                  className="w-11 h-11 rounded-full object-cover ring-2 ring-indigo-500/50"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-white truncate">{activeUser.name}</p>
                  <p className="text-xs text-indigo-400 font-medium truncate">{activeUser.roleLabel}</p>
                  <p className="text-[11px] text-slate-400 truncate mt-0.5">{activeUser.email}</p>
                  {activeUser.institution && (
                    <p className="text-[10px] text-slate-400 truncate italic">@{activeUser.institution}</p>
                  )}
                </div>
              </div>

              {/* Quick Profile Switching List */}
              {existingUsers.length > 0 && onSelectUser && (
                <div className="mt-3 border-t border-slate-800 pt-3">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">Quick Switch Profile</p>
                  <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                    {existingUsers.map((usr) => (
                      <button
                        key={usr.id}
                        onClick={() => {
                          onSelectUser(usr);
                          setShowUserPopover(false);
                        }}
                        className={`w-full p-1.5 rounded-lg flex items-center gap-2 text-left text-xs transition-colors ${
                          activeUser.id === usr.id
                            ? 'bg-indigo-600/30 text-white font-semibold border border-indigo-500/40'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <img src={usr.avatar} alt={usr.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate leading-none text-[11px]">{usr.name}</p>
                          <p className="text-[9px] text-indigo-400 capitalize leading-tight">{usr.roleLabel}</p>
                        </div>
                        {activeUser.id === usr.id && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-3 space-y-1.5 text-xs">
                <button
                  onClick={() => {
                    setShowUserPopover(false);
                    onOpenAuthModal();
                  }}
                  className="w-full py-2 px-3 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 font-semibold rounded-xl border border-indigo-500/30 flex items-center justify-between transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-indigo-400" />
                    Register New Profile
                  </span>
                  <span className="text-[10px] bg-indigo-500/30 px-1.5 py-0.5 rounded text-indigo-200">+ New</span>
                </button>

                <button
                  onClick={() => {
                    setShowUserPopover(false);
                    onOpenAuthModal();
                  }}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl border border-slate-700 flex items-center gap-2 transition-colors"
                >
                  <UserCheck className="w-4 h-4 text-emerald-400" />
                  Switch Active Account
                </button>

                {onLogout && (
                  <button
                    onClick={() => {
                      setShowUserPopover(false);
                      onLogout();
                    }}
                    className="w-full py-2 px-3 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-medium rounded-xl border border-rose-500/20 flex items-center gap-2 transition-colors mt-2"
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


