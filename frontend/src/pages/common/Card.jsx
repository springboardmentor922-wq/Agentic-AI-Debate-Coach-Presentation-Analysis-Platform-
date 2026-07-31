function Card({ title, value }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 hover:shadow-xl transition duration-300 border border-gray-100">
      <h3 className="text-gray-500 text-sm font-medium">
        {title}
      </h3>

      <p className="text-4xl font-bold text-blue-600 mt-4">
        {value}
      </p>
    </div>
  );
}

export default Card;