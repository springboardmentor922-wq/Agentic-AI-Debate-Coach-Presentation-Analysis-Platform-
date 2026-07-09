import { useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");

    navigate("/");
  };

  return (
    <div className="bg-white shadow px-8 py-4 flex justify-between">

      <h2 className="text-2xl font-semibold">
        Learner Dashboard
      </h2>

      <button
        onClick={handleLogout}
        className="bg-green-700 hover:bg-green-800 text-white px-5 py-2 rounded-lg"
      >
        Logout
      </button>

    </div>
  );
}

export default Navbar;