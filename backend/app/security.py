import base64
import hashlib
import hmac
import secrets
from datetime import datetime, timedelta
from jose import jwt, JWTError
from passlib.context import CryptContext
from .core.config import JWT_SECRET_KEY

if not JWT_SECRET_KEY:
    raise RuntimeError("JWT_SECRET_KEY must be configured in backend/.env before starting the API.")

SECRET_KEY = JWT_SECRET_KEY
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60
ADMIN_ACCESS_TOKEN_EXPIRE_MINUTES = 15

pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


def hash_password(password):
    return pwd_context.hash(password)


def verify_password(password, hashed):
    return pwd_context.verify(password, hashed)


def create_access_token(data: dict, expires_minutes: int = ACCESS_TOKEN_EXPIRE_MINUTES):
    to_encode = data.copy()

    expire = datetime.utcnow() + timedelta(
        minutes=expires_minutes
    )

    to_encode.update({"exp": expire})

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


def verify_token(token: str):
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        return payload

    except JWTError:
        return None


def generate_totp_secret():
    return base64.b32encode(secrets.token_bytes(20)).decode("ascii").rstrip("=")


def get_totp_uri(secret: str, email: str):
    label = f"AI Debate Coach:{email}"
    return f"otpauth://totp/{label}?secret={secret}&issuer=AI%20Debate%20Coach&algorithm=SHA1&digits=6&period=30"


def verify_totp(secret: str, code: str, valid_window: int = 1):
    if not secret or not code or not code.isdigit() or len(code) != 6:
        return False
    padded_secret = secret.upper() + "=" * (-len(secret) % 8)
    try:
        key = base64.b32decode(padded_secret, casefold=True)
    except (ValueError, base64.binascii.Error):
        return False
    current_step = int(datetime.utcnow().timestamp() // 30)
    for step in range(current_step - valid_window, current_step + valid_window + 1):
        message = step.to_bytes(8, "big")
        digest = hmac.new(key, message, hashlib.sha1).digest()
        offset = digest[-1] & 0x0F
        value = (int.from_bytes(digest[offset:offset + 4], "big") & 0x7FFFFFFF) % 1_000_000
        if hmac.compare_digest(f"{value:06d}", code):
            return True
    return False
