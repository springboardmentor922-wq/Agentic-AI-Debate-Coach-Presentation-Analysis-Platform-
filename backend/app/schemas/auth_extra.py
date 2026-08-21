from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=6)
    confirm_password: str = Field(min_length=6)


class EmailOTPRequest(BaseModel):
    email: EmailStr


class EmailOTPVerify(BaseModel):
    email: EmailStr
    code: str = Field(min_length=4, max_length=8)


class MobileOTPRequest(BaseModel):
    phone_number: str = Field(min_length=6, max_length=20)


class MobileOTPVerify(BaseModel):
    phone_number: str = Field(min_length=6, max_length=20)
    code: str = Field(min_length=4, max_length=8)


class OAuthCallbackQuery(BaseModel):
    code: str
    state: Optional[str] = None


# --------------------------------------------------------------------------
# Registration email-verification OTP (pre-login, public endpoints)
# --------------------------------------------------------------------------

class RegisterResponse(BaseModel):
    message: str
    email: EmailStr
    requires_otp: bool = True
    otp_expires_in_minutes: int
    # Dev-mode convenience only: populated when APP_ENV=development and no
    # SMTP provider is configured, so the flow can be tested without a real
    # mailbox. Never populated in production.
    dev_otp_code: Optional[str] = None


class VerifyRegistrationOTPRequest(BaseModel):
    email: EmailStr
    otp: str = Field(min_length=6, max_length=6)


class ResendRegistrationOTPRequest(BaseModel):
    email: EmailStr


class GoogleLoginRequest(BaseModel):
    # ID token ("credential") returned by Google Identity Services on the
    # frontend after a successful "Continue with Google" click.
    credential: str
