import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";

export default function Report() {
  const { id } = useParams();

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, []);

  async function fetchReport() {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/analysis/history/${id}`
      );

      setReport(response.data);
    } catch (err) {
      console.log(err);
      alert("Unable to load report.");
    } finally {
      setLoading(false);
    }
  }

  if (loading)
    return (
      <div className="text-center mt-10 text-xl">
        Loading Report...
      </div>
    );

  if (!report)
    return (
      <div className="text-center mt-10 text-xl">
        Report not found.
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-6">

      <div className="max-w-5xl mx-auto">

        <h1 className="text-4xl font-bold text-green-700 text-center">
          Debate Analysis Report
        </h1>

        <div className="bg-white rounded-xl shadow-lg p-6 mt-8">

          <h2 className="text-2xl font-bold">
            ⭐ Overall Score
          </h2>

          <p
            className={`text-5xl font-bold mt-4 ${
              report.overall_score >= 8
                ? "text-green-600"
                : report.overall_score >= 5
                ? "text-yellow-500"
                : "text-red-500"
            }`}
          >
            {report.overall_score}/10
          </p>

        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">

          <h2 className="text-2xl font-bold text-gray-800">
            Your Argument
          </h2>

          <p className="mt-3">
            {report.argument}
          </p>

        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">

          <h2 className="text-2xl font-bold text-red-600">
            Logical Fallacy
          </h2>

          <p className="font-semibold mt-4">
            {report.fallacy_type}
          </p>

          <p className="mt-3">
            {report.explanation}
          </p>

        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">

          <h2 className="text-2xl font-bold text-blue-600">
            Counter Argument
          </h2>

          <p className="mt-4">
            {report.counter_argument}
          </p>

        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 mt-6">

          <h2 className="text-2xl font-bold text-purple-600">
            Feedback
          </h2>

          <p className="mt-4">
            {report.feedback}
          </p>

        </div>

        <div className="mt-8 text-center">

          <Link
            to="/learner/history"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700"
          >
            Back to History
          </Link>

        </div>

      </div>

    </div>
  );
}