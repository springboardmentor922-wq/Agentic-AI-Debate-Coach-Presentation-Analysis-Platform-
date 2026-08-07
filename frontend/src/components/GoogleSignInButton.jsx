import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let gsiScriptPromise = null;

function loadGoogleScript() {
  if (gsiScriptPromise) return gsiScriptPromise;

  gsiScriptPromise = new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();

    const script = document.createElement("script");

    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;

    script.onload = resolve;

    script.onerror = () =>
      reject(new Error("Failed to load Google Identity Services"));

    document.head.appendChild(script);
  });

  return gsiScriptPromise;
}

export default function GoogleSignInButton({
  onError,
  homePathByRole = { learner: "/learner" },
}) {
  const buttonRef = useRef(null);

  const { googleLogin } = useAuth();

  const navigate = useNavigate();

  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    let cancelled = false;

    const handleCredentialResponse = async (response) => {
      try {
        const user = await googleLogin(response.credential);

        const dest = homePathByRole[user.role] || "/";

        navigate(dest);
      } catch (err) {
        onError?.(
          err.response?.data?.detail ||
            "Google sign-in failed. Please try again.",
        );
      }
    };

    loadGoogleScript()
      .then(() => {
        if (cancelled || !window.google?.accounts?.id) return;

        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        });

        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            theme: "outline",
            size: "large",
            width: 320,
            text: "continue_with",
            shape: "pill",
          });
        }

        setReady(true);
      })
      .catch(() =>
        onError?.(
          "Could not load Google sign-in. Check your connection and try again.",
        ),
      );

    return () => {
      cancelled = true;
    };
  }, []);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div
      ref={buttonRef}
      className={
        ready
          ? `
            flex items-center justify-center
          `
          : `
            h-10 w-full
            animate-pulse
            rounded-full

            border border-brand-500/20

            bg-gradient-to-r
            from-brand-500/10
            via-purple-500/10
            to-accent-500/10

            shadow-glass

            dark:border-white/10
            dark:from-brand-500/20
            dark:via-purple-500/20
            dark:to-accent-500/20
          `
      }
    />
  );
}
