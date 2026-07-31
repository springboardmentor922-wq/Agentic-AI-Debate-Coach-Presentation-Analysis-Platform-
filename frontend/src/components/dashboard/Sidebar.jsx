import { NavLink, useNavigate } from "react-router-dom";
import {
  learnerMenu,
  coachMenu,
  educatorMenu,
  adminMenu,
} from "../../constants/sidebarMenu";

function Sidebar() {
  const navigate = useNavigate();

  const role = Number(localStorage.getItem("role_id"));

  let menu = learnerMenu;

  if (role === 2) {
    menu = coachMenu;
  } else if (role === 3) {
    menu = educatorMenu;
  } else if (role === 4) {
    menu = adminMenu;
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role_id");
    navigate("/");
  };

  return (
    <aside className="w-64 min-h-screen bg-slate-900 text-white flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-blue-400">
          Debate Coach
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          AI Debate Platform
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menu.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `block rounded-lg px-4 py-3 transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "hover:bg-slate-800 text-slate-300"
                  }`
                }
              >
                {item.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-4">
        <button
          onClick={handleLogout}
          className="w-full rounded-lg bg-red-600 py-3 hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700 text-center text-sm text-slate-400">
        Version 1.0
      </div>

    </aside>
  );
}

export default Sidebar;