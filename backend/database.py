import json
import sqlite3
from datetime import datetime, timedelta
from pathlib import Path

from auth import hash_password


BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "debate_coach.db"
RECORDINGS_DIR = BASE_DIR / "recordings"
RECORDINGS_DIR.mkdir(exist_ok=True)


DEFAULT_SKILLS = {
    "Argument Clarity": 62,
    "Evidence Usage": 54,
    "Logical Consistency": 58,
    "Rebuttal Effectiveness": 49,
    "Communication Delivery": 66,
}

DEFAULT_PROFILE_BY_ROLE = {
    "learner": {
        "experience_level": "Beginner",
        "preferred_topics": "Technology, Education, Public Policy",
        "presentation_domains": "Academic, Professional",
        "learning_goals": "Build clearer arguments and stronger rebuttals",
        "coaching_preferences": "Direct feedback with practical exercises",
    },
    "coach": {
        "experience_level": "Intermediate",
        "specialization": "General Debate Coaching",
        "years_of_experience": "1-3 years",
        "coaching_preferences": "Structured, evidence-based feedback",
    },
    "educator": {
        "experience_level": "Intermediate",
        "institution": "",
        "specialization": "Public Speaking & Debate",
        "years_of_experience": "1-3 years",
    },
    "admin": {},
}


def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn


def now_iso():
    return datetime.utcnow().replace(microsecond=0).isoformat() + "Z"


def init_db():
    with get_connection() as conn:
        conn.executescript(
            """
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password_hash TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('learner', 'coach', 'educator', 'admin')),
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS profiles (
                user_id INTEGER PRIMARY KEY,
                experience_level TEXT NOT NULL DEFAULT 'Beginner',
                preferred_topics TEXT NOT NULL DEFAULT '',
                presentation_domains TEXT NOT NULL DEFAULT '',
                learning_goals TEXT NOT NULL DEFAULT '',
                coaching_preferences TEXT NOT NULL DEFAULT '',
                specialization TEXT NOT NULL DEFAULT '',
                institution TEXT NOT NULL DEFAULT '',
                years_of_experience TEXT NOT NULL DEFAULT '',
                FOREIGN KEY(user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS skills (
                user_id INTEGER NOT NULL,
                skill_name TEXT NOT NULL,
                score INTEGER NOT NULL DEFAULT 50,
                updated_at TEXT NOT NULL,
                PRIMARY KEY(user_id, skill_name),
                FOREIGN KEY(user_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS debate_sessions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                owner_id INTEGER NOT NULL,
                topic TEXT NOT NULL,
                format TEXT NOT NULL,
                position TEXT NOT NULL,
                opponent_type TEXT NOT NULL,
                difficulty TEXT NOT NULL DEFAULT 'Advanced',
                scheduled_for TEXT NOT NULL,
                status TEXT NOT NULL CHECK(status IN ('scheduled', 'active', 'completed', 'cancelled')),
                notes TEXT NOT NULL DEFAULT '',
                created_at TEXT NOT NULL,
                FOREIGN KEY(owner_id) REFERENCES users(id)
            );

            CREATE TABLE IF NOT EXISTS otp_codes (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email TEXT NOT NULL,
                code TEXT NOT NULL,
                purpose TEXT NOT NULL DEFAULT 'login',
                expires_at TEXT NOT NULL,
                consumed INTEGER NOT NULL DEFAULT 0,
                created_at TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS debate_turns (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                speaker TEXT NOT NULL CHECK(speaker IN ('user', 'opponent')),
                message TEXT NOT NULL,
                fallacy_detected INTEGER NOT NULL DEFAULT 0,
                fallacy_type TEXT,
                offending_text TEXT,
                explanation TEXT,
                correction_suggestion TEXT,
                created_at TEXT NOT NULL,
                FOREIGN KEY(session_id) REFERENCES debate_sessions(id)
            );

            CREATE TABLE IF NOT EXISTS debate_session_summaries (
                session_id INTEGER PRIMARY KEY,
                turns_count INTEGER NOT NULL DEFAULT 0,
                avg_overall INTEGER NOT NULL DEFAULT 0,
                avg_clarity INTEGER NOT NULL DEFAULT 0,
                avg_relevance INTEGER NOT NULL DEFAULT 0,
                avg_evidence INTEGER NOT NULL DEFAULT 0,
                avg_consistency INTEGER NOT NULL DEFAULT 0,
                avg_persuasiveness INTEGER NOT NULL DEFAULT 0,
                fallacy_count INTEGER NOT NULL DEFAULT 0,
                overall_assessment TEXT NOT NULL DEFAULT '',
                strengths TEXT NOT NULL DEFAULT '[]',
                areas_to_improve TEXT NOT NULL DEFAULT '[]',
                suggested_next_steps TEXT NOT NULL DEFAULT '[]',
                created_at TEXT NOT NULL,
                FOREIGN KEY(session_id) REFERENCES debate_sessions(id)
            );

            CREATE TABLE IF NOT EXISTS coach_feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id INTEGER NOT NULL,
                coach_id INTEGER NOT NULL,
                feedback_text TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY(session_id) REFERENCES debate_sessions(id),
                FOREIGN KEY(coach_id) REFERENCES users(id)
            );
            

            CREATE TABLE IF NOT EXISTS coach_tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                assigned_by INTEGER NOT NULL,
                learner_id INTEGER NOT NULL,
                title TEXT NOT NULL,
                description TEXT NOT NULL DEFAULT '',
                status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'completed')),
                created_at TEXT NOT NULL,
                FOREIGN KEY(assigned_by) REFERENCES users(id),
                FOREIGN KEY(learner_id) REFERENCES users(id)
            );


            CREATE TABLE IF NOT EXISTS coach_assignments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                learner_id INTEGER NOT NULL UNIQUE,
                coach_id INTEGER,
                assigned_by TEXT NOT NULL DEFAULT 'learner',
                created_at TEXT NOT NULL,
                FOREIGN KEY(learner_id) REFERENCES users(id),
                FOREIGN KEY(coach_id) REFERENCES users(id)
            );
            """
        )
        migrate_schema(conn)
        seed_data(conn)


def migrate_schema(conn):
    existing_profile_columns = {row["name"] for row in conn.execute("PRAGMA table_info(profiles)").fetchall()}
    new_profile_columns = {
        "specialization": "TEXT NOT NULL DEFAULT ''",
        "institution": "TEXT NOT NULL DEFAULT ''",
        "years_of_experience": "TEXT NOT NULL DEFAULT ''",
    }
    for column, definition in new_profile_columns.items():
        if column not in existing_profile_columns:
            conn.execute(f"ALTER TABLE profiles ADD COLUMN {column} {definition}")

    existing_turn_columns = {row["name"] for row in conn.execute("PRAGMA table_info(debate_turns)").fetchall()}
    new_turn_columns = {
        "main_claim": "TEXT",
        "evidence_offered": "TEXT",
        "evidence_present": "INTEGER",
        "reasoning_notes": "TEXT",
        "clarity_score": "INTEGER",
        "relevance_score": "INTEGER",
        "evidence_score": "INTEGER",
        "consistency_score": "INTEGER",
        "persuasiveness_score": "INTEGER",
        "overall_score": "INTEGER",
        "score_feedback": "TEXT",
        "words_per_minute": "INTEGER",
        "pace_status": "TEXT",
        "audio_path": "TEXT",
        # Milestone 3: Counterargument Generation Engine
        "rebuttal_type": "TEXT",
        "challenge_question": "TEXT",
        "strategy_suggestion": "TEXT",
    }
    for column, definition in new_turn_columns.items():
        if column not in existing_turn_columns:
            conn.execute(f"ALTER TABLE debate_turns ADD COLUMN {column} {definition}")

    # Milestone 3: AI Debate Simulation Engine -- difficulty level
    existing_session_columns = {row["name"] for row in conn.execute("PRAGMA table_info(debate_sessions)").fetchall()}
    if "difficulty" not in existing_session_columns:
        conn.execute("ALTER TABLE debate_sessions ADD COLUMN difficulty TEXT NOT NULL DEFAULT 'Advanced'")


def seed_data(conn):
    users = [
        ("Aarav Learner", "learner@example.com", "learner"),
        ("Mira Coach", "coach@example.com", "coach"),
        ("Isha Educator", "educator@example.com", "educator"),
        ("Nolan Admin", "admin@example.com", "admin"),
    ]
    for name, email, role in users:
        row = conn.execute("SELECT id FROM users WHERE email = ?", (email,)).fetchone()
        if row:
            continue
        cur = conn.execute(
            "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)",
            (name, email, hash_password("password123"), role, now_iso()),
        )
        user_id = cur.lastrowid
        create_default_profile(conn, user_id, role)
        create_default_skills(conn, user_id)

    learner = conn.execute("SELECT id FROM users WHERE email = ?", ("learner@example.com",)).fetchone()
    if learner:
        existing = conn.execute("SELECT COUNT(*) AS total FROM debate_sessions").fetchone()["total"]
        if existing == 0:
            scheduled = (datetime.utcnow() + timedelta(days=2)).strftime("%Y-%m-%dT%H:%M")
            conn.execute(
                """
                INSERT INTO debate_sessions
                (owner_id, topic, format, position, opponent_type, difficulty, scheduled_for, status, notes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    learner["id"],
                    "Should AI tools be allowed in classroom debate preparation?",
                    "Oxford Debate",
                    "For",
                    "AI Simulation",
                    "Advanced",
                    scheduled,
                    "scheduled",
                    "Focus on evidence quality and ethical trade-offs.",
                    now_iso(),
                ),
            )


def create_default_profile(conn, user_id, role="learner", details=None):
    details = details or {}
    values = dict(DEFAULT_PROFILE_BY_ROLE.get(role, {}))
    for key in (
        "experience_level",
        "preferred_topics",
        "presentation_domains",
        "learning_goals",
        "coaching_preferences",
        "specialization",
        "institution",
        "years_of_experience",
    ):
        supplied = (details.get(key) or "").strip() if isinstance(details.get(key), str) else details.get(key)
        if supplied:
            values[key] = supplied

    conn.execute(
        """
        INSERT OR IGNORE INTO profiles
        (user_id, experience_level, preferred_topics, presentation_domains, learning_goals,
         coaching_preferences, specialization, institution, years_of_experience)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            user_id,
            values.get("experience_level", "Beginner"),
            values.get("preferred_topics", ""),
            values.get("presentation_domains", ""),
            values.get("learning_goals", ""),
            values.get("coaching_preferences", ""),
            values.get("specialization", ""),
            values.get("institution", ""),
            values.get("years_of_experience", ""),
        ),
    )


def create_default_skills(conn, user_id):
    for skill_name, score in DEFAULT_SKILLS.items():
        conn.execute(
            "INSERT OR IGNORE INTO skills (user_id, skill_name, score, updated_at) VALUES (?, ?, ?, ?)",
            (user_id, skill_name, score, now_iso()),
        )


def create_otp(conn, email, code, ttl_seconds=300, purpose="login"):
    expires_at = (datetime.utcnow() + timedelta(seconds=ttl_seconds)).replace(microsecond=0).isoformat() + "Z"
    conn.execute(
        "INSERT INTO otp_codes (email, code, purpose, expires_at, consumed, created_at) VALUES (?, ?, ?, ?, 0, ?)",
        (email, code, purpose, expires_at, now_iso()),
    )


def get_valid_otp(conn, email, code, purpose="login"):
    row = conn.execute(
        """
        SELECT * FROM otp_codes
        WHERE email = ? AND code = ? AND purpose = ? AND consumed = 0
        ORDER BY id DESC LIMIT 1
        """,
        (email, code, purpose),
    ).fetchone()
    if not row:
        return None
    if row["expires_at"] < now_iso():
        return None
    return row


def consume_otp(conn, otp_id):
    conn.execute("UPDATE otp_codes SET consumed = 1 WHERE id = ?", (otp_id,))


def sync_session_statuses(conn):
    now = datetime.utcnow()
    rows = conn.execute(
        "SELECT id, scheduled_for FROM debate_sessions WHERE status = 'scheduled'"
    ).fetchall()
    for row in rows:
        try:
            scheduled_dt = datetime.fromisoformat(row["scheduled_for"])
        except ValueError:
            continue
        if scheduled_dt < now:
            conn.execute("UPDATE debate_sessions SET status = 'cancelled' WHERE id = ?", (row["id"],))


def save_debate_turn(
    conn,
    session_id,
    speaker,
    message,
    fallacy_report=None,
    argument_score=None,
    words_per_minute=None,
    pace_status=None,
    audio_path=None,
    rebuttal_type=None,
    challenge_question=None,
    strategy_suggestion=None,
):
    detected = bool(fallacy_report and fallacy_report.fallacy_detected)
    conn.execute(
        """
        INSERT INTO debate_turns
        (session_id, speaker, message, fallacy_detected, fallacy_type,
         offending_text, explanation, correction_suggestion,
         main_claim, evidence_offered, evidence_present, reasoning_notes,
         clarity_score, relevance_score, evidence_score, consistency_score,
         persuasiveness_score, overall_score, score_feedback,
         words_per_minute, pace_status, audio_path,
         rebuttal_type, challenge_question, strategy_suggestion, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            session_id,
            speaker,
            message,
            1 if detected else 0,
            fallacy_report.fallacy_type if detected else None,
            fallacy_report.offending_text if detected else None,
            fallacy_report.explanation if detected else None,
            fallacy_report.correction_suggestion if detected else None,
            argument_score.main_claim if argument_score else None,
            json.dumps(argument_score.evidence_offered) if argument_score else None,
            (1 if argument_score.evidence_present else 0) if argument_score else None,
            argument_score.reasoning_notes if argument_score else None,
            argument_score.clarity if argument_score else None,
            argument_score.relevance if argument_score else None,
            argument_score.evidence_strength if argument_score else None,
            argument_score.logical_consistency if argument_score else None,
            argument_score.persuasiveness if argument_score else None,
            argument_score.overall_score if argument_score else None,
            argument_score.feedback if argument_score else None,
            words_per_minute,
            pace_status,
            audio_path,
            rebuttal_type,
            challenge_question,
            strategy_suggestion,
            now_iso(),
        ),
    )


def get_debate_turns(conn, session_id):
    rows = conn.execute(
        "SELECT * FROM debate_turns WHERE session_id = ? ORDER BY id ASC",
        (session_id,),
    ).fetchall()
    turns = []
    for row in rows:
        turn = dict(row)
        if turn.get("evidence_offered"):
            try:
                turn["evidence_offered"] = json.loads(turn["evidence_offered"])
            except (TypeError, ValueError):
                turn["evidence_offered"] = []
        else:
            turn["evidence_offered"] = []
        turns.append(turn)
    return turns


def compute_session_stats(conn, session_id):
    rows = conn.execute(
        """
        SELECT overall_score, clarity_score, relevance_score, evidence_score,
               consistency_score, persuasiveness_score, fallacy_detected
        FROM debate_turns WHERE session_id = ? AND speaker = 'user'
        """,
        (session_id,),
    ).fetchall()

    def avg(key):
        vals = [r[key] for r in rows if r[key] is not None]
        return round(sum(vals) / len(vals)) if vals else 0

    return {
        "turns_count": len(rows),
        "avg_overall": avg("overall_score"),
        "avg_clarity": avg("clarity_score"),
        "avg_relevance": avg("relevance_score"),
        "avg_evidence": avg("evidence_score"),
        "avg_consistency": avg("consistency_score"),
        "avg_persuasiveness": avg("persuasiveness_score"),
        "fallacy_count": sum(1 for r in rows if r["fallacy_detected"]),
    }


def save_session_summary(conn, session_id, stats, summary):
    conn.execute(
        """
        INSERT INTO debate_session_summaries
        (session_id, turns_count, avg_overall, avg_clarity, avg_relevance, avg_evidence,
         avg_consistency, avg_persuasiveness, fallacy_count, overall_assessment,
         strengths, areas_to_improve, suggested_next_steps, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(session_id) DO UPDATE SET
          turns_count=excluded.turns_count, avg_overall=excluded.avg_overall,
          avg_clarity=excluded.avg_clarity, avg_relevance=excluded.avg_relevance,
          avg_evidence=excluded.avg_evidence, avg_consistency=excluded.avg_consistency,
          avg_persuasiveness=excluded.avg_persuasiveness, fallacy_count=excluded.fallacy_count,
          overall_assessment=excluded.overall_assessment, strengths=excluded.strengths,
          areas_to_improve=excluded.areas_to_improve, suggested_next_steps=excluded.suggested_next_steps,
          created_at=excluded.created_at
        """,
        (
            session_id,
            stats["turns_count"],
            stats["avg_overall"],
            stats["avg_clarity"],
            stats["avg_relevance"],
            stats["avg_evidence"],
            stats["avg_consistency"],
            stats["avg_persuasiveness"],
            stats["fallacy_count"],
            summary.overall_assessment,
            json.dumps(summary.strengths),
            json.dumps(summary.areas_to_improve),
            json.dumps(summary.suggested_next_steps),
            now_iso(),
        ),
    )


def get_session_summary(conn, session_id):
    row = conn.execute(
        "SELECT * FROM debate_session_summaries WHERE session_id = ?", (session_id,)
    ).fetchone()
    if not row:
        return None
    data = dict(row)
    for key in ("strengths", "areas_to_improve", "suggested_next_steps"):
        try:
            data[key] = json.loads(data[key]) if data[key] else []
        except (TypeError, ValueError):
            data[key] = []
    return data


def attach_session_scores(conn, sessions):
    if not sessions:
        return sessions
    ids = [s["id"] for s in sessions]
    placeholders = ",".join("?" for _ in ids)
    rows = conn.execute(
        f"SELECT session_id, avg_overall FROM debate_session_summaries WHERE session_id IN ({placeholders})",
        ids,
    ).fetchall()
    score_map = {row["session_id"]: row["avg_overall"] for row in rows}
    for s in sessions:
        s["overall_score"] = score_map.get(s["id"])
    return sessions


def compute_learner_skills(conn, user_id):
    rows = conn.execute(
        """
        SELECT clarity_score, evidence_score, consistency_score, persuasiveness_score, overall_score
        FROM debate_turns
        JOIN debate_sessions ON debate_sessions.id = debate_turns.session_id
        WHERE debate_sessions.owner_id = ? AND debate_turns.speaker = 'user'
              AND debate_turns.overall_score IS NOT NULL
        """,
        (user_id,),
    ).fetchall()

    def avg(key):
        vals = [r[key] for r in rows if r[key] is not None]
        return round(sum(vals) / len(vals)) if vals else None

    computed = {
        "Argument Clarity": avg("clarity_score"),
        "Evidence Usage": avg("evidence_score"),
        "Logical Consistency": avg("consistency_score"),
        "Rebuttal Effectiveness": avg("persuasiveness_score"),
        "Communication Delivery": avg("overall_score"),
    }

    default_rows = conn.execute(
        "SELECT skill_name, score FROM skills WHERE user_id = ?", (user_id,)
    ).fetchall()
    defaults = {r["skill_name"]: r["score"] for r in default_rows}

    result = []
    for skill_name, computed_value in computed.items():
        result.append({
            "skill_name": skill_name,
            "score": computed_value if computed_value is not None else defaults.get(skill_name, 50),
            "is_live": computed_value is not None,
        })
    return result


def compute_learner_history_stats(conn, user_id):
    """Milestone 3: Recommendation & Coaching Engine input -- aggregates a
    learner's ENTIRE debate history (all sessions), not just one session."""
    rows = conn.execute(
        """
        SELECT clarity_score, relevance_score, evidence_score, consistency_score,
               persuasiveness_score, overall_score, fallacy_detected, fallacy_type
        FROM debate_turns
        JOIN debate_sessions ON debate_sessions.id = debate_turns.session_id
        WHERE debate_sessions.owner_id = ? AND debate_turns.speaker = 'user'
              AND debate_turns.overall_score IS NOT NULL
        """,
        (user_id,),
    ).fetchall()

    def avg(key):
        vals = [r[key] for r in rows if r[key] is not None]
        return round(sum(vals) / len(vals)) if vals else 0

    fallacy_counts = {}
    for r in rows:
        if r["fallacy_detected"] and r["fallacy_type"]:
            fallacy_counts[r["fallacy_type"]] = fallacy_counts.get(r["fallacy_type"], 0) + 1
    most_common_fallacy = max(fallacy_counts, key=fallacy_counts.get) if fallacy_counts else None

    return {
        "turns_count": len(rows),
        "avg_overall": avg("overall_score"),
        "avg_clarity": avg("clarity_score"),
        "avg_relevance": avg("relevance_score"),
        "avg_evidence": avg("evidence_score"),
        "avg_consistency": avg("consistency_score"),
        "avg_persuasiveness": avg("persuasiveness_score"),
        "most_common_fallacy": most_common_fallacy,
    }


def get_recent_activity(conn, limit=6):
    users = conn.execute(
        "SELECT name, role, created_at FROM users ORDER BY created_at DESC LIMIT ?", (limit,)
    ).fetchall()
    sessions = conn.execute(
        """
        SELECT debate_sessions.topic, users.name AS owner_name, debate_sessions.created_at
        FROM debate_sessions JOIN users ON users.id = debate_sessions.owner_id
        ORDER BY debate_sessions.created_at DESC LIMIT ?
        """,
        (limit,),
    ).fetchall()

    feed = []
    for u in users:
        feed.append({
            "type": "user_registered",
            "text": f"New user registered: {u['name']} ({u['role']})",
            "created_at": u["created_at"],
        })
    for s in sessions:
        feed.append({
            "type": "session_created",
            "text": f"Debate session created: \"{s['topic']}\" by {s['owner_name']}",
            "created_at": s["created_at"],
        })

    feed.sort(key=lambda item: item["created_at"], reverse=True)
    return feed[:limit]


def compute_platform_average_score(conn):
    row = conn.execute("SELECT AVG(avg_overall) AS platform_avg FROM debate_session_summaries").fetchone()
    return round(row["platform_avg"]) if row and row["platform_avg"] is not None else 0


def update_user_role(conn, user_id, new_role):
    conn.execute("UPDATE users SET role = ? WHERE id = ?", (new_role, user_id))


def delete_user_cascade(conn, user_id):
    session_ids = [
        row["id"] for row in conn.execute(
            "SELECT id FROM debate_sessions WHERE owner_id = ?", (user_id,)
        ).fetchall()
    ]
    for sid in session_ids:
        conn.execute("DELETE FROM debate_turns WHERE session_id = ?", (sid,))
        conn.execute("DELETE FROM debate_session_summaries WHERE session_id = ?", (sid,))
    conn.execute("DELETE FROM debate_sessions WHERE owner_id = ?", (user_id,))
    conn.execute("DELETE FROM skills WHERE user_id = ?", (user_id,))
    conn.execute("DELETE FROM profiles WHERE user_id = ?", (user_id,))
    conn.execute("DELETE FROM users WHERE id = ?", (user_id,))


def compute_skill_gap_analysis(conn, coach_id=None):
    """Aggregates average skill scores across scored debate turns.
    If coach_id is given, scoped to only that coach's assigned learners
    (via coach_assignments). Otherwise (educator/admin), covers all learners
    platform-wide."""
    if coach_id is not None:
        rows = conn.execute(
            """
            SELECT debate_turns.clarity_score, debate_turns.evidence_score,
                   debate_turns.consistency_score, debate_turns.persuasiveness_score,
                   debate_turns.overall_score
            FROM debate_turns
            JOIN debate_sessions ON debate_sessions.id = debate_turns.session_id
            JOIN coach_assignments ON coach_assignments.learner_id = debate_sessions.owner_id
            WHERE coach_assignments.coach_id = ? AND debate_turns.speaker = 'user'
                  AND debate_turns.overall_score IS NOT NULL
            """,
            (coach_id,),
        ).fetchall()
    else:
        rows = conn.execute(
            """
            SELECT debate_turns.clarity_score, debate_turns.evidence_score,
                   debate_turns.consistency_score, debate_turns.persuasiveness_score,
                   debate_turns.overall_score
            FROM debate_turns
            JOIN debate_sessions ON debate_sessions.id = debate_turns.session_id
            JOIN users ON users.id = debate_sessions.owner_id
            WHERE users.role = 'learner' AND debate_turns.speaker = 'user'
                  AND debate_turns.overall_score IS NOT NULL
            """
        ).fetchall()

    def avg(key):
        vals = [r[key] for r in rows if r[key] is not None]
        return round(sum(vals) / len(vals)) if vals else 0

    return {
        "sample_size": len(rows),
        "skills": [
            {"skill_name": "Argument Clarity", "score": avg("clarity_score")},
            {"skill_name": "Evidence Usage", "score": avg("evidence_score")},
            {"skill_name": "Logical Consistency", "score": avg("consistency_score")},
            {"skill_name": "Rebuttal Effectiveness", "score": avg("persuasiveness_score")},
            {"skill_name": "Communication Delivery", "score": avg("overall_score")},
        ],
    }


def save_coach_feedback(conn, session_id, coach_id, feedback_text):
    conn.execute(
        "INSERT INTO coach_feedback (session_id, coach_id, feedback_text, created_at) VALUES (?, ?, ?, ?)",
        (session_id, coach_id, feedback_text, now_iso()),
    )


def get_coach_feedback(conn, session_id):
    rows = conn.execute(
        """
        SELECT coach_feedback.*, users.name AS coach_name
        FROM coach_feedback JOIN users ON users.id = coach_feedback.coach_id
        WHERE session_id = ? ORDER BY coach_feedback.id ASC
        """,
        (session_id,),
    ).fetchall()
    return [dict(row) for row in rows]


def set_learner_coach(conn, learner_id, coach_id, assigned_by="learner"):
    conn.execute(
        """
        INSERT INTO coach_assignments (learner_id, coach_id, assigned_by, created_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(learner_id) DO UPDATE SET
          coach_id = excluded.coach_id, assigned_by = excluded.assigned_by, created_at = excluded.created_at
        """,
        (learner_id, coach_id, assigned_by, now_iso()),
    )


def get_learner_coach(conn, learner_id):
    row = conn.execute(
        """
        SELECT coach_assignments.*, users.name AS coach_name, users.email AS coach_email
        FROM coach_assignments JOIN users ON users.id = coach_assignments.coach_id
        WHERE learner_id = ?
        """,
        (learner_id,),
    ).fetchone()
    return dict(row) if row else None


def get_assigned_learners(conn, coach_id):
    rows = conn.execute(
        """
        SELECT users.id, users.name, users.email, users.role, users.created_at
        FROM coach_assignments JOIN users ON users.id = coach_assignments.learner_id
        WHERE coach_assignments.coach_id = ? ORDER BY users.name
        """,
        (coach_id,),
    ).fetchall()
    return [dict(row) for row in rows]


def list_available_coaches(conn):
    rows = conn.execute(
        """
        SELECT users.id, users.name, users.email, profiles.specialization,
               (SELECT COUNT(*) FROM coach_assignments WHERE coach_assignments.coach_id = users.id) AS learner_count
        FROM users LEFT JOIN profiles ON profiles.user_id = users.id
        WHERE users.role = 'coach' ORDER BY users.name
        """
    ).fetchall()
    return [dict(row) for row in rows]


def create_task(conn, assigned_by, learner_id, title, description):
    conn.execute(
        "INSERT INTO coach_tasks (assigned_by, learner_id, title, description, status, created_at) "
        "VALUES (?, ?, ?, ?, 'pending', ?)",
        (assigned_by, learner_id, title, description, now_iso()),
    )


def get_tasks_for_learner(conn, learner_id):
    rows = conn.execute(
        """
        SELECT coach_tasks.*, users.name AS assigned_by_name
        FROM coach_tasks JOIN users ON users.id = coach_tasks.assigned_by
        WHERE learner_id = ? ORDER BY coach_tasks.created_at DESC
        """,
        (learner_id,),
    ).fetchall()
    return [dict(row) for row in rows]


def get_tasks_assigned_by(conn, coach_id):
    rows = conn.execute(
        """
        SELECT coach_tasks.*, users.name AS learner_name
        FROM coach_tasks JOIN users ON users.id = coach_tasks.learner_id
        WHERE assigned_by = ? ORDER BY coach_tasks.created_at DESC
        """,
        (coach_id,),
    ).fetchall()
    return [dict(row) for row in rows]


def mark_task_status(conn, task_id, learner_id, status):
    conn.execute(
        "UPDATE coach_tasks SET status = ? WHERE id = ? AND learner_id = ?",
        (status, task_id, learner_id),
    )


def row_to_dict(row):
    return dict(row) if row else None