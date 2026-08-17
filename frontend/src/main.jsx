import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import "./styles/theme.css";

createRoot(document.getElementById("root")).render(

    <StrictMode>

        <AuthProvider>

            <App />

        </AuthProvider>

    </StrictMode>

);
