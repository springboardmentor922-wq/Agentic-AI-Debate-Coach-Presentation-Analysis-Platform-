from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # ---------- Database ----------
    MONGO_URI: str
    MONGO_DB_NAME: str = "debate_coach_db"

    # ---------- JWT ----------
    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # ---------- Gemini ----------
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.5-flash"

    # ---------- Local Whisper ----------
    LOCAL_WHISPER_MODEL: str = "base"

    # ---------- LLM ----------
    LLM_PROVIDER: str = "gemini"
    LLM_FALLBACK_PROVIDER: str = ""

    # ---------- Upload ----------
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_MB: int = 100
    ALLOWED_AUDIO_EXT: str = "mp3,wav,m4a,webm"
    ALLOWED_VIDEO_EXT: str = "mp4,mov,avi"

    # ---------- Frontend ----------
    FRONTEND_ORIGIN: str = "http://localhost:5173"

    # ---------- Environment ----------
    APP_ENV: str = "development"

    OTP_EXPIRE_MINUTES: int = 10
    PASSWORD_RESET_EXPIRE_MINUTES: int = 30
    REGISTRATION_OTP_EXPIRE_MINUTES: int = 5

    # ---------- SMTP ----------
    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM_EMAIL: str = "no-reply@ai-debate-coach.local"

    # ---------- Twilio ----------
    TWILIO_ACCOUNT_SID: str = ""
    TWILIO_AUTH_TOKEN: str = ""
    TWILIO_FROM_NUMBER: str = ""

    # ---------- Google OAuth ----------
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    GOOGLE_REDIRECT_URI: str = (
        "http://localhost:8000/api/v1/auth/oauth/google/callback"
    )

    model_config = SettingsConfigDict(
        env_file=".env",
        extra="ignore",
    )


settings = Settings()