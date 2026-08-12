import React from 'react';
import { HelpCircle, MessageSquare, Mail, BookOpen } from 'lucide-react';

export const HelpSupportView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Help & Support Center</h2>
            <p className="text-xs text-slate-500">Need assistance with AI Debate Simulation or presentation recording?</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-indigo-600" /> Ask AI Debate Coach
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Click the floating AI Chatbot button at the bottom-right corner of any page for real-time guidance across all 8 AI agents.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Mail className="w-4 h-4 text-indigo-600" /> Contact Support Team
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Email our educational debate technology team at <strong>support@aidebatecoach.com</strong> for assistance.
          </p>
        </div>
      </div>
    </div>
  );
};
