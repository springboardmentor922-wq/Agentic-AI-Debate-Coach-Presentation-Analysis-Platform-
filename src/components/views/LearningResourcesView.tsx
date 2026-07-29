import React from 'react';
import { BookmarkCheck, ExternalLink, BookOpen, Video, FileText } from 'lucide-react';

export const LearningResourcesView: React.FC = () => {
  const resources = [
    { title: 'The Oxford Debate Format Guide', category: 'Guides', readTime: '10 min read', icon: BookOpen },
    { title: 'Mastering Logical Fallacy Audits', category: 'Video Lesson', readTime: '15 min watch', icon: Video },
    { title: 'Public Speaking Pace & WPM Mastery', category: 'Article', readTime: '8 min read', icon: FileText },
    { title: 'Building Watertight Rebuttal Trees', category: 'Masterclass', readTime: '20 min watch', icon: Video },
  ];

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <BookmarkCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Curated Learning Resources</h2>
            <p className="text-xs text-slate-500">Master rhetoric, debate formats, and public speaking techniques</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((res, i) => {
          const Icon = res.icon;
          return (
            <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3 hover:border-indigo-200 transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                  {res.category}
                </span>
                <span className="text-xs text-slate-400">{res.readTime}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <Icon className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{res.title}</span>
              </h3>
              <button className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1">
                Open Resource <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
