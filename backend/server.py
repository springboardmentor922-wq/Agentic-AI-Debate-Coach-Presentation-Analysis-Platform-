import json
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import urlparse

from auth import create_token, decode_token, verify_password
from database import create_default_profile, create_default_skills, get_connection, init_db, now_iso, row_to_dict


ROOT_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = ROOT_DIR / "frontend"
ROLE_LABELS = {
    "learner": "Learner",
    "coach": "Debate Coach",
    "educator": "Educator",
    "admin": "Administrator",
}
VALID_ROLES = set(ROLE_LABELS)
LEARNER_MANAGERS = {"coach", "educator", "admin"}
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


class DebateCoachHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(FRONTEND_DIR), **kwargs)

    def log_message(self, format, *args):
        print("%s - %s" % (self.address_string(), format % args))

    def end_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        super().end_headers()

    def do_OPTIONS(self):
        self.send_response(204)
        self.end_headers()

    def do_GET(self):
        path = urlparse(self.path).path
        if path.startswith("/api/"):
            return self.route("GET", path)
        if path == "/":
            self.path = "/index.html"
        return super().do_GET()

    def do_POST(self):
        self.route("POST", urlparse(self.path).path)

    def do_PUT(self):
        self.route("PUT", urlparse(self.path).path)

    def do_DELETE(self):
        self.route("DELETE", urlparse(self.path).path)

    def route(self, method, path):
        try:
            if method == "POST" and path == "/api/register":
                return self.register()
            if method == "POST" and path == "/api/login":
                return self.login()

            user = self.current_user()
            if not user:
                return self.json_response({"error": "Authentication required"}, 401)

            if method == "GET" and path == "/api/me":
                return self.json_response({"user": public_user(user)})
            if method == "GET" and path == "/api/topics":
                return self.json_response({"topics": DEBATE_TOPICS})
            if method == "GET" and path == "/api/dashboard":
                return self.dashboard(user)
            if method == "GET" and path == "/api/profile":
                return self.profile(user)
            if method == "PUT" and path == "/api/profile":
                return self.update_profile(user)
            if method == "GET" and path == "/api/skills":
                return self.skills(user)
            if method == "PUT" and path == "/api/skills":
                return self.update_skills(user)
            if method == "GET" and path == "/api/sessions":
                return self.sessions(user)
            if method == "POST" and path == "/api/sessions":
                return self.create_session(user)
            if method == "PUT" and path.startswith("/api/sessions/"):
                return self.update_session(user, path)
            if method == "DELETE" and path.startswith("/api/sessions/"):
                return self.delete_session(user, path)
            if method == "GET" and path == "/api/users":
                return self.users(user)
            if method == "GET" and path == "/api/admin/overview":
                return self.admin_overview(user)

            return self.json_response({"error": "Route not found"}, 404)
        except ValueError as exc:
            return self.json_response({"error": str(exc)}, 400)
        except Exception as exc:
            return self.json_response({"error": "Server error", "detail": str(exc)}, 500)

    def read_json(self):
        length = int(self.headers.get("Content-Length", 0))
        if length == 0:
            return {}
        raw = self.rfile.read(length).decode("utf-8")
        return json.loads(raw or "{}")

    def json_response(self, data, status=200):
        body = json.dumps(data).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def current_user(self):
        header = self.headers.get("Authorization", "")
        if not header.startswith("Bearer "):
            return None
        payload = decode_token(header.replace("Bearer ", "", 1))
        if not payload:
            return None
        with get_connection() as conn:
            row = conn.execute("SELECT * FROM users WHERE id = ?", (payload["sub"],)).fetchone()
            return row_to_dict(row)

    def register(self):
        data = self.read_json()
        required = ["name", "email", "password", "role"]
        if any(not data.get(field) for field in required):
            raise ValueError("Name, email, password, and role are required")
        if data["role"] not in VALID_ROLES:
            raise ValueError("Invalid role")
        if len(data["password"]) < 8:
            raise ValueError("Password must be at least 8 characters")

        from auth import hash_password

        with get_connection() as conn:
            try:
                cur = conn.execute(
                    "INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, ?)",
                    (data["name"].strip(), data["email"].lower().strip(), hash_password(data["password"]), data["role"], now_iso()),
                )
            except Exception:
                return self.json_response({"error": "An account with that email already exists"}, 409)
            user_id = cur.lastrowid
            create_default_profile(conn, user_id)
            create_default_skills(conn, user_id)
            row = conn.execute("SELECT * FROM users WHERE id = ?", (user_id,)).fetchone()
            user = row_to_dict(row)
        return self.json_response({"user": public_user(user), "token": create_token(user)}, 201)

    def login(self):
        data = self.read_json()
        with get_connection() as conn:
            row = conn.execute("SELECT * FROM users WHERE email = ?", (data.get("email", "").lower().strip(),)).fetchone()
            user = row_to_dict(row)
        if not user or not verify_password(data.get("password", ""), user["password_hash"]):
            return self.json_response({"error": "Invalid email or password"}, 401)
        return self.json_response({"user": public_user(user), "token": create_token(user)})

    def dashboard(self, user):
        with get_connection() as conn:
            sessions = visible_sessions(conn, user)
            skills = conn.execute("SELECT skill_name, score FROM skills WHERE user_id = ? ORDER BY skill_name", (user["id"],)).fetchall()
            users_total = conn.execute("SELECT COUNT(*) AS total FROM users").fetchone()["total"]
            learners_total = conn.execute("SELECT COUNT(*) AS total FROM users WHERE role = 'learner'").fetchone()["total"]
        completed = sum(1 for session in sessions if session["status"] == "completed")
        scheduled = sum(1 for session in sessions if session["status"] == "scheduled")
        avg_skill = round(sum(row["score"] for row in skills) / max(len(skills), 1))
        return self.json_response(
            {
                "stats": {
                    "visibleSessions": len(sessions),
                    "scheduledSessions": scheduled,
                    "completedSessions": completed,
                    "averageSkill": avg_skill,
                    "platformUsers": users_total,
                    "learners": learners_total,
                },
                "skills": [dict(row) for row in skills],
                "recentSessions": sessions[:4],
                "roleLabel": ROLE_LABELS[user["role"]],
            }
        )

    def profile(self, user):
        with get_connection() as conn:
            row = conn.execute("SELECT * FROM profiles WHERE user_id = ?", (user["id"],)).fetchone()
        return self.json_response({"profile": row_to_dict(row)})

    def update_profile(self, user):
        data = self.read_json()
        fields = ["experience_level", "preferred_topics", "presentation_domains", "learning_goals", "coaching_preferences"]
        values = [str(data.get(field, "")).strip() for field in fields]
        with get_connection() as conn:
            conn.execute(
                """
                UPDATE profiles
                SET experience_level = ?, preferred_topics = ?, presentation_domains = ?, learning_goals = ?, coaching_preferences = ?
                WHERE user_id = ?
                """,
                (*values, user["id"]),
            )
        return self.profile(user)

    def skills(self, user):
        with get_connection() as conn:
            rows = conn.execute("SELECT skill_name, score, updated_at FROM skills WHERE user_id = ? ORDER BY skill_name", (user["id"],)).fetchall()
        return self.json_response({"skills": [dict(row) for row in rows]})

    def update_skills(self, user):
        data = self.read_json()
        skills = data.get("skills", [])
        with get_connection() as conn:
            for item in skills:
                name = str(item.get("skill_name", "")).strip()
                score = max(0, min(100, int(item.get("score", 50))))
                if name:
                    conn.execute(
                        "UPDATE skills SET score = ?, updated_at = ? WHERE user_id = ? AND skill_name = ?",
                        (score, now_iso(), user["id"], name),
                    )
        return self.skills(user)

    def sessions(self, user):
        with get_connection() as conn:
            return self.json_response({"sessions": visible_sessions(conn, user)})

    def create_session(self, user):
        data = self.read_json()
        required = ["topic", "format", "position", "opponent_type", "scheduled_for"]
        if any(not data.get(field) for field in required):
            raise ValueError("Topic, format, position, opponent type, and schedule are required")
        if data["topic"] not in DEBATE_TOPICS:
            raise ValueError("Choose a topic from the approved debate topic list")
        with get_connection() as conn:
            cur = conn.execute(
                """
                INSERT INTO debate_sessions
                (owner_id, topic, format, position, opponent_type, scheduled_for, status, notes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, 'scheduled', ?, ?)
                """,
                (
                    user["id"],
                    data["topic"].strip(),
                    data["format"],
                    data["position"],
                    data["opponent_type"],
                    data["scheduled_for"],
                    data.get("notes", "").strip(),
                    now_iso(),
                ),
            )
            row = conn.execute("SELECT * FROM debate_sessions WHERE id = ?", (cur.lastrowid,)).fetchone()
        return self.json_response({"session": row_to_dict(row)}, 201)

    def update_session(self, user, path):
        session_id = parse_id(path)
        data = self.read_json()
        status = data.get("status")
        if status not in {"scheduled", "active", "completed", "cancelled"}:
            raise ValueError("Invalid session status")
        with get_connection() as conn:
            session = conn.execute("SELECT * FROM debate_sessions WHERE id = ?", (session_id,)).fetchone()
            if not can_manage_session(user, session):
                return self.json_response({"error": "Not allowed"}, 403)
            conn.execute("UPDATE debate_sessions SET status = ? WHERE id = ?", (status, session_id))
        return self.sessions(user)

    def delete_session(self, user, path):
        session_id = parse_id(path)
        with get_connection() as conn:
            session = conn.execute("SELECT * FROM debate_sessions WHERE id = ?", (session_id,)).fetchone()
            if not can_manage_session(user, session):
                return self.json_response({"error": "Not allowed"}, 403)
            conn.execute("DELETE FROM debate_sessions WHERE id = ?", (session_id,))
        return self.json_response({"ok": True})

    def users(self, user):
        if user["role"] not in LEARNER_MANAGERS:
            return self.json_response({"error": "Not allowed"}, 403)
        with get_connection() as conn:
            if user["role"] == "admin":
                rows = conn.execute("SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC").fetchall()
            else:
                rows = conn.execute("SELECT id, name, email, role, created_at FROM users WHERE role = 'learner' ORDER BY created_at DESC").fetchall()
        return self.json_response({"users": [dict(row) for row in rows], "scope": people_scope(user)})

    def admin_overview(self, user):
        if user["role"] != "admin":
            return self.json_response({"error": "Administrator access required"}, 403)
        with get_connection() as conn:
            role_rows = conn.execute("SELECT role, COUNT(*) AS total FROM users GROUP BY role ORDER BY role").fetchall()
            status_rows = conn.execute("SELECT status, COUNT(*) AS total FROM debate_sessions GROUP BY status ORDER BY status").fetchall()
            total_sessions = conn.execute("SELECT COUNT(*) AS total FROM debate_sessions").fetchone()["total"]
        return self.json_response(
            {
                "roles": [dict(row) for row in role_rows],
                "sessionStatuses": [dict(row) for row in status_rows],
                "totalSessions": total_sessions,
                "backendAccess": [
                    "/api/users",
                    "/api/sessions",
                    "/api/profile",
                    "/api/skills",
                    "/api/topics",
                    "/api/admin/overview",
                ],
            }
        )


def parse_id(path):
    try:
        return int(path.rstrip("/").split("/")[-1])
    except Exception:
        raise ValueError("Invalid session id")


def visible_sessions(conn, user):
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
    return [dict(row) for row in rows]


def can_manage_session(user, session):
    if not session:
        return False
    if user["role"] == "admin":
        return True
    if user["role"] in {"coach", "educator"}:
        return True
    return session["owner_id"] == user["id"]


def people_scope(user):
    if user["role"] == "coach":
        return "learners"
    if user["role"] == "educator":
        return "students"
    if user["role"] == "admin":
        return "platform"
    return "self"


def public_user(user):
    return {
        "id": user["id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "roleLabel": ROLE_LABELS[user["role"]],
    }


if __name__ == "__main__":
    init_db()
    server = ThreadingHTTPServer(("localhost", 8000), DebateCoachHandler)
    print("Debate Coach milestone 1 running at http://localhost:8000")
    server.serve_forever()
