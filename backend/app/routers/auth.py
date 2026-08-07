from datetime import datetime, timedelta
import logging
import random
import secrets
from urllib.parse import urlencode

import httpx
from bson import ObjectId
from fastapi import APIRouter, HTTPException, status, Depends

from app.core.database import users_collection, otp_codes_collection, password_reset_tokens_collection
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token, decode_token
from bson.errors import InvalidId

from app.core.config import settings
from app.schemas.user import UserRegister, UserLogin, TokenResponse, UserOut, RefreshRequest, UserRole
from app.schemas.auth_extra import (
    ForgotPasswordRequest,
    ResetPasswordRequest,
    EmailOTPRequest,
    EmailOTPVerify,
    MobileOTPRequest,
    MobileOTPVerify,
    RegisterResponse,
    VerifyRegistrationOTPRequest,
    ResendRegistrationOTPRequest,
    GoogleLoginRequest,
)
from app.core.deps import get_current_user
from app.services.notification_service import send_email, send_sms

logger = logging.getLogger("auth")

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

REGISTRATION_OTP_PURPOSE = "registration_email_verification"


def _serialize_user(user: dict) -> UserOut:
    return UserOut(
        id=str(user["_id"]),
        full_name=user["full_name"],
        email=user["email"],
        role=user["role"],
        experience_level=user.get("experience_level"),
        preferred_debate_topics=user.get("preferred_debate_topics", []),
        presentation_domains=user.get("presentation_domains", []),
        learning_goals=user.get("learning_goals", []),
        coaching_preferences=user.get("coaching_preferences"),
        avatar_url=user.get("avatar_url"),
        institution=user.get("institution"),
        department=user.get("department"),
        year=user.get("year"),
        phone_number=user.get("phone_number"),
        bio=user.get("bio"),
        email_verified=user.get("email_verified", False),
        phone_verified=user.get("phone_verified", False),
        is_active=user.get("is_active", True),
        plan=user.get("plan", "free"),
        auth_provider=user.get("auth_provider", "local"),
        created_at=user.get("created_at"),
    )


def _generate_registration_otp() -> str:
    return f"{random.randint(0, 999999):06d}"


async def _issue_registration_otp(email: str) -> tuple[str, dict]:
    """Creates and emails a fresh 6-digit registration OTP, hashed at rest
    with a 5-minute expiry. Returns the raw code (for dev-mode echoing) and
    the notification delivery result."""
    code = _generate_registration_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=settings.REGISTRATION_OTP_EXPIRE_MINUTES)

    await otp_codes_collection.insert_one(
        {
            "target": email,
            "purpose": REGISTRATION_OTP_PURPOSE,
            "code_hash": hash_password(code),
            "expires_at": expires_at.isoformat(),
            "verified": False,
            "created_at": datetime.utcnow().isoformat(),
        }
    )

    delivery = await send_email(
        to_email=email,
        subject="Verify your AI Debate Coach account",
        body=(
            f"Your verification code is {code}. It expires in "
            f"{settings.REGISTRATION_OTP_EXPIRE_MINUTES} minutes.\n\n"
            f"If you didn't try to create an account, you can ignore this email."
        ),
    )
    return code, delivery


@router.post("/register", response_model=RegisterResponse, status_code=status.HTTP_201_CREATED)
async def register(payload: UserRegister):
    """
    Public self-service signup. Always creates a Learner account, regardless of
    what `role` value the client sends — Debate Coach, Educator, and Administrator
    accounts can only be created by an existing administrator via
    POST /api/v1/admin/users. (This closes a bug where UserRegister.role was
    trusted from the request body and could be used to self-provision any role.)

    The account is created in an unverified, unusable-for-login state. A
    6-digit OTP (valid 5 minutes) is emailed to the address given; the
    account only becomes active — and login only becomes possible — once
    that code is confirmed via POST /verify-email-otp.
    """
    if payload.password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    existing = await users_collection.find_one({"email": payload.email})
    if existing:
        if existing.get("email_verified"):
            # A real, already-verified account owns this email — refuse the
            # duplicate outright (prevents duplicate verified accounts).
            raise HTTPException(status_code=400, detail="Email already registered")
        if existing.get("auth_provider", "local") == "google":
            raise HTTPException(
                status_code=400,
                detail="This email is registered via Google. Use \"Continue with Google\" to sign in.",
            )
        # A prior registration attempt never got verified (e.g. they lost the
        # OTP or never received it) — let them re-submit the form, refresh
        # their details, and get a brand-new OTP rather than being stuck.
        await users_collection.update_one(
            {"_id": existing["_id"]},
            {"$set": {"full_name": payload.full_name, "password_hash": hash_password(payload.password)}},
        )
        user_id = existing["_id"]
    else:
        doc = {
            "full_name": payload.full_name,
            "email": payload.email,
            "password_hash": hash_password(payload.password),
            "role": UserRole.learner.value,
            "experience_level": None,
            "preferred_debate_topics": [],
            "presentation_domains": [],
            "learning_goals": [],
            "coaching_preferences": None,
            "avatar_url": None,
            "institution": None,
            "department": None,
            "year": None,
            "phone_number": None,
            "bio": None,
            "email_verified": False,
            "phone_verified": False,
            "is_active": True,
            "auth_provider": "local",
            "google_id": None,
            "created_at": datetime.utcnow().isoformat(),
        }
        result = await users_collection.insert_one(doc)
        user_id = result.inserted_id

    try:
        code, delivery = await _issue_registration_otp(payload.email)
    except Exception:
        logger.exception("Failed to generate/send registration OTP for %s", payload.email)
        raise HTTPException(status_code=500, detail="Could not send verification email. Please try again.")

    logger.info("Registration OTP issued for %s (user_id=%s)", payload.email, user_id)

    response = RegisterResponse(
        message="Account created. Please check your email for a 6-digit verification code.",
        email=payload.email,
        otp_expires_in_minutes=settings.REGISTRATION_OTP_EXPIRE_MINUTES,
    )
    if settings.APP_ENV == "development" and not delivery.get("delivered"):
        response.dev_otp_code = code
    return response


@router.post("/login", response_model=TokenResponse)
async def login(payload: UserLogin):
    user = await users_collection.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")
    if user.get("auth_provider", "local") == "local" and not user.get("email_verified", False):
        # Existing (already verified) users never hit this branch, so normal
        # login stays completely OTP-free — this only gates brand-new,
        # not-yet-verified signups.
        raise HTTPException(
            status_code=403,
            detail="Please verify your email before logging in. Check your inbox for the verification code, "
            "or request a new one.",
        )
    if payload.expected_role is not None and user["role"] != payload.expected_role.value:
        raise HTTPException(
            status_code=403,
            detail=f"This account is registered as {user['role'].replace('_', ' ')}. "
            f"Please use the correct login portal for your role.",
        )

    token_payload = {"sub": str(user["_id"]), "role": user["role"]}
    access_token = create_access_token(token_payload)
    refresh_token = create_refresh_token(token_payload)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=_serialize_user(user),
    )


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token_endpoint(payload: RefreshRequest):
    """
    Issues a fresh access + refresh token pair from a valid, unexpired refresh
    token. The frontend axios client calls this automatically on a 401 before
    falling back to logging the user out (see api/axios.js).
    """
    decoded = decode_token(payload.refresh_token)
    if not decoded or decoded.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid or expired refresh token")

    try:
        user_oid = ObjectId(decoded["sub"])
    except (InvalidId, KeyError, TypeError):
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = await users_collection.find_one({"_id": user_oid})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Account is deactivated")

    token_payload = {"sub": str(user["_id"]), "role": user["role"]}
    return TokenResponse(
        access_token=create_access_token(token_payload),
        refresh_token=create_refresh_token(token_payload),
        user=_serialize_user(user),
    )


@router.get("/me", response_model=UserOut)
async def get_me(current_user: dict = Depends(get_current_user)):
    return _serialize_user(current_user)


# --------------------------------------------------------------------------
# Password Reset
# --------------------------------------------------------------------------

@router.post("/password/forgot")
async def forgot_password(payload: ForgotPasswordRequest):
    """
    Generates a single-use, time-limited reset token and emails it to the
    user. Always returns 200 (even for unknown emails) so this endpoint can't
    be used to enumerate registered accounts.
    """
    user = await users_collection.find_one({"email": payload.email})
    if not user:
        return {"message": "If that email is registered, a reset link has been sent."}

    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=settings.PASSWORD_RESET_EXPIRE_MINUTES)

    await password_reset_tokens_collection.insert_one(
        {
            "user_id": str(user["_id"]),
            "token": token,
            "expires_at": expires_at.isoformat(),
            "used": False,
            "created_at": datetime.utcnow().isoformat(),
        }
    )

    reset_link = f"{settings.FRONTEND_ORIGIN}/reset-password?token={token}"
    delivery = await send_email(
        to_email=payload.email,
        subject="Reset your AI Debate Coach password",
        body=(
            f"We received a request to reset your password.\n\n"
            f"Reset link (valid {settings.PASSWORD_RESET_EXPIRE_MINUTES} minutes): {reset_link}\n\n"
            f"If you didn't request this, you can safely ignore this email."
        ),
    )

    response = {"message": "If that email is registered, a reset link has been sent."}
    if settings.APP_ENV == "development" and not delivery.get("delivered"):
        # Dev convenience only: surface the token/link since no real mail
        # provider is configured, so the reset flow can still be tested.
        response["dev_reset_token"] = token
        response["dev_reset_link"] = reset_link
    return response


@router.post("/password/reset")
async def reset_password(payload: ResetPasswordRequest):
    if payload.new_password != payload.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")

    record = await password_reset_tokens_collection.find_one({"token": payload.token, "used": False})
    if not record:
        raise HTTPException(status_code=400, detail="Invalid or already-used reset token")
    if datetime.fromisoformat(record["expires_at"]) < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Reset token has expired")

    await users_collection.update_one(
        {"_id": ObjectId(record["user_id"])}, {"$set": {"password_hash": hash_password(payload.new_password)}}
    )
    await password_reset_tokens_collection.update_one({"_id": record["_id"]}, {"$set": {"used": True}})

    return {"message": "Password has been reset successfully. You can now sign in with your new password."}


# --------------------------------------------------------------------------
# Registration Email OTP Verification (public — no login required yet)
# --------------------------------------------------------------------------

@router.post("/verify-email-otp", response_model=TokenResponse)
async def verify_registration_email_otp(payload: VerifyRegistrationOTPRequest):
    """
    Confirms the 6-digit code emailed at registration, activates the account
    (email_verified = true), and — since the account is now legitimate and
    verified — logs the user straight in by issuing the same JWT access +
    refresh token pair as POST /login.
    """
    user = await users_collection.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=404, detail="No account found for this email.")
    if user.get("email_verified"):
        return TokenResponse(
            access_token=create_access_token({"sub": str(user["_id"]), "role": user["role"]}),
            refresh_token=create_refresh_token({"sub": str(user["_id"]), "role": user["role"]}),
            user=_serialize_user(user),
        )

    record = await otp_codes_collection.find_one(
        {"target": payload.email, "purpose": REGISTRATION_OTP_PURPOSE, "verified": False},
        sort=[("created_at", -1)],
    )
    if not record:
        raise HTTPException(status_code=400, detail="No pending verification code. Please request a new one.")
    if datetime.fromisoformat(record["expires_at"]) < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Code has expired. Please request a new one.")
    if not verify_password(payload.otp, record["code_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect verification code.")

    await otp_codes_collection.update_one({"_id": record["_id"]}, {"$set": {"verified": True}})
    await users_collection.update_one(
        {"_id": user["_id"]}, {"$set": {"email_verified": True, "is_active": True}}
    )
    user["email_verified"] = True

    token_payload = {"sub": str(user["_id"]), "role": user["role"]}
    logger.info("Email verified and account activated for %s", payload.email)
    return TokenResponse(
        access_token=create_access_token(token_payload),
        refresh_token=create_refresh_token(token_payload),
        user=_serialize_user(user),
    )


@router.post("/resend-email-otp")
async def resend_registration_email_otp(payload: ResendRegistrationOTPRequest):
    """Issues a brand-new 5-minute OTP for a pending (unverified) signup."""
    user = await users_collection.find_one({"email": payload.email})
    if not user:
        raise HTTPException(status_code=404, detail="No account found for this email.")
    if user.get("email_verified"):
        raise HTTPException(status_code=400, detail="This email is already verified. Please log in.")

    try:
        code, delivery = await _issue_registration_otp(payload.email)
    except Exception:
        logger.exception("Failed to resend registration OTP for %s", payload.email)
        raise HTTPException(status_code=500, detail="Could not send verification email. Please try again.")

    response = {
        "message": "A new verification code has been sent to your email.",
        "otp_expires_in_minutes": settings.REGISTRATION_OTP_EXPIRE_MINUTES,
    }
    if settings.APP_ENV == "development" and not delivery.get("delivered"):
        response["dev_otp_code"] = code
    return response


# --------------------------------------------------------------------------
# Google Identity Services login (POST /google-login)
# --------------------------------------------------------------------------

@router.post("/google-login", response_model=TokenResponse)
async def google_login(payload: GoogleLoginRequest):
    """
    Verifies the ID token ("credential") produced client-side by Google
    Identity Services, then logs the user in — creating a Learner account on
    first sign-in, or linking google_id onto a matching existing account.
    Existing Google users log in directly, with no OTP step, matching every
    other login path. Fully separate code path from the legacy GET
    /oauth/google/* redirect-flow endpoints above, which are left untouched.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=501,
            detail="Google Sign-In is not configured in this environment. Set GOOGLE_CLIENT_ID to enable it.",
        )

    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(
            "https://oauth2.googleapis.com/tokeninfo",
            params={"id_token": payload.credential},
        )
    if resp.status_code != 200:
        raise HTTPException(status_code=401, detail="Invalid or expired Google credential.")

    claims = resp.json()
    if claims.get("aud") != settings.GOOGLE_CLIENT_ID:
        raise HTTPException(status_code=401, detail="Google credential was not issued for this application.")

    email = claims.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email address")
    if str(claims.get("email_verified", "false")).lower() not in ("true", "1"):
        raise HTTPException(status_code=400, detail="Google account email is not verified.")

    google_id = claims.get("sub")
    user = await users_collection.find_one({"email": email})
    if not user:
        doc = {
            "full_name": claims.get("name", email.split("@")[0]),
            "email": email,
            "password_hash": hash_password(secrets.token_urlsafe(24)),  # unusable random password; OAuth-only login
            "role": UserRole.learner.value,
            "experience_level": None,
            "preferred_debate_topics": [],
            "presentation_domains": [],
            "learning_goals": [],
            "coaching_preferences": None,
            "avatar_url": claims.get("picture"),
            "institution": None,
            "department": None,
            "year": None,
            "phone_number": None,
            "bio": None,
            "email_verified": True,  # Google already verified this email
            "phone_verified": False,
            "is_active": True,
            "auth_provider": "google",
            "google_id": google_id,
            "created_at": datetime.utcnow().isoformat(),
        }
        result = await users_collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        user = doc
        logger.info("Created new Google-linked account for %s", email)
    else:
        if not user.get("is_active", True):
            raise HTTPException(status_code=403, detail="Account is deactivated")
        # Existing account (local or previously-linked Google) signing in
        # with Google — link it and make sure it's treated as verified,
        # without touching anything else about the account.
        updates = {"email_verified": True}
        if not user.get("google_id"):
            updates["google_id"] = google_id
        if user.get("auth_provider", "local") != "google":
            updates["auth_provider"] = "google"
        await users_collection.update_one({"_id": user["_id"]}, {"$set": updates})
        user.update(updates)

    token_payload = {"sub": str(user["_id"]), "role": user["role"]}
    return TokenResponse(
        access_token=create_access_token(token_payload),
        refresh_token=create_refresh_token(token_payload),
        user=_serialize_user(user),
    )


# --------------------------------------------------------------------------
# Email OTP Verification
# --------------------------------------------------------------------------

def _generate_otp() -> str:
    return f"{random.randint(0, 999999):06d}"


@router.post("/otp/email/request")
async def request_email_otp(payload: EmailOTPRequest, current_user: dict = Depends(get_current_user)):
    if current_user["email"] != payload.email:
        raise HTTPException(status_code=403, detail="You can only request an OTP for your own account")

    code = _generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    await otp_codes_collection.insert_one(
        {
            "target": payload.email,
            "purpose": "email_verification",
            "code_hash": hash_password(code),
            "expires_at": expires_at.isoformat(),
            "verified": False,
            "created_at": datetime.utcnow().isoformat(),
        }
    )

    delivery = await send_email(
        to_email=payload.email,
        subject="Your AI Debate Coach verification code",
        body=f"Your verification code is {code}. It expires in {settings.OTP_EXPIRE_MINUTES} minutes.",
    )

    response = {"message": "Verification code sent."}
    if settings.APP_ENV == "development" and not delivery.get("delivered"):
        response["dev_otp_code"] = code
    return response


@router.post("/otp/email/verify")
async def verify_email_otp(payload: EmailOTPVerify, current_user: dict = Depends(get_current_user)):
    if current_user["email"] != payload.email:
        raise HTTPException(status_code=403, detail="You can only verify your own account")

    record = await otp_codes_collection.find_one(
        {"target": payload.email, "purpose": "email_verification", "verified": False},
        sort=[("created_at", -1)],
    )
    if not record:
        raise HTTPException(status_code=400, detail="No pending verification code. Please request a new one.")
    if datetime.fromisoformat(record["expires_at"]) < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Code has expired. Please request a new one.")
    if not verify_password(payload.code, record["code_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect verification code")

    await otp_codes_collection.update_one({"_id": record["_id"]}, {"$set": {"verified": True}})
    await users_collection.update_one({"_id": ObjectId(current_user["id"])}, {"$set": {"email_verified": True}})

    return {"message": "Email verified successfully."}


# --------------------------------------------------------------------------
# Mobile OTP (dev mode when Twilio credentials are not configured)
# --------------------------------------------------------------------------

@router.post("/otp/mobile/request")
async def request_mobile_otp(payload: MobileOTPRequest, current_user: dict = Depends(get_current_user)):
    code = _generate_otp()
    expires_at = datetime.utcnow() + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)

    await otp_codes_collection.insert_one(
        {
            "target": payload.phone_number,
            "purpose": "mobile_verification",
            "user_id": current_user["id"],
            "code_hash": hash_password(code),
            "expires_at": expires_at.isoformat(),
            "verified": False,
            "created_at": datetime.utcnow().isoformat(),
        }
    )

    delivery = await send_sms(
        to_phone=payload.phone_number,
        body=f"Your AI Debate Coach verification code is {code}. It expires in {settings.OTP_EXPIRE_MINUTES} minutes.",
    )

    response = {"message": "Verification code sent."}
    if settings.APP_ENV == "development" and not delivery.get("delivered"):
        response["dev_otp_code"] = code
    return response


@router.post("/otp/mobile/verify")
async def verify_mobile_otp(payload: MobileOTPVerify, current_user: dict = Depends(get_current_user)):
    record = await otp_codes_collection.find_one(
        {
            "target": payload.phone_number,
            "purpose": "mobile_verification",
            "user_id": current_user["id"],
            "verified": False,
        },
        sort=[("created_at", -1)],
    )
    if not record:
        raise HTTPException(status_code=400, detail="No pending verification code. Please request a new one.")
    if datetime.fromisoformat(record["expires_at"]) < datetime.utcnow():
        raise HTTPException(status_code=400, detail="Code has expired. Please request a new one.")
    if not verify_password(payload.code, record["code_hash"]):
        raise HTTPException(status_code=400, detail="Incorrect verification code")

    await otp_codes_collection.update_one({"_id": record["_id"]}, {"$set": {"verified": True}})
    await users_collection.update_one(
        {"_id": ObjectId(current_user["id"])},
        {"$set": {"phone_verified": True, "phone_number": payload.phone_number}},
    )

    return {"message": "Phone number verified successfully."}


# --------------------------------------------------------------------------
# OAuth2 Login (Google)
# --------------------------------------------------------------------------

@router.get("/oauth/google/login")
async def google_oauth_login():
    """
    Returns the Google OAuth2 authorization URL for the frontend to redirect
    to. If GOOGLE_CLIENT_ID/SECRET aren't configured in this environment,
    responds with 501 and a clear message rather than failing silently.
    """
    if not settings.GOOGLE_CLIENT_ID:
        raise HTTPException(
            status_code=501,
            detail=(
                "OAuth2 login is not configured in this environment. "
                "Set GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_REDIRECT_URI to enable it."
            ),
        )

    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "openid email profile",
        "access_type": "offline",
        "prompt": "select_account",
    }
    query = urlencode(params)
    return {"authorization_url": f"https://accounts.google.com/o/oauth2/v2/auth?{query}"}


@router.get("/oauth/google/callback")
async def google_oauth_callback(code: str):
    """
    Exchanges the authorization code for tokens, fetches the Google profile,
    and logs the user in — creating a Learner account on first sign-in
    (OAuth2 login never grants Coach/Educator/Admin roles, consistent with
    the rest of the platform's role-provisioning rules).
    """
    if not settings.GOOGLE_CLIENT_ID or not settings.GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=501, detail="OAuth2 login is not configured in this environment.")

    async with httpx.AsyncClient(timeout=10.0) as client:
        token_resp = await client.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": code,
                "client_id": settings.GOOGLE_CLIENT_ID,
                "client_secret": settings.GOOGLE_CLIENT_SECRET,
                "redirect_uri": settings.GOOGLE_REDIRECT_URI,
                "grant_type": "authorization_code",
            },
        )
        if token_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange authorization code with Google")
        access_token = token_resp.json()["access_token"]

        profile_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        if profile_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch Google profile")
        profile = profile_resp.json()

    email = profile.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google account has no email address")

    user = await users_collection.find_one({"email": email})
    if not user:
        doc = {
            "full_name": profile.get("name", email.split("@")[0]),
            "email": email,
            "password_hash": hash_password(secrets.token_urlsafe(24)),  # unusable random password; OAuth-only login
            "role": UserRole.learner.value,
            "experience_level": None,
            "preferred_debate_topics": [],
            "presentation_domains": [],
            "learning_goals": [],
            "coaching_preferences": None,
            "avatar_url": profile.get("picture"),
            "institution": None,
            "department": None,
            "year": None,
            "phone_number": None,
            "bio": None,
            "email_verified": True,  # Google already verified this email
            "phone_verified": False,
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
        }
        result = await users_collection.insert_one(doc)
        doc["_id"] = result.inserted_id
        user = doc

    token_payload = {"sub": str(user["_id"]), "role": user["role"]}
    tokens = TokenResponse(
        access_token=create_access_token(token_payload),
        refresh_token=create_refresh_token(token_payload),
        user=_serialize_user(user),
    )
    return tokens
