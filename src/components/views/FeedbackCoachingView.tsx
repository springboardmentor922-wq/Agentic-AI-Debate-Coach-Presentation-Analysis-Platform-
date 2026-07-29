import React from 'react';
import { Sparkles, CheckCircle2, UserCheck } from 'lucide-react';
import { MOCK_COACHING_PLANS } from '../../data/mockData';

export const FeedbackCoachingView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Personalized Coaching & Feedback Plans</h2>
            <p className="text-xs text-slate-500">Curated by Recommendation & Coaching Agent in sync with Coach Arjun Mehta</p>
          </div>
        </div>
      </div>

      {/* Active Plans List */}
      <div className="space-y-6">
        {MOCK_COACHING_PLANS.map((plan) => (
          <div key={plan.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  Focus: {plan.focusArea}
                </span>
                <h3 className="font-bold text-slate-900 text-lg mt-2">{plan.title}</h3>
                <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <UserCheck className="w-3.5 h-3.5 text-indigo-600" /> Assigned by {plan.learnerName || 'Coach Arjun Mehta'} • Target Date: {plan.targetDate}
                </p>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-700">Completion: {plan.progressPercent}%</span>
                <div className="w-36 h-2 bg-slate-100 rounded-full mt-1 overflow-hidden">
                  <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${plan.progressPercent}%` }} />
                </div>
              </div>
            </div>

            {/* Recommended Drills Checklist */}
            <div className="space-y-2">
              <p className="text-xs font-bold text-slate-800">Action Drills Checklist</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {plan.drills.map((drill) => (
                  <div key={drill.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2 text-xs text-slate-800 font-medium">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${drill.completed ? 'text-emerald-600' : 'text-slate-300'}`} />
                    <div className="flex-1">
                      <p className={drill.completed ? 'line-through text-slate-400' : 'text-slate-800'}>{drill.title}</p>
                      <span className="text-[10px] text-slate-400 font-semibold">{drill.type.toUpperCase()} • {drill.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
