import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function History() {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    const filtered = history.filter((item) =>
      item.argument.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredHistory(filtered);
  }, [search, history]);

  async function fetchHistory() {
    try {
      const response = await axios.get(
        "http://127.0.0.1:8000/analysis/history"
      );

      setHistory(response.data);
      setFilteredHistory(response.data);
    } catch (err) {
      console.error(err);
      alert("Unable to load history.");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center text-2xl font-semibold">
        Loading History...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">
      <div className="max-w-6xl mx-auto">

        <h1 className="text-4xl font-bold text-center text-green-700 mb-2">
          Debate Analysis History
        </h1>

        <p className="text-center text-gray-600 mb-8">
          View all your previous AI debate analyses.
        </p>

        {/* Search */}

        <input
          type="text"
          placeholder="Search by argument..."
          className="w-full p-3 rounded-lg border mb-8 focus:outline-none focus:ring-2 focus:ring-green-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-10 text-center text-lg">
            No debate history found.
          </div>
        ) : (
          <div className="grid gap-6">

            {filteredHistory.map((item) => (

              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition"
              >

                <div className="flex justify-between items-center">

                  <h2 className="text-2xl font-bold">
                    Analysis #{item.id}
                  </h2>

                  <span
                    className={`px-4 py-2 rounded-full text-white font-semibold ${
                      item.overall_score >= 8
                        ? "bg-green-600"
                        : item.overall_score >= 5
                        ? "bg-yellow-500"
                        : "bg-red-600"
                    }`}
                  >
                    {item.overall_score}/10
                  </span>

                </div>

                <div className="mt-5">

                  <h3 className="font-semibold text-lg">
                    Your Argument
                  </h3>

                  <p className="text-gray-700 mt-2">
                    {item.argument.length > 180
                      ? item.argument.substring(0, 180) + "..."
                      : item.argument}
                  </p>

                </div>

                <div className="mt-5">

                  <p>
                    <strong>Logical Fallacy:</strong>{" "}
                    {item.fallacy_type || "None"}
                  </p>

                </div>

                <div className="mt-4">

                  <p className="font-semibold">
                    Counter Argument
                  </p>

                  <p className="text-gray-700 mt-2">
                    {item.counter_argument.length > 150
                      ? item.counter_argument.substring(0, 150) + "..."
                      : item.counter_argument}
                  </p>

                </div>

                <div className="mt-6 flex gap-4">

                  <Link
                    to={`/learner/report/${item.id}`}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition"
                  >
                    View Full Report
                  </Link>

                </div>

              </div>

            ))}

          </div>
        )}
      </div>
    </div>
  );
}