import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../components/Layout";
import api from "../api/axios";

function CoachLearners() {
  const [learners, setLearners] = useState([]);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const [notesFor, setNotesFor] = useState(null);
  const [notes, setNotes] = useState([]);
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");

  useEffect(() => {
    api.get("/coach/learners").then((res) => setLearners(res.data)).catch(() => setError("Could not load your learners."));
  }, []);

  const filtered = learners.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) || l.email.toLowerCase().includes(search.toLowerCase())
  );

  const openNotes = async (learner) => {
    setNotesFor(learner);
    const res = await api.get(`/coach/learner-notes/${learner._id}`).catch(() => ({ data: [] }));
    setNotes(res.data);
  };

  const saveNote = async () => {
    if (!noteTitle.trim()) return;
    await api.post(`/coach/learner-notes/${notesFor._id}`, { title: noteTitle, content: noteContent }).catch(() => {});
    setNoteTitle(""); setNoteContent("");
    const res = await api.get(`/coach/learner-notes/${notesFor._id}`).catch(() => ({ data: [] }));
    setNotes(res.data);
  };

  return (
    <Layout>
      <h2 className="text-2xl font-bold mb-2">Learners</h2>
      <p className="text-gray-500 mb-4">Everyone currently assigned to you for coaching.</p>

      {error && <p className="text-red-400 mb-4">{error}</p>}

      <input
        value={search} onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name or email..."
        className="w-full max-w-md bg-[#1a1a2b] border border-white/10 rounded-lg px-4 py-3 mb-6 text-sm"
      />

      {filtered.length === 0 ? (
        <p className="text-gray-500">No learners match.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((l) => (
            <div key={l._id} className="bg-[#1a1a2b] border border-white/5 rounded-2xl p-5">
              <p className="font-semibold">{l.name}</p>
              <p className="text-gray-500 text-sm mb-3">{l.email}</p>
              <p className="text-gray-400 text-sm mb-4">Experience: {l.experience}</p>
              <div className="flex gap-3">
                <Link to={`/reports?learner=${l._id}`} className="text-purple-400 hover:text-purple-300 text-sm font-medium">Review →</Link>
                <button onClick={() => openNotes(l)} className="text-gray-400 hover:text-gray-200 text-sm font-medium">Add Notes</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {notesFor && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={() => setNotesFor(null)}>
          <div className="bg-[#1a1a2b] border border-white/10 rounded-2xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold mb-4">Notes about {notesFor.name}</h3>
            <input value={noteTitle} onChange={(e) => setNoteTitle(e.target.value)} placeholder="Title"
              className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-2 mb-3 text-sm" />
            <textarea value={noteContent} onChange={(e) => setNoteContent(e.target.value)} placeholder="Note..."
              className="w-full bg-[#0f0f1a] border border-white/10 rounded-lg px-4 py-2 mb-3 text-sm min-h-[80px]" />
            <button onClick={saveNote} className="bg-purple-600 hover:bg-purple-700 transition text-white text-sm font-semibold px-4 py-2 rounded-lg mb-4">
              Save Note
            </button>
            <div className="space-y-2 max-h-[200px] overflow-y-auto">
              {notes.map((n) => (
                <div key={n._id} className="bg-[#0f0f1a] rounded-lg p-3 text-sm">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-gray-400 text-xs">{n.content}</p>
                </div>
              ))}
            </div>
            <button onClick={() => setNotesFor(null)} className="text-gray-500 hover:text-gray-300 text-sm mt-4">Close</button>
          </div>
        </div>
      )}
    </Layout>
  );
}

export default CoachLearners;
