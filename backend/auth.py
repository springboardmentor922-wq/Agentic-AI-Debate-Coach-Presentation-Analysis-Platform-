import base64
import hashlib
import hmac
import json
import os
import random
import secrets
import smtplib
import time
from email.mime.text import MIMEText


SECRET_KEY = "milestone-one-local-secret"
TOKEN_TTL_SECONDS = 60 * 60 * 12
OTP_TTL_SECONDS = 60 * 5


def hash_password(password, salt=None):
    salt = salt or secrets.token_hex(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt.encode("utf-8"), 100_000)
    return f"{salt}${digest.hex()}"


def verify_password(password, stored_hash):
    salt, _ = stored_hash.split("$", 1)
    return hmac.compare_digest(hash_password(password, salt), stored_hash)


def _b64encode(data):
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64decode(data):
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def create_token(user):
    payload = {
        "sub": user["id"],
        "email": user["email"],
        "role": user["role"],
        "exp": int(time.time()) + TOKEN_TTL_SECONDS,
    }
    body = _b64encode(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signature = hmac.new(SECRET_KEY.encode("utf-8"), body.encode("ascii"), hashlib.sha256).digest()
    return f"{body}.{_b64encode(signature)}"


def decode_token(token):
    try:
        body, signature = token.split(".", 1)
        expected = hmac.new(SECRET_KEY.encode("utf-8"), body.encode("ascii"), hashlib.sha256).digest()
        if not hmac.compare_digest(_b64decode(signature), expected):
            return None
        payload = json.loads(_b64decode(body))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None


# ---------------------------------------------------------------------------
# OTP (one-time passcode) login support
# ---------------------------------------------------------------------------

def generate_otp():
    """Generates a 6-digit numeric one-time login code."""
    return f"{random.randint(0, 999999):06d}"


def send_otp_email(to_email, code):
    """Emails a login code to the user.

    Reads SMTP settings from environment variables:
      SMTP_HOST, SMTP_PORT (default 587), SMTP_USER, SMTP_PASSWORD, SMTP_FROM

    If SMTP isn't configured (e.g. local/dev environment), the code is
    printed to the server console instead so the login flow still works
    end-to-end without real email credentials.
    """
    subject = "Your Debate Coach login code"
    body = (
        f"Your one-time login code is {code}.\n"
        f"It expires in {OTP_TTL_SECONDS // 60} minutes. "
        "If you didn't request this, you can ignore this email."
    )

    smtp_host = os.environ.get("SMTP_HOST")
    smtp_user = os.environ.get("SMTP_USER")
    smtp_password = os.environ.get("SMTP_PASSWORD")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_from = os.environ.get("SMTP_FROM", smtp_user or "no-reply@debatecoach.local")

    if not smtp_host or not smtp_user or not smtp_password:
        print(f"[DEV OTP] Login code for {to_email}: {code}")
        return False

    message = MIMEText(body)
    message["Subject"] = subject
    message["From"] = smtp_from
    message["To"] = to_email

    with smtplib.SMTP(smtp_host, smtp_port) as server:
        server.starttls()
        server.login(smtp_user, smtp_password)
        server.sendmail(smtp_from, [to_email], message.as_string())
    return True