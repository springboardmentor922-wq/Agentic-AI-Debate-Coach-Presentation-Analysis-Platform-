import { useEffect, useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getDebateHistory } from "../../services/historyService";
import { deleteDebate } from "../../services/debateService";
import { toast } from "react-toastify";

function DebateHistory() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await getDebateHistory();
      setHistory(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load debate history");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this debate?"
    );

    if (!confirmDelete) return;

    try {
      await deleteDebate(id);

      toast.success("Debate deleted successfully");

      // Refresh history after delete
      fetchHistory();

    } catch (error) {
      console.error(error);
      toast.error("Failed to delete debate");
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        Debate History
      </h1>

      <div className="space-y-4">
        {history.length === 0 ? (
          <div className="bg-white rounded-xl shadow p-6">
            No debates found.
          </div>
        ) : (
          history.map((debate) => (
            <div
              key={debate.id}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <h2 className="text-xl font-bold">
                {debate.topic}
              </h2>

              <p className="text-gray-600 mt-2">
                <strong>Format:</strong> {debate.debate_format}
              </p>

              <p className="text-gray-600">
                <strong>Level:</strong> {debate.experience_level}
              </p>

              <p className="text-gray-600">
                <strong>Overall Score:</strong>{" "}
                {debate.argument_score?.overall_score}
              </p>

              <p className="text-gray-500 text-sm mt-3">
                {new Date(debate.created_at).toLocaleString()}
              </p>

              <button
                onClick={() => handleDelete(debate.id)}
                className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </DashboardLayout>
  );
}

export default DebateHistory;