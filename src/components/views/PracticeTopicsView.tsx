import React, { useState } from 'react';
import { BookOpen, Search, ArrowRight, Sparkles, Filter } from 'lucide-react';
import { MOCK_PRACTICE_TOPICS } from '../../data/mockData';

interface PracticeTopicsViewProps {
  onStartPractice: (topicTitle: string) => void;
}

export const PracticeTopicsView: React.FC<PracticeTopicsViewProps> = ({ onStartPractice }) => {
  const [selectedCat, setSelectedCat] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Technology', 'Environment', 'Society', 'Politics'];

  const filteredTopics = MOCK_PRACTICE_TOPICS.filter((t) => {
    const matchesCat = selectedCat === 'All' || t.category === selectedCat;
    const matchesQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || t.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Debate Practice Topics Repository</h2>
              <p className="text-xs text-slate-500">Explore topics across categories or launch direct practice drills with AI</p>
            </div>
          </div>

          <div className="flex items-center relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics or keywords..."
              className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCat(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedCat === cat
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Topics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTopics.map((topic) => (
          <div key={topic.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4 hover:border-indigo-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                  {topic.category}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  topic.difficulty === 'Beginner' ? 'bg-emerald-100 text-emerald-800' : (topic.difficulty === 'Intermediate' ? 'bg-amber-100 text-amber-800' : 'bg-purple-100 text-purple-800')
                }`}>
                  {topic.difficulty}
                </span>
              </div>

              <h3 className="font-bold text-slate-900 text-base">{topic.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{topic.description}</p>

              <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs">
                <p className="font-bold text-slate-800 text-[11px]">Key Arguments FOR:</p>
                <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5">
                  {topic.keyArgumentsFor.map((arg, i) => <li key={i}>{arg}</li>)}
                </ul>
              </div>
            </div>

            <button
              onClick={() => onStartPractice(topic.title)}
              className="w-full bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 transition-all border border-indigo-200"
            >
              <span>Practice This Topic in AI Arena</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
