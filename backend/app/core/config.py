from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    MONGO_URI: str
    MONGO_DB_NAME: str = "debate_coach_db"

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    OPENAI_WHISPER_MODEL: str = "whisper-1"

    # --- Multi-provider LLM support (Milestone 2 fix) ---------------------
    # LLM_PROVIDER is tried first for every text-generation call (argument
    # analysis, fallacy detection, opponent rebuttals, feedback reports,
    # presentation scoring, learning plans, counterarguments).
    # LLM_FALLBACK_PROVIDER is tried automatically if the primary provider
    # raises for any reason (quota, auth, network, timeout). Leave it empty
    # ("") to disable the fallback provider. If BOTH fail (or neither is
    # configured), the app falls back to a deterministic, rule-based NLP
    # analysis engine so the pipeline always produces meaningful, non-empty
    # output — see app/services/deterministic_analysis.py.
    LLM_PROVIDER: str = "openai"
    LLM_FALLBACK_PROVIDER: str = "anthropic"

    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-sonnet-4-6"
    # Local faster-whisper fallback, used automatically whenever the OpenAI
    # Whisper call fails (quota, auth, network, timeout, etc). Options:
    # tiny, base, small, medium, large-v3 — "base" balances speed/accuracy
    # for CPU-only dev/demo machines.
    # "tiny" transcribes roughly 3-4x faster than "base" on CPU with only a
    # modest accuracy tradeoff — important because this is the fallback path
    # used whenever the hosted OpenAI Whisper call fails, and it must not
    # make an upload feel stuck. Override via LOCAL_WHISPER_MODEL if desired.
    LOCAL_WHISPER_MODEL: str = "tiny"


    # --- Milestone 3: media uploads for audio/video debate recordings ---
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_MB: int = 100
    # webm is included so in-browser MediaRecorder captures (live mic turns)
    # can reuse the same upload/validation path as mp3/wav/m4a file uploads.
    ALLOWED_AUDIO_EXT: str = "mp3,wav,m4a,webm"
    ALLOWED_VIDEO_EXT: str = "mp4,mov,avi"

    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # App environment. In "development" (the default), OTP codes and password
    # reset tokens are echoed back in API responses / server logs whenever the
    # corresponding email/SMS provider isn't configured, so the flow can be
    # tested end-to-end without real credentials, per the Milestone 1 spec.
    APP_ENV: str = "development"

    OTP_EXPIRE_MINUTES: int = 10
    PASSWORD_RESET_EXPIRE_MINUTES: int = 30

    # --- Registration email-verification OTP. Per spec this must expire in
    # 5 minutes (kept separate from the general-purpose OTP_EXPIRE_MINUTES
    # used by the existing mobile/email OTP endpoints, so tightening this
    # value can never change behavior elsewhere).
    REGISTRATION_OTP_EXPIRE_MINUTES: int = 5

    # --- Email OTP / notifications (SMTP). Optional — dev mode used if unset.
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "no-reply@ai-debate-coach.local"

    # --- Mobile OTP (Twilio). Optional — dev mode used if unset.
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""

    # --- OAuth2 login (Google). Optional — endpoint returns 501 if unset.
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = "http://localhost:8000/api/v1/auth/oauth/google/callback"

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")


settings = Settings()
