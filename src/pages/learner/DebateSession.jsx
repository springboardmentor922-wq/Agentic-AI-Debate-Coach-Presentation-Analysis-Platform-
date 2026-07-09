import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function DebateSession() {

  const navigate = useNavigate();

  const [debate, setDebate] = useState({
    topic: "",
    difficulty: "",
  });

  const handleChange = (e) => {
    setDebate({
      ...debate,
      [e.target.name]: e.target.value,
    });
  };

  const handleStart = async (e) => {
    e.preventDefault();

    try {

      await api.post("/debates/", debate);

      alert("Debate Session Created!");

      navigate("/learner");

    } catch (error) {
      console.log(error);
      alert("Failed to create debate.");
    }

  };

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center items-center">

      <div className="bg-white p-10 rounded-xl shadow-lg w-full max-w-xl">

        <h1 className="text-3xl font-bold text-green-700 mb-8">
          Start New Debate
        </h1>

        <form onSubmit={handleStart} className="space-y-6">

          <div>

            <label className="font-semibold">
              Debate Topic
            </label>

            <select
              name="topic"
              value={debate.topic}
              onChange={handleChange}
              className="w-full mt-2 border rounded-lg p-3"
            >
              <option value="">Select Topic</option>

              <option>Climate Change</option>

              <option>Artificial Intelligence</option>

              <option>Renewable Energy</option>

              <option>Social Media</option>

              <option>Cryptocurrency</option>

              <option>Online Education</option>

              <option>Space Exploration</option>

            </select>

          </div>

          <div>

            <label className="font-semibold">
              Difficulty
            </label>

            <select
              name="difficulty"
              value={debate.difficulty}
              onChange={handleChange}
              className="w-full mt-2 border rounded-lg p-3"
            >
              <option value="">Select Difficulty</option>

              <option>Beginner</option>

              <option>Intermediate</option>

              <option>Advanced</option>

            </select>

          </div>

          <button
            type="submit"
            className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg font-semibold"
          >
            Start Debate
          </button>

        </form>

      </div>

    </div>
  );
}

export default DebateSession;