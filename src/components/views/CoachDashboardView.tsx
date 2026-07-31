import React from 'react';
import { Users, Clock, Award, AlertCircle } from 'lucide-react';
import { MOCK_COACH_DATA } from '../../data/mockData';

export const CoachDashboardView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-sky-400/30">
        <div className="space-y-1">
          <span className="text-white bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 font-bold text-xs uppercase tracking-wider shadow-xs">Coach Portal</span>
          <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Welcome, Coach Arjun Mehta 🎯</h2>
          <p className="text-sky-100 text-xs font-medium">Guiding 48 active debate mentees with AI-powered telemetry and performance auditing</p>
        </div>

        <div className="bg-white/15 backdrop-blur-md text-white font-bold px-4 py-2 rounded-xl text-xs border border-white/30 shadow-md">
          Top Performer: {MOCK_COACH_DATA.topPerformer}
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Mentees</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{MOCK_COACH_DATA.activeLearners}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Sessions Today</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{MOCK_COACH_DATA.sessionsToday}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Pending Reviews</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{MOCK_COACH_DATA.pendingEvaluations}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Mentee Avg Score</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{MOCK_COACH_DATA.avgClassScore}/100</p>
          </div>
        </div>
      </div>

      {/* Pending Evaluations Queue Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 font-bold text-slate-900 text-sm flex items-center justify-between">
          <span>Learner Review & Evaluation Queue</span>
          <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
            12 Awaiting Feedback
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Learner Name</th>
                <th className="p-3.5">Debate Topic</th>
                <th className="p-3.5">Submission Time</th>
                <th className="p-3.5">Type & Priority</th>
                <th className="p-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_COACH_DATA.evaluationQueue.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{item.learner}</td>
                  <td className="p-3.5 text-slate-700">{item.topic}</td>
                  <td className="p-3.5 text-slate-500">{item.Submitted}</td>
                  <td className="p-3.5 font-semibold text-indigo-700">{item.type} ({item.priority})</td>
                  <td className="p-3.5">
                    <button className="bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition-colors">
                      Review Turn Log
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
