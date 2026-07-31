function ScoreCard({ title, score }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-5 text-center border">
      <h3 className="text-gray-500 text-sm mb-2">{title}</h3>

      <p className="text-4xl font-bold text-blue-600">
        {score}
      </p>
    </div>
  );
}

export default ScoreCard;