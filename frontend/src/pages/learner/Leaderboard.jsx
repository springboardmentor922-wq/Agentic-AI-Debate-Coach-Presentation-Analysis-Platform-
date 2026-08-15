import DashboardLayout from "../../layouts/DashboardLayout";

function Leaderboard() {
  const learners = [
    { rank: 1, name: "Neha", score: 92 },
    { rank: 2, name: "Rahul", score: 88 },
    { rank: 3, name: "Priya", score: 84 },
    { rank: 4, name: "Amit", score: 80 },
    { rank: 5, name: "Kiran", score: 78 },
  ];

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">
        🏆 Weekly Leaderboard
      </h1>

      <div className="bg-white rounded-xl shadow p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3">Rank</th>
              <th className="text-left py-3">Learner</th>
              <th className="text-left py-3">Score</th>
            </tr>
          </thead>

          <tbody>
            {learners.map((learner) => (
              <tr key={learner.rank} className="border-b">
                <td className="py-3">#{learner.rank}</td>
                <td>{learner.name}</td>
                <td>{learner.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </DashboardLayout>
  );
}

export default Leaderboard;