import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";

export default function Login() {

    const [email, setEmail] =useState("");
    const [password, setPassword] = useState("");

    const navigate = useNavigate();

    async function handleLogin(e) {
      e.preventDefault();

      const result = await loginUser({
          email,
          password,
      });

      console.log(result);

      if (result.access_token) {
          localStorage.setItem("token", result.access_token);

          alert("Login Successful!");

          navigate("/dashboard");
      }
      else {
          alert("Login Failed!");
      }
    }

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleLogin}>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />

                <br /><br />

                <button type="submit">
                    Login
                </button>

            </form>

        </div>
    );
}