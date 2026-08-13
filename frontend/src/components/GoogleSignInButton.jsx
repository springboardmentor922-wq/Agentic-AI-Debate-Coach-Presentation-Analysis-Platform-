import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function GoogleSignInButton() {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const buttonRef = useRef(null);

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

    const initialize = () => {
      if (!window.google || !clientId) return;

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: async (response) => {
          try {
            await loginWithGoogle(response.credential);
            navigate("/dashboard");
          } catch (err) {
            console.error("Google sign-in failed", err);
          }
        },
      });

      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
      });
    };

    if (window.google) {
      initialize();
    } else {
      const interval = setInterval(() => {
        if (window.google) {
          clearInterval(interval);
          initialize();
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [loginWithGoogle, navigate]);

  return <div ref={buttonRef} className="flex justify-center" />;
}