import { useEffect, useRef } from "react";

export default function RecaptchaCheckbox({ onVerify }) {
  const containerRef = useRef(null);
  const renderedRef = useRef(false);

  useEffect(() => {
    const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

    const render = () => {
      if (renderedRef.current) return;
      if (!window.grecaptcha || !window.grecaptcha.render || !containerRef.current) return;
      if (containerRef.current.hasChildNodes()) return;

      renderedRef.current = true;
      window.grecaptcha.render(containerRef.current, {
        sitekey: siteKey,
        callback: (token) => onVerify(token),
        "expired-callback": () => onVerify(null),
      });
    };

    if (window.grecaptcha && window.grecaptcha.render) {
      render();
    } else {
      const interval = setInterval(() => {
        if (window.grecaptcha && window.grecaptcha.render) {
          clearInterval(interval);
          render();
        }
      }, 100);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} />;
}