import React from 'react';
import { Bell, CheckCircle2, AlertTriangle, Sparkles } from 'lucide-react';

export const NotificationsView: React.FC = () => {
  const notifications = [
    { id: 1, title: 'Policy Debate Practice', desc: 'Session starts in 2 hours. AI Fallacy Checker ready.', time: '10 mins ago', type: 'session' },
    { id: 2, title: 'New AI Evaluation Score', desc: 'Your argument logic received 85/100.', time: '1 hour ago', type: 'score' },
    { id: 3, title: 'Coach Feedback Posted', desc: 'Coach Arjun Mehta reviewed your social media debate turn log.', time: '3 hours ago', type: 'feedback' },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Notifications Center</h2>
            <p className="text-xs text-slate-500">Stay updated on upcoming sessions, AI feedback, and mentor evaluations</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {notifications.map((n) => (
          <div key={n.id} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <p className="font-bold text-slate-900 text-xs">{n.title}</p>
              <p className="text-xs text-slate-600">{n.desc}</p>
              <span className="text-[10px] text-indigo-600 font-semibold">{n.time}</span>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
          </div>
        ))}
      </div>
    </div>
  );
};
