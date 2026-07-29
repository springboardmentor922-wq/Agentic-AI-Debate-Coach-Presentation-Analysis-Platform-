import React, { useState } from 'react';
import { Trophy, Calendar, Plus, ChevronRight } from 'lucide-react';
import { MOCK_DEBATE_SESSIONS } from '../../data/mockData';

interface MyDebatesViewProps {
  onStartNewDebate: () => void;
}

export const MyDebatesView: React.FC<MyDebatesViewProps> = ({ onStartNewDebate }) => {
  const [activeFilter, setActiveFilter] = useState<'All' | 'Completed' | 'Scheduled'>('All');

  const filtered = activeFilter === 'All' 
    ? MOCK_DEBATE_SESSIONS 
    : MOCK_DEBATE_SESSIONS.filter(s => activeFilter === 'Completed' ? s.score !== undefined : s.score === undefined);

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Debates History</h2>
              <p className="text-xs text-slate-500">Track and review all completed and upcoming debate rounds</p>
            </div>
          </div>

          <button
            onClick={() => onStartNewDebate()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all self-start"
          >
            <Plus className="w-4 h-4" /> Start New AI Debate
          </button>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          {(['All', 'Completed', 'Scheduled'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                activeFilter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Debates List */}
      <div className="space-y-4">
        {filtered.map((session) => (
          <div key={session.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-indigo-200 transition-colors">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-100">
                  {session.format}
                </span>
                <span className="text-xs font-medium text-slate-500">• Side: {session.side}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base">{session.title}</h3>
              <p className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> {session.date}
              </p>
            </div>

            <div className="flex items-center gap-4">
              {session.score !== undefined ? (
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-medium">Score</span>
                  <p className="text-xl font-extrabold text-indigo-600">{session.score}<span className="text-xs text-slate-400">/100</span></p>
                </div>
              ) : (
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  Scheduled
                </span>
              )}

              <button
                onClick={() => onStartNewDebate()}
                className="p-2.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-xl transition-colors text-slate-600"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
