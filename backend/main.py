from dotenv import load_dotenv
load_dotenv()

import os
import shutil
import tempfile
import logging
import traceback
import uuid
from pathlib import Path
from typing import List, Literal, Optional

from fastapi import Depends, FastAPI, File, Form, Header, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr, Field

from auth import create_token, decode_token, generate_otp, hash_password, send_otp_email, verify_password
from database import (
    RECORDINGS_DIR,
    attach_session_scores,
    compute_learner_skills,
    compute_platform_average_score,
    compute_session_stats,
    consume_otp,
    create_default_profile,
    create_default_skills,
    create_otp,
    delete_user_cascade,
    get_connection,
    get_debate_turns,
    get_recent_activity,
    get_session_summary,
    get_valid_otp,
    init_db,
    now_iso,
    row_to_dict,
    save_debate_turn,
    save_session_summary,
    sync_session_statuses,
    update_user_role,
    compute_skill_gap_analysis,
    save_coach_feedback,
    get_coach_feedback,


)
from schemas.fallacy import FallacyReport
from schemas.scoring import ArgumentScore
from schemas.session_summary import SessionSummary
from agents.chatbot_engine import run_debate_turn
from services.speech import transcribe_audio
from services.session_summary_agent import generate_session_summary
from services.assistant_agent import generate_assistant_reply

logger = logging.getLogger("debate_coach")
logging.basicConfig(level=logging.INFO)

ROOT_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend"

ROLE_LABELS = {
    "learner": "Learner",
    "coach": "Debate Coach",
    "educator": "Educator",
    "admin": "Administrator",
}
VALID_ROLES = set(ROLE_LABELS)
DEBATE_TOPICS = [
    "Should AI tools be allowed in classroom debate preparation?",
    "Is social media more harmful than helpful for young people?",
    "Should schools replace exams with project-based assessment?",
    "Is remote work better than office work?",
    "Should governments regulate artificial intelligence strictly?",
    "Is space exploration worth the public investment?",
    "Should college education be free for everyone?",
    "Are electric vehicles the best solution for climate change?",
    "Should voting be mandatory in democracies?",
    "Is privacy more important than national security?",
]

ROLE_REQUIRED_FIELDS = {
    "learner": ["experience_level"],
    "coach": ["experience_level", "specialization"],
    "educator": ["institution", "specialization"],
}


class RegisterRequest(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["learner", "coach", "educator", "admin"]
    experience_level: Optional[str] = ""
    preferred_topics: Optional[str] = ""
    presentation_domains: Optional[str] = ""
    learning_goals: Optional[str] = ""
    coaching_preferences: Optional[str] = ""
    specialization: Optional[str] = ""
    institution: Optional[str] = ""
    years_of_experience: Optional[str] = ""


class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class CoachFeedbackRequest(BaseModel):
    feedback_text: str


class AssistantChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class AssistantChatRequest(BaseModel):
    message: str
    history: List[AssistantChatMessage] = Field(default_factory=list)


class EmailOnlyRequest(BaseModel):
    email: EmailStr


class OtpVerifyRequest(BaseModel):
    email: EmailStr
    code: str


class ProfileUpdateRequest(BaseModel):
    experience_level: Optional[str] = ""
    preferred_topics: Optional[str] = ""
    presentation_domains: Optional[str] = ""
    learning_goals: Optional[str] = ""
    coaching_preferences: Optional[str] = ""
    specialization: Optional[str] = ""
    institution: Optional[str] = ""
    years_of_experience: Optional[str] = ""


class SkillItem(BaseModel):
    skill_name: str
    score: int = 50


class SkillsUpdateRequest(BaseModel):
    skills: List[SkillItem] = Field(default_factory=list)


class SessionCreateRequest(BaseModel):
    topic: str
    format: str
    position: str
    opponent_type: str
    scheduled_for: str
    notes: Optional[str] = ""


class SessionStatusUpdateRequest(BaseModel):
    status: Literal["scheduled", "active", "completed", "cancelled"]


app = FastAPI(title="Debate Coach API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(ValueError)
async def value_error_handler(request: Request, exc: ValueError):
    return JSONResponse(status_code=400, content={"error": str(exc)})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.error("Unhandled exception on %s %s:\n%s", request.method, request.url.path, traceback.format_exc())
    return JSONResponse(status_code=500, content={"error": f"Server error: {exc}"})


@app.on_event("startup")
def on_startup():
    init_db()


def public_user(user):
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "roleLabel": ROLE_LABELS[user["role"]],
    }


def visible_sessions(conn, user):
    sync_session_statuses(conn)
    if user["role"] == "admin":
        rows = conn.execute(
            """
            SELECT debate_sessions.*, users.name AS owner_name
            FROM debate_sessions JOIN users ON users.id = debate_sessions.owner_id
            ORDER BY scheduled_for DESC
            """
        ).fetchall()
    elif user["role"] in {"coach", "educator"}:
        rows = conn.execute(
            """
            SELECT debate_sessions.*, users.name AS owner_name
            FROM debate_sessions JOIN users ON users.id = debate_sessions.owner_id
            WHERE users.role = 'learner'
            ORDER BY scheduled_for DESC
            """
        ).fetchall()
    else:
        rows = conn.execute(
            """
            SELECT debate_sessions.*, users.name AS owner_name
            FROM debate_sessions JOIN users ON users.id = debate_sessions.owner_id
            WHERE owner_id = ?
            ORDER BY scheduled_for DESC
            """,
            (user["id"],),
        ).fetchall()
    sessions = [dict(row) for row in rows]
    return attach_session_scores(conn, sessions)


def can_manage_session(user, session):
    if not session:
        return False
    if user["role"] == "admin":
        return True
    if user["role"] in {"coach", "educator"}:
        return True
    return session["owner_id"] == user["id"]


def can_view_profile(viewer, target):
    if viewer["id"] == target["id"]:
        return True
    if viewer["role"] == "admin":
        return True
    if viewer["role"] in {"coach", "educator"} and target["role"] == "learner":
        return True
    return False


def get_current_user(authorization: Optional[str] = Header(default=None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Authentication required")
    payload = decode_token(authorization.replace("Bearer ", "", 1))
    if not payload:
        raise HTTPException(status_code=401, detail="Authentication required")
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (payload["sub"],)).fetchone()
    user = row_to_dict(row)
    if not user:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user


@app.post("/api/register", status_code=201)
def register(data: RegisterRequest):
    if data.role not in {"learner", "coach", "educator"}:
        raise ValueError("You cannot register as an administrator.")
    if len(data.password) < 8:
        raise ValueError("Password must be at least 8 characters")

    required = ROLE_REQUIRED_FIELDS.get(data.role, [])
    missing = [field for field in required if not (getattr(data, field) or "").strip()]
    if missing:
        pretty = ", ".join(name.replace("_", " ") for name in missing)
        raise ValueError(f"Please answer the following before registering: {pretty}")

    with get_connection() as conn:
        try:
            cur = conn.execute(
                "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)",
                (
                    data.name.strip(),
                    data.email.lower().strip(),
                    hash_password(data.password),
                    data.role,
                    now_iso(),
                ),
            )
        except Exception:
            raise HTTPException(status_code=409, detail="An account with that email already exists")
        user_id = cur.lastrowid
        create_default_profile(conn, user_id, data.role, data.dict())
        create_default_skills(conn, user_id)
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        user = row_to_dict(row)

    return {"user": public_user(user), "token": create_token(user)}


@app.post("/api/login")
def login(data: LoginRequest):
    with get_connection() as conn:
        row = conn.execute(
            "SELECT * FROM users WHERE email = ?", (data.email.lower().strip(),)
        ).fetchone()
        user = row_to_dict(row)
        if not user or not verify_password(data.password, user["password_hash"]):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        code = generate_otp()
        create_otp(conn, user["email"], code)

    send_otp_email(user["email"], code)
    return {"otpRequired": True, "email": user["email"]}


@app.post("/api/login/verify")
def verify_login_otp(data: OtpVerifyRequest):
    email = data.email.lower().strip()
    code = data.code.strip()
    with get_connection() as conn:
        otp_row = get_valid_otp(conn, email, code)
        if not otp_row:
            raise HTTPException(status_code=401, detail="That code is invalid or has expired")
        consume_otp(conn, otp_row["id"])
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        user = row_to_dict(row)

    if not user:
        raise HTTPException(status_code=401, detail="That code is invalid or has expired")

    return {"user": public_user(user), "token": create_token(user)}


@app.post("/api/login/resend")
def resend_login_otp(data: EmailOnlyRequest):
    email = data.email.lower().strip()
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE email = ?", (email,)).fetchone()
        user = row_to_dict(row)
        if not user:
            return {"otpRequired": True, "email": email}
        code = generate_otp()
        create_otp(conn, user["email"], code)

    send_otp_email(user["email"], code)
    return {"otpRequired": True, "email": email}


@app.get("/api/me")
def me(user=Depends(get_current_user)):
    return {"user": public_user(user)}


@app.post("/api/assistant/chat")
def assistant_chat(data: AssistantChatRequest, user=Depends(get_current_user)):
    """The global floating chatbot -- available on every page, not tied to
    a debate session. Friendly helper, not an opponent."""
    message = data.message.strip()
    if not message:
        raise ValueError("Type a message first.")
    history = [turn.dict() for turn in data.history]
    reply = generate_assistant_reply(user["name"], ROLE_LABELS[user["role"]], history, message)
    return {"reply": reply}


@app.get("/api/topics")
def topics(user=Depends(get_current_user)):
    return {"topics": DEBATE_TOPICS}


@app.get("/api/coach/skill-gap")
def coach_skill_gap(user=Depends(get_current_user)):
    if user["role"] not in {"coach", "educator", "admin"}:
        raise HTTPException(status_code=403, detail="Not allowed")
    with get_connection() as conn:
        analysis = compute_skill_gap_analysis(conn)
    return analysis


@app.post("/api/sessions/{session_id}/feedback", status_code=201)
def add_coach_feedback(session_id: int, data: CoachFeedbackRequest, user=Depends(get_current_user)):
    if user["role"] not in {"coach", "educator", "admin"}:
        raise HTTPException(status_code=403, detail="Only coaches, educators, or admins can leave feedback.")
    text = data.feedback_text.strip()
    if not text:
        raise ValueError("Feedback text cannot be empty.")
    with get_connection() as conn:
        session = row_to_dict(conn.execute("SELECT * FROM debate_sessions WHERE id = ?", (session_id,)).fetchone())
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        save_coach_feedback(conn, session_id, user["id"], text)
        feedback = get_coach_feedback(conn, session_id)
    return {"feedback": feedback}


@app.get("/api/dashboard")
def dashboard(user=Depends(get_current_user)):
    with get_connection() as conn:
        sessions = visible_sessions(conn, user)
        skills = compute_learner_skills(conn, user["id"])
        users_total = conn.execute("SELECT COUNT(*) AS total FROM users").fetchone()["total"]
        learners_total = conn.execute(
            "SELECT COUNT(*) AS total FROM users WHERE role = 'learner'"
        ).fetchone()["total"]

    completed = sum(1 for session in sessions if session["status"] == "completed")
    scheduled = sum(1 for session in sessions if session["status"] == "scheduled")
    avg_skill = round(sum(row["score"] for row in skills) / max(len(skills), 1))

    return {
        "stats": {
            "visibleSessions": len(sessions),
            "scheduledSessions": scheduled,
            "completedSessions": completed,
            "averageSkill": avg_skill,
            "platformUsers": users_total,
            "learners": learners_total,
        },
        "skills": skills,
        "recentSessions": sessions[:4],
        "roleLabel": ROLE_LABELS[user["role"]],
    }

@app.get("/api/profile")
def get_profile(user=Depends(get_current_user)):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM profiles WHERE user_id = ?", (user["id"],)).fetchone()
    return {"profile": row_to_dict(row)}


@app.put("/api/profile")
def update_profile(data: ProfileUpdateRequest, user=Depends(get_current_user)):
    values = (
        data.experience_level.strip(),
        data.preferred_topics.strip(),
        data.presentation_domains.strip(),
        data.learning_goals.strip(),
        data.coaching_preferences.strip(),
        data.specialization.strip(),
        data.institution.strip(),
        data.years_of_experience.strip(),
    )
    with get_connection() as conn:
        conn.execute(
            """
            UPDATE profiles
            SET experience_level = ?, preferred_topics = ?, presentation_domains = ?, learning_goals = ?,
                coaching_preferences = ?, specialization = ?, institution = ?, years_of_experience = ?
            WHERE user_id = ?
            """,
            (*values, user["id"]),
        )
    return get_profile(user)


@app.get("/api/skills")
def get_skills(user=Depends(get_current_user)):
    with get_connection() as conn:
        skills = compute_learner_skills(conn, user["id"])
    return {"skills": skills}


@app.put("/api/skills")
def update_skills(data: SkillsUpdateRequest, user=Depends(get_current_user)):
    raise HTTPException(
        status_code=403,
        detail="Skill scores can't be edited directly. They're updated by your coach/educator as you practice.",
    )


@app.get("/api/sessions")
def get_sessions(user=Depends(get_current_user)):
    with get_connection() as conn:
        return {"sessions": visible_sessions(conn, user)}


@app.post("/api/sessions", status_code=201)
def create_session(data: SessionCreateRequest, user=Depends(get_current_user)):
    if user["role"] != "learner":
        raise HTTPException(status_code=403, detail="Only learners can create debate sessions.")

    topic = data.topic.strip()
    if not topic:
        raise ValueError("Please choose or enter a debate topic")

    with get_connection() as conn:
        cur = conn.execute(
            """
            INSERT INTO debate_sessions
            (owner_id, topic, format, position, opponent_type, scheduled_for, status, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?, ?)
            """,
            (
                user["id"],
                topic,
                data.format,
                data.position,
                data.opponent_type,
                data.scheduled_for,
                (data.notes or "").strip(),
                now_iso(),
            ),
        )

        row = conn.execute(
            "SELECT * FROM debate_sessions WHERE id = ?",
            (cur.lastrowid,),
        ).fetchone()

    return {"session": row_to_dict(row)}


@app.put("/api/sessions/{session_id}")
def update_session(session_id: int, data: SessionStatusUpdateRequest, user=Depends(get_current_user)):
    with get_connection() as conn:
        session = conn.execute("SELECT * FROM debate_sessions WHERE id = ?", (session_id,)).fetchone()
        if not can_manage_session(user, session):
            raise HTTPException(status_code=403, detail="Not allowed")
        conn.execute("UPDATE debate_sessions SET status = ? WHERE id = ?", (data.status, session_id))
    return get_sessions(user)


@app.delete("/api/sessions/{session_id}")
def delete_session(session_id: int, user=Depends(get_current_user)):
    with get_connection() as conn:
        session = conn.execute("SELECT * FROM debate_sessions WHERE id = ?", (session_id,)).fetchone()
        if not can_manage_session(user, session):
            raise HTTPException(status_code=403, detail="Not allowed")
        conn.execute("DELETE FROM debate_sessions WHERE id = ?", (session_id,))
    return {"ok": True}


@app.post("/api/sessions/{session_id}/end")
def end_session(session_id: int, user=Depends(get_current_user)):
    """Ends a debate session: computes aggregate stats across the user's
    turns, generates a closing coaching report, and marks the session
    completed. Idempotent -- calling it again just returns the same report."""
    with get_connection() as conn:
        session = row_to_dict(conn.execute("SELECT * FROM debate_sessions WHERE id = ?", (session_id,)).fetchone())
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        if not can_manage_session(user, session):
            raise HTTPException(status_code=403, detail="Not allowed")

        existing_summary = get_session_summary(conn, session_id)
        if session["status"] == "completed" and existing_summary:
            return {"session": session, "summary": existing_summary}

        stats = compute_session_stats(conn, session_id)

    if stats["turns_count"] == 0:
        raise ValueError("Record at least one argument before ending the debate.")

    summary: SessionSummary = generate_session_summary(
        topic=session["topic"], debate_format=session["format"], position=session["position"], stats=stats
    )

    with get_connection() as conn:
        save_session_summary(conn, session_id, stats, summary)
        conn.execute("UPDATE debate_sessions SET status = 'completed' WHERE id = ?", (session_id,))
        updated_session = row_to_dict(
            conn.execute("SELECT * FROM debate_sessions WHERE id = ?", (session_id,)).fetchone()
        )
        final_summary = get_session_summary(conn, session_id)

    return {"session": updated_session, "summary": final_summary}


@app.get("/api/users")
def list_users(user=Depends(get_current_user)):
    with get_connection() as conn:
        if user["role"] == "coach":
            rows = conn.execute(
                "SELECT id,name,email,role,created_at FROM users WHERE role='learner' ORDER BY name"
            ).fetchall()
            return {"users": [dict(r) for r in rows], "scope": "learners"}

        elif user["role"] == "educator":
            rows = conn.execute(
                "SELECT id,name,email,role,created_at FROM users WHERE role='learner' ORDER BY name"
            ).fetchall()
            return {"users": [dict(r) for r in rows], "scope": "students"}

        elif user["role"] == "admin":
            rows = conn.execute(
                "SELECT id,name,email,role,created_at FROM users ORDER BY created_at DESC"
            ).fetchall()
            return {"users": [dict(r) for r in rows], "scope": "platform"}

    raise HTTPException(status_code=403, detail="Access denied")


@app.get("/api/users/{user_id}/profile")
def get_user_profile(user_id: int, viewer=Depends(get_current_user)):
    with get_connection() as conn:
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        target = row_to_dict(row)
        if not target:
            raise HTTPException(status_code=404, detail="User not found")
        if not can_view_profile(viewer, target):
            raise HTTPException(status_code=403, detail="Not allowed")

        profile_row = conn.execute("SELECT * FROM profiles WHERE user_id = ?", (user_id,)).fetchone()
        skills = compute_learner_skills(conn, user_id)

    return {
        "user": public_user(target),
        "profile": row_to_dict(profile_row),
        "skills": skills,
    }


@app.get("/api/users/{user_id}/sessions")
def get_user_sessions(user_id: int, viewer=Depends(get_current_user)):
    with get_connection() as conn:
        sync_session_statuses(conn)
        row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        target = row_to_dict(row)
        if not target:
            raise HTTPException(status_code=404, detail="User not found")
        if not can_view_profile(viewer, target):
            raise HTTPException(status_code=403, detail="Not allowed")

        rows = conn.execute(
            """
            SELECT debate_sessions.*, users.name AS owner_name
            FROM debate_sessions JOIN users ON users.id = debate_sessions.owner_id
            WHERE owner_id = ?
            ORDER BY scheduled_for DESC
            """,
            (user_id,),
        ).fetchall()

    return {"user": public_user(target), "sessions": [dict(r) for r in rows]}


@app.get("/api/admin/overview")
def admin_overview(user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Administrator access required")
    with get_connection() as conn:
        role_rows = conn.execute(
            "SELECT role, COUNT(*) AS total FROM users GROUP BY role ORDER BY role"
        ).fetchall()
        status_rows = conn.execute(
            "SELECT status, COUNT(*) AS total FROM debate_sessions GROUP BY status ORDER BY status"
        ).fetchall()
        total_sessions = conn.execute("SELECT COUNT(*) AS total FROM debate_sessions").fetchone()["total"]
        total_users = conn.execute("SELECT COUNT(*) AS total FROM users").fetchone()["total"]
        active_sessions = conn.execute(
            "SELECT COUNT(*) AS total FROM debate_sessions WHERE status = 'active'"
        ).fetchone()["total"]
        platform_avg = compute_platform_average_score(conn)
        recent_activity = get_recent_activity(conn, limit=6)

    role_totals = {row["role"]: row["total"] for row in role_rows}

    return {
        "roles": [dict(row) for row in role_rows],
        "sessionStatuses": [dict(row) for row in status_rows],
        "totalSessions": total_sessions,
        "totalUsers": total_users,
        "activeSessions": active_sessions,
        "platformAverageScore": platform_avg,
        "recentActivity": recent_activity,
        "roleDistribution": [
            {"role": role_name, "total": total, "percent": round((total / total_users) * 100) if total_users else 0}
            for role_name, total in role_totals.items()
        ],
        "systemHealth": {
            "database": True,  # if this query ran, the DB connection is alive
            "aiService": bool(os.environ.get("GROQ_API_KEY")),
            "emailService": bool(os.environ.get("SMTP_HOST")),
        },
        "backendAccess": [
            "/api/users",
            "/api/sessions",
            "/api/profile",
            "/api/skills",
            "/api/topics",
            "/api/admin/overview",
        ],
    }


@app.put("/api/admin/users/{user_id}/role")
def change_user_role(user_id: int, data: SessionStatusUpdateRequest = None, role: str = None, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Administrator access required")
    if not role or role not in {"learner", "coach", "educator", "admin"}:
        raise ValueError("Invalid role")
    if user_id == user["id"]:
        raise ValueError("You cannot change your own role.")
    with get_connection() as conn:
        target = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not target:
            raise HTTPException(status_code=404, detail="User not found")
        update_user_role(conn, user_id, role)
    return {"ok": True}


@app.delete("/api/admin/users/{user_id}")
def admin_delete_user(user_id: int, user=Depends(get_current_user)):
    if user["role"] != "admin":
        raise HTTPException(status_code=403, detail="Administrator access required")
    if user_id == user["id"]:
        raise ValueError("You cannot delete your own account.")
    with get_connection() as conn:
        target = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
        if not target:
            raise HTTPException(status_code=404, detail="User not found")
        delete_user_cascade(conn, user_id)
    return {"ok": True}



@app.get("/api/debate/turns/{session_id}")
def list_debate_turns(session_id: int, user=Depends(get_current_user)):
    with get_connection() as conn:
        session = row_to_dict(
            conn.execute("SELECT * FROM debate_sessions WHERE id = ?", (session_id,)).fetchone()
        )
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        if not can_manage_session(user, session):
            raise HTTPException(status_code=403, detail="Not allowed")
        turns = get_debate_turns(conn, session_id)
        summary = get_session_summary(conn, session_id)
        feedback = get_coach_feedback(conn, session_id)
    return {"session": session, "turns": turns, "summary": summary, "feedback": feedback}


@app.post("/api/debate/turn")
async def debate_turn(
    session_id: int = Form(...),
    message: Optional[str] = Form(None),
    duration_seconds: Optional[float] = Form(None),
    audio: Optional[UploadFile] = File(None),
    user=Depends(get_current_user),
):
    with get_connection() as conn:
        session = row_to_dict(
            conn.execute("SELECT * FROM debate_sessions WHERE id = ?", (session_id,)).fetchone()
        )
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    if session["owner_id"] != user["id"] and not can_manage_session(user, session):
        raise HTTPException(status_code=403, detail="Not allowed")
    if session["status"] in {"completed", "cancelled"}:
        raise ValueError("This debate has already ended.")

    audio_path = None
    if audio is not None:
        suffix = Path(audio.filename or "audio.webm").suffix or ".webm"
        saved_name = f"session{session_id}_{uuid.uuid4().hex}{suffix}"
        saved_path = RECORDINGS_DIR / saved_name

        with open(saved_path, "wb") as out_file:
            shutil.copyfileobj(audio.file, out_file)

        audio_path = f"/recordings/{saved_name}"
        user_text = transcribe_audio(str(saved_path))
    elif message and message.strip():
        user_text = message.strip()
    else:
        raise ValueError("Record your argument or type it before sending.")

    if not user_text:
        raise ValueError("Couldn't make out that audio -- please try again.")

    with get_connection() as conn:
        history = get_debate_turns(conn, session_id)

    result = run_debate_turn(
        topic=session["topic"],
        debate_format=session["format"],
        position=session["position"],
        history=history,
        user_text=user_text,
        duration_seconds=duration_seconds,
    )
    fallacy_report: FallacyReport = result["fallacy_report"]
    argument_score: ArgumentScore = result["argument_score"]
    opponent_reply: str = result["opponent_reply"]
    words_per_minute = result["words_per_minute"]
    pace_status = result["pace_status"]

    with get_connection() as conn:
        save_debate_turn(
            conn, session_id, "user", user_text, fallacy_report, argument_score,
            words_per_minute=words_per_minute, pace_status=pace_status, audio_path=audio_path,
        )
        save_debate_turn(conn, session_id, "opponent", opponent_reply, None, None)
        if session["status"] == "scheduled":
            conn.execute(
                "UPDATE debate_sessions SET status = 'active' WHERE id = ?", (session_id,)
            )

    return {
        "transcript": user_text,
        "fallacy": fallacy_report.dict(),
        "score": argument_score.dict(),
        "wordsPerMinute": words_per_minute,
        "paceStatus": pace_status,
        "audioPath": audio_path,
        "opponentReply": opponent_reply,
    }


app.mount("/recordings", StaticFiles(directory=str(RECORDINGS_DIR)), name="recordings")

if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=False)