import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";

function AdminLogin() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post("/users/admin-login", {
        email,
        password,
      });

      localStorage.setItem("token", response.data.access_token);
      localStorage.setItem("role", response.data.role);

      navigate("/admin");
    } catch (err) {
      alert("Invalid administrator credentials");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">

      <form
        onSubmit={login}
        className="bg-white shadow-lg p-8 rounded-lg w-96"
      >

        <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
          Administrator Login
        </h1>

        <input
          className="border p-3 w-full mb-4 rounded"
          placeholder="Email"
          onChange={(e)=>setEmail(e.target.value)}
        />

        <input
          className="border p-3 w-full mb-6 rounded"
          type="password"
          placeholder="Password"
          onChange={(e)=>setPassword(e.target.value)}
        />

        <button
          className="bg-green-700 text-white w-full p-3 rounded"
        >
          Login
        </button>

      </form>

    </div>
  );
}

export default AdminLogin;