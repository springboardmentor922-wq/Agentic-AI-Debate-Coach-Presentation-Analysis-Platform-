import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getCoachNotes } from "../../services/dashboardService";

function CoachNotes() {
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    const fetchNotes = async () => {
      const data = await getCoachNotes();
      setNotes(data);
    };

    fetchNotes();
  }, []);

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        📝 Coach Notes
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        {notes.length === 0 ? (
          <p>No notes available.</p>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <div
                key={note.note_id}
                className="border rounded-lg p-4"
              >
                <h3 className="font-semibold">
                  👨‍🎓 {note.learner_name}
                </h3>

                <p className="mt-2 text-gray-700">
                  {note.note}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default CoachNotes;