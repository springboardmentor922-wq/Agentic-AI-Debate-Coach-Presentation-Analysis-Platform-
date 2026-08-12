import React, { useState } from 'react';
import { StickyNote, Plus, Trash2, Edit3 } from 'lucide-react';

export const MyNotesView: React.FC = () => {
  const [notes, setNotes] = useState([
    { id: 1, title: 'Oxford Debate Opening Rule', body: 'Always define core motion key terms within the first 60 seconds.', date: 'May 18, 2025' },
    { id: 2, title: 'Fixing Straw Man Fallacies', body: 'Never oversimplify opponent claim. Restate their strongest point before refuting.', date: 'May 15, 2025' }
  ]);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');

  const handleAddNote = () => {
    if (!newTitle.trim()) return;
    setNotes(prev => [
      { id: Date.now(), title: newTitle, body: newBody, date: 'Today' },
      ...prev
    ]);
    setNewTitle('');
    setNewBody('');
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md">
            <StickyNote className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Debate Scratchpad & Notes</h2>
            <p className="text-xs text-slate-500">Save personal strategies, definitions, and speech takeaways</p>
          </div>
        </div>

        <div className="space-y-2 pt-2 border-t border-slate-100">
          <input
            type="text"
            placeholder="Note Title..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800"
          />
          <textarea
            rows={2}
            placeholder="Note Content..."
            value={newBody}
            onChange={(e) => setNewBody(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 resize-none"
          />
          <button
            onClick={handleAddNote}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Save Note
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {notes.map((n) => (
          <div key={n.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">{n.title}</h3>
              <span className="text-[10px] text-slate-400">{n.date}</span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">{n.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
