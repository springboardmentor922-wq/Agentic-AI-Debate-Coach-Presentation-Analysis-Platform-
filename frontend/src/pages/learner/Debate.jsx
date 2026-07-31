import { useState } from "react";
import DashboardLayout from "../../layouts/DashboardLayout";
import { processDebate } from "../../services/debateService";
import ScoreCard from "../../components/debate/ScoreCard";
import FeedbackCard from "../../components/debate/FeedbackCard";
function Debate() {
  const [topic, setTopic] = useState("");
  const [debateFormat, setDebateFormat] = useState("One-on-One Debate");
  const [experienceLevel, setExperienceLevel] = useState("Beginner");
  const [argument, setArgument] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      const response = await processDebate({
        topic,
        debate_format: debateFormat,
        experience_level: experienceLevel,
        user_argument: argument,
      });

      setResult(response);
    } catch (error) {
      console.error(error);

      if (error.response) {
        console.log(error.response.data);
        alert(JSON.stringify(error.response.data, null, 2));
      } else {
        alert("Failed to process debate.");
      }
    }

    setLoading(false);
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        Start New Debate
      </h1>

      <div className="bg-white rounded-xl shadow-lg p-6">

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Topic */}

          <div>
            <label className="block mb-2 font-medium">
              Debate Topic
            </label>

            <input
              type="text"
              className="w-full border rounded-lg px-4 py-3"
              placeholder="Enter Debate Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>

          {/* Debate Format */}

          <div>
            <label className="block mb-2 font-medium">
              Debate Format
            </label>

            <select
              className="w-full border rounded-lg px-4 py-3"
              value={debateFormat}
              onChange={(e) => setDebateFormat(e.target.value)}
            >
              <option>One-on-One Debate</option>
              <option>Oxford Debate</option>
              <option>Parliamentary Debate</option>
              <option>Policy Debate</option>
              <option>Public Forum</option>
              <option>AI Debate Simulation</option>
            </select>
          </div>

          {/* Experience */}

          <div>
            <label className="block mb-2 font-medium">
              Experience Level
            </label>

            <select
              className="w-full border rounded-lg px-4 py-3"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
            >
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>

          {/* Argument */}

          <div>
            <label className="block mb-2 font-medium">
              Your Argument
            </label>

            <textarea
              rows="8"
              className="w-full border rounded-lg px-4 py-3"
              placeholder="Write your argument..."
              value={argument}
              onChange={(e) => setArgument(e.target.value)}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? "Processing..." : "Submit Argument"}
          </button>

        </form>

        {/* Results */}
        {result && (
  <div className="mt-10 space-y-8">

    {/* AI Response */}

    <FeedbackCard title="🤖 AI Counter Argument">
      <p className="text-gray-700 leading-7">
        {result.ai_response}
      </p>
    </FeedbackCard>

    {/* Scores */}

    <FeedbackCard title="📊 Argument Scores">

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">

        <ScoreCard
          title="Logic"
          score={result.argument_score.logic_score}
        />

        <ScoreCard
          title="Clarity"
          score={result.argument_score.clarity_score}
        />

        <ScoreCard
          title="Evidence"
          score={result.argument_score.evidence_score}
        />

        <ScoreCard
          title="Persuasiveness"
          score={result.argument_score.persuasiveness_score}
        />

        <ScoreCard
          title="Relevance"
          score={result.argument_score.relevance_score}
        />

        <ScoreCard
          title="Confidence"
          score={result.argument_score.confidence_score}
        />

        <ScoreCard
          title="Overall"
          score={result.argument_score.overall_score}
        />

      </div>

    </FeedbackCard>

    {/* Fallacy */}

    <FeedbackCard title="⚠️ Fallacy Detection">
      <p className="text-gray-700">
        {result.fallacy_report}
      </p>
    </FeedbackCard>

    {/* Coaching */}

    <FeedbackCard title="🎯 Coaching Feedback">

      <h3 className="font-semibold mb-2">
        Strengths
      </h3>

      <ul className="list-disc ml-6 mb-5">

        {result.coaching_feedback.strengths.length > 0
          ? result.coaching_feedback.strengths.map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )
          : <li>No strengths available.</li>}

      </ul>

      <h3 className="font-semibold mb-2">
        Areas to Improve
      </h3>

      <ul className="list-disc ml-6 mb-5">

        {result.coaching_feedback.areas_to_improve.length > 0
          ? result.coaching_feedback.areas_to_improve.map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )
          : <li>No suggestions available.</li>}

      </ul>

      <h3 className="font-semibold mb-2">
        Next Challenge
      </h3>

      <p>
        {result.coaching_feedback.next_challenge || "No challenge assigned."}
      </p>
      <h3 className="font-semibold mt-6 mb-2">
  🎤 Speaking Tips
</h3>

<ul className="list-disc ml-6 space-y-2">
  {result.coaching_feedback.speaking_tips &&
  result.coaching_feedback.speaking_tips.length > 0 ? (
    result.coaching_feedback.speaking_tips.map((tip, index) => (
      <li key={index}>{tip}</li>
    ))
  ) : (
    <li>No speaking tips available.</li>
  )}
</ul>

    </FeedbackCard>

  </div>
)}


      </div>
    </DashboardLayout>
  );
}

export default Debate;