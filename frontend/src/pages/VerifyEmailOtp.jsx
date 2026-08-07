import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

import { useAuth } from "../context/AuthContext";
import "./styles/VerifyEmailOtp.css";

const RESEND_COOLDOWN_SECONDS = 60;

export default function VerifyEmailOtp() {
  const location = useLocation();
  const navigate = useNavigate();

  const { verifyEmailOtp, resendEmailOtp } = useAuth();

  const email = location.state?.email;
  const initialExpiryMinutes = location.state?.otpExpiresInMinutes || 5;

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  const [secondsLeft, setSecondsLeft] = useState(initialExpiryMinutes * 60);

  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_SECONDS);

  const [devOtp, setDevOtp] = useState(location.state?.devOtpCode || "");

  const intervalRef = useRef(null);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
      setResendCooldown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, []);

  if (!email) {
    return (
      <div className="verify-page">
        <div className="verify-grid"></div>

        <div className="verify-glow glow-left"></div>

        <div className="verify-glow glow-right"></div>

        <div className="verify-card">
          <p className="verify-empty-text">
            We couldn't find a pending verification. Please register again.
          </p>

          <Link to="/register" className="verify-link">
            Back to Register
          </Link>
        </div>
      </div>
    );
  }

  const formatTime = (total) => {
    const minutes = Math.floor(total / 60);
    const seconds = total % 60;

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (otp.length !== 6) {
      setError("Enter the 6-digit code sent to your email.");
      return;
    }

    setVerifying(true);

    try {
      const user = await verifyEmailOtp(email, otp);

      setSuccess("Email verified! Redirecting...");

      setTimeout(() => {
        navigate(user?.role === "learner" ? "/learner" : "/login");
      }, 800);
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Verification failed. Please check the code and try again.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setSuccess("");
    setResending(true);

    try {
      const data = await resendEmailOtp(email);

      setSuccess("A new code has been sent to your email.");

      setSecondsLeft((data.otp_expires_in_minutes || 5) * 60);

      setResendCooldown(RESEND_COOLDOWN_SECONDS);

      setDevOtp(data.dev_otp_code || "");
    } catch (err) {
      setError(
        err.response?.data?.detail ||
          "Could not resend the code. Please try again.",
      );
    } finally {
      setResending(false);
    }
  };

  const expired = secondsLeft <= 0;
  return (
    <div className="verify-page">
      <div className="verify-grid"></div>

      <div className="verify-glow glow-left"></div>
      <div className="verify-glow glow-right"></div>

      <div className="verify-card">
        <div className="verify-header">
          <div className="verify-icon">
            <ShieldCheck size={22} />
          </div>

          <h1 className="verify-title">Verify your email</h1>

          <p className="verify-subtitle">
            Enter the 6-digit code we sent to
            <br />
            <strong>{email}</strong>
          </p>
        </div>

        {error && <div className="verify-error">{error}</div>}

        {success && (
          <div className="verify-success">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        {devOtp && (
          <div className="verify-dev">
            Dev mode (no email provider configured)
            <br />
            Your OTP:
            <strong> {devOtp}</strong>
          </div>
        )}

        <form onSubmit={handleVerify} className="verify-form">
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            placeholder="6-digit code"
            className="otp-input"
            value={otp}
            onChange={(e) =>
              setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))
            }
          />

          <p className="otp-timer">
            {expired
              ? "Code expired."
              : `Code expires in ${formatTime(secondsLeft)}`}
          </p>

          <button
            type="submit"
            disabled={verifying || expired}
            className="verify-btn"
          >
            {verifying ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending || resendCooldown > 0}
          className="resend-btn"
        >
          {resending
            ? "Resending..."
            : resendCooldown > 0
              ? `Resend code in ${resendCooldown}s`
              : "Resend OTP"}
        </button>

        <div className="verify-footer">
          <p>Wrong email?</p>

          <Link to="/register" className="verify-link">
            Start over
          </Link>
        </div>
      </div>
    </div>
  );
}
