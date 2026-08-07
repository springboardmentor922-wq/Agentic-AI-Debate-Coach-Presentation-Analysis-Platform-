"""
Notification service for Email OTP, Mobile OTP, and password-reset delivery
(Milestone 1). Uses real SMTP / Twilio when credentials are configured;
otherwise falls back to a logged "development mode" delivery so the full
flow remains testable end-to-end without paid provider accounts, exactly as
the Milestone 1 spec calls for ("Mobile OTP - development mode if
credentials unavailable").
"""
import logging
import smtplib
from email.mime.text import MIMEText

import httpx

from app.core.config import settings

logger = logging.getLogger("notifications")
logging.basicConfig(level=logging.INFO)


def _smtp_configured() -> bool:
    return bool(settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD)


def _twilio_configured() -> bool:
    return bool(settings.TWILIO_ACCOUNT_SID and settings.TWILIO_AUTH_TOKEN and settings.TWILIO_FROM_NUMBER)


async def send_email(to_email: str, subject: str, body: str) -> dict:
    """
    Sends a real email via SMTP if configured, otherwise logs the message
    and returns it in the response payload (dev mode) so the flow can be
    verified without a mail server.
    """
    if not _smtp_configured():
        logger.info("[DEV MODE] Email to %s | %s\n%s", to_email, subject, body)
        return {"delivered": False, "mode": "dev", "to": to_email, "subject": subject, "body": body}

    message = MIMEText(body)
    message["Subject"] = subject
    message["From"] = settings.SMTP_FROM_EMAIL
    message["To"] = to_email

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_FROM_EMAIL, [to_email], message.as_string())
        return {"delivered": True, "mode": "smtp", "to": to_email}
    except Exception as exc:  # pragma: no cover - network/provider failure
        logger.error("SMTP delivery failed for %s: %s", to_email, exc)
        return {"delivered": False, "mode": "smtp_failed", "to": to_email, "error": str(exc)}


async def send_sms(to_phone: str, body: str) -> dict:
    """
    Sends a real SMS via Twilio's REST API if configured, otherwise logs the
    message and returns it in the response payload (dev mode).
    """
    if not _twilio_configured():
        logger.info("[DEV MODE] SMS to %s\n%s", to_phone, body)
        return {"delivered": False, "mode": "dev", "to": to_phone, "body": body}

    url = f"https://api.twilio.com/2010-04-01/Accounts/{settings.TWILIO_ACCOUNT_SID}/Messages.json"
    auth = (settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    data = {"From": settings.TWILIO_FROM_NUMBER, "To": to_phone, "Body": body}

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            resp = await client.post(url, data=data, auth=auth)
            resp.raise_for_status()
        return {"delivered": True, "mode": "twilio", "to": to_phone}
    except Exception as exc:  # pragma: no cover - network/provider failure
        logger.error("Twilio delivery failed for %s: %s", to_phone, exc)
        return {"delivered": False, "mode": "twilio_failed", "to": to_phone, "error": str(exc)}
