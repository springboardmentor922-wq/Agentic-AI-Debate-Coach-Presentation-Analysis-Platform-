import { Link } from "react-router-dom";
import { FaHome, FaUser, FaComments } from "react-icons/fa";

function Sidebar() {
  return (
    <div className="w-64 min-h-screen bg-green-700 text-white">

      <div className="text-3xl font-bold p-6 border-b border-green-600">
        Debate AI
      </div>

      <nav className="mt-8">

        <Link
          to="/learner"
          className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
        >
          <FaHome />
          Dashboard
        </Link>

        <Link
          to="/profile"
          className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
        >
          <FaUser />
          Profile
        </Link>

        <Link
          to="/debate"
          className="flex items-center gap-3 px-6 py-4 hover:bg-green-800"
        >
          <FaComments />
          Debate Session
        </Link>

      </nav>

    </div>
  );
}

export default Sidebar;