import React from 'react';
import { Users, GraduationCap, Trophy, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { MOCK_EDUCATOR_DATA } from '../../data/mockData';

export const EducatorDashboardView: React.FC = () => {
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444'];

  const distribution = [
    { name: 'Above 85', value: 42 },
    { name: '70-84', value: 58 },
    { name: '50-69', value: 22 },
    { name: 'Below 50', value: 6 }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Educator Welcome Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1">
          <span className="text-indigo-400 font-bold text-xs uppercase tracking-wider">Educator Command Center</span>
          <h2 className="text-2xl font-bold tracking-tight">Welcome, Dr. Ananya Sharma 🎓</h2>
          <p className="text-slate-300 text-xs">Managing 8 debate classes, 128 registered learners, and AI skill assessment models</p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-xs font-bold text-indigo-200">
          Academic Term: Spring 2025
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Total Learners</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{MOCK_EDUCATOR_DATA.totalLearners}</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">Across 8 Classes</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Active Classes</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{MOCK_EDUCATOR_DATA.activeClasses}</p>
            <p className="text-[11px] font-semibold text-indigo-600 mt-0.5">3 Curriculum Formats</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Completed Debates</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{MOCK_EDUCATOR_DATA.debatesConducted}</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">AI Evaluated</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Avg Class Score</p>
            <p className="text-2xl font-bold text-slate-900 mt-0.5">{MOCK_EDUCATOR_DATA.avgClassScore}/100</p>
            <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">+4.2% this term</p>
          </div>
        </div>
      </div>

      {/* Class Overview Chart & Performance Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Class Score Comparison</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={MOCK_EDUCATOR_DATA.myClasses}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }} />
                <Bar dataKey="avgScore" fill="#6366f1" radius={[8, 8, 0, 0]} name="Average Score" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Score Distribution Donut */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-base">Score Distribution</h3>
          <div className="h-52 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={distribution} innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                  {distribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {distribution.map((d, i) => (
              <div key={i} className="flex items-center gap-1.5 font-medium text-slate-700">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                <span>{d.name}: {d.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Classes Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 font-bold text-slate-900 text-sm">
          Managed Debate Classes
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Class Name</th>
                <th className="p-3.5">Learners Count</th>
                <th className="p-3.5">Avg Score</th>
                <th className="p-3.5">Improvement Trend</th>
                <th className="p-3.5">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {MOCK_EDUCATOR_DATA.myClasses.map((c, i) => (
                <tr key={i} className="hover:bg-slate-50/70 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">{c.name}</td>
                  <td className="p-3.5 font-medium">{c.learners} Students</td>
                  <td className="p-3.5 font-bold text-indigo-600">{c.avgScore}/100</td>
                  <td className="p-3.5 text-emerald-600 font-bold">{c.trend}%</td>
                  <td className="p-3.5">
                    <button className="text-xs font-semibold text-indigo-600 hover:underline">
                      Manage Roster →
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
