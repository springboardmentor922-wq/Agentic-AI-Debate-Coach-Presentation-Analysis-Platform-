import React from 'react';
import { ShieldCheck, Cpu, Activity } from 'lucide-react';
import { MOCK_ADMIN_DATA } from '../../data/mockData';

export const AdminDashboardView: React.FC = () => {
  return (
    <div className="space-y-6 pb-12">
      <div className="bg-gradient-to-r from-sky-600 via-indigo-600 to-blue-700 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 border border-sky-400/30">
        <div className="space-y-1">
          <span className="text-white bg-white/20 px-2.5 py-0.5 rounded-full border border-white/30 font-bold text-xs uppercase tracking-wider flex items-center gap-1 shadow-xs">
            <ShieldCheck className="w-4 h-4 text-emerald-300" /> System Administrator
          </span>
          <h2 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">Platform Operations & Telemetry ⚙️</h2>
          <p className="text-sky-100 text-xs font-medium">Monitoring 8 AI Agents, Gemini API quotas, database synchronization, and user activity</p>
        </div>

        <div className="bg-emerald-400/20 text-emerald-100 font-bold px-4 py-2 rounded-xl text-xs border border-emerald-300/40 shadow-md">
          Platform Status: 100% Operational
        </div>
      </div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Users</p>
          <p className="text-xl font-extrabold text-slate-900 mt-1">{MOCK_ADMIN_DATA.totalUsers}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Learners</p>
          <p className="text-xl font-extrabold text-indigo-600 mt-1">{MOCK_ADMIN_DATA.learnersCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Coaches</p>
          <p className="text-xl font-extrabold text-purple-600 mt-1">{MOCK_ADMIN_DATA.coachesCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Educators</p>
          <p className="text-xl font-extrabold text-amber-600 mt-1">{MOCK_ADMIN_DATA.educatorsCount}</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Debates</p>
          <p className="text-xl font-extrabold text-emerald-600 mt-1">{MOCK_ADMIN_DATA.debatesConducted}</p>
        </div>
      </div>

      {/* Agent Telemetry & System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-600" /> 8 Specialized AI Agents Health
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="font-medium text-slate-800">Agent 1: Logical Fallacy Referee</span>
              <span className="text-emerald-600 font-bold">0.0 Temp • 18ms Latency</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="font-medium text-slate-800">Agent 2: Rival Opponent Player</span>
              <span className="text-indigo-600 font-bold">0.7 Temp • 42ms Latency</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="font-medium text-slate-800">Argument Analysis Agent</span>
              <span className="text-emerald-600 font-bold">Optimal</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl">
              <span className="font-medium text-slate-800">Speech & Presentation Analytics</span>
              <span className="text-emerald-600 font-bold">Optimal</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-600" /> System Architecture & Databases
          </h3>
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 rounded-xl text-emerald-900">
              <span className="font-medium">PostgreSQL Relational DB</span>
              <span className="font-bold">Tabular Metrics Connected</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-indigo-50 rounded-xl text-indigo-900">
              <span className="font-medium">MongoDB Chat Logs DB</span>
              <span className="font-bold">JSON Logs Streamed</span>
            </div>
            <div className="flex items-center justify-between p-2.5 bg-purple-50 rounded-xl text-purple-900">
              <span className="font-medium">Gemini 2.5 AI Pipeline</span>
              <span className="font-bold">Schema Enforcement Active</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
