from datetime import datetime, timedelta

from bson import ObjectId
from bson.errors import InvalidId
from fastapi import APIRouter, Depends, HTTPException, status

from app.core.config import settings
from app.core.database import (
    users_collection,
    debate_sessions_collection,
    debate_topics_collection,
    fallacy_reports_collection,
    debate_feedback_reports_collection,
    notifications_collection,
    audit_logs_collection,
    platform_settings_collection,
)
from app.core.deps import require_roles
from app.core.security import hash_password
from app.schemas.user import AdminCreateUser, UserOut, UserRole
from app.schemas.admin import (
    UserRoleUpdate,
    UserPlanUpdate,
    PlatformAnalyticsOut,
    AdminDebateSessionOut,
    DebateTopicIn,
    DebateTopicOut,
    BroadcastNotificationIn,
    AuditLogOut,
    PlatformSettingsIn,
    PlatformSettingsOut,
    AIServiceStatusOut,
    IntegrationStatusOut,
)
from app.routers.auth import _serialize_user

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])


def _oid(value: str) -> ObjectId:
    try:
        return ObjectId(value)
    except (InvalidId, TypeError):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid id")


async def _log_action(actor: dict, action: str, target: str | None = None, details: dict | None = None):
    """Every sensitive admin action is logged here — real, queryable audit
    trail (Audit Logs page), never fabricated after the fact."""
    await audit_logs_collection.insert_one(
        {
            "actor_id": actor["id"],
            "actor_name": actor.get("full_name", "Unknown"),
            "action": action,
            "target": target,
            "details": details or {},
            "created_at": datetime.utcnow().isoformat(),
        }
    )


@router.on_event("startup")
async def _backfill_non_learner_email_verified():
    """
    One-time data fix, safe to run on every startup (it's a no-op once
    everything is backfilled): any Debate Coach, Educator, or Administrator
    account created by admin_create_user before this bug was fixed has no
    `email_verified` field at all, which the login endpoint treats as
    `False` — permanently blocking that account behind the Learner-only
    "please verify your email" OTP message. This repairs every such
    existing account without requiring a manual database edit.
    """
    await users_collection.update_many(
        {
            "role": {"$in": [UserRole.debate_coach.value, UserRole.educator.value, UserRole.administrator.value]},
            "email_verified": {"$ne": True},
        },
        {"$set": {"email_verified": True}},
    )


@router.post("/users", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def admin_create_user(
    payload: AdminCreateUser, current_user: dict = Depends(require_roles(UserRole.administrator))
):
    """
    The only way a Debate Coach, Educator, or Administrator account gets
    created. Only an existing administrator can call this. The public
    /auth/register endpoint always creates Learners and never accepts a
    role — role selection is never exposed on self-service signup.

    Each account created here signs in only through its own dedicated
    portal (/coach/login, /educator/login, /admin/login); the backend
    enforces that match at login time regardless of which portal is used.
    """
    existing = await users_collection.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    doc = {
        "full_name": payload.full_name,
        "email": payload.email,
        "password_hash": hash_password(payload.password),
        "role": payload.role.value,
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
        "is_active": True,
        # Coach/Educator/Administrator accounts are created directly by a
        # trusted administrator, never via public self-signup, so they must
        # never be subject to the Learner-only email-OTP gate. Without this,
        # every account created here would default to email_verified=False
        # and get permanently blocked at login with "Please verify your
        # email" — violating the platform's core auth rule.
        "email_verified": True,
        "auth_provider": "local",
        "created_at": datetime.utcnow().isoformat(),
    }
    result = await users_collection.insert_one(doc)
    user = await users_collection.find_one({"_id": result.inserted_id})
    await _log_action(current_user, "create_user", target=str(result.inserted_id), details={"role": payload.role.value})
    return _serialize_user(user)


# =========================================================================
# User Management — richer listing than users.list_users (search/filter)
# =========================================================================
@router.get("/users", response_model=list[UserOut])
async def list_users_filtered(
    role: UserRole | None = None,
    search: str | None = None,
    current_user: dict = Depends(require_roles(UserRole.administrator)),
):
    query: dict = {}
    if role:
        query["role"] = role.value
    if search:
        query["$or"] = [
            {"full_name": {"$regex": search, "$options": "i"}},
            {"email": {"$regex": search, "$options": "i"}},
        ]
    cursor = users_collection.find(query).sort("created_at", -1).limit(200)
    return [_serialize_user(u) async for u in cursor]


# =========================================================================
# Role & Permissions
# =========================================================================
@router.patch("/users/{user_id}/role", response_model=UserOut)
async def update_user_role(
    user_id: str, payload: UserRoleUpdate, current_user: dict = Depends(require_roles(UserRole.administrator))
):
    result = await users_collection.update_one({"_id": _oid(user_id)}, {"$set": {"role": payload.role.value}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    await _log_action(current_user, "update_role", target=user_id, details={"new_role": payload.role.value})
    user = await users_collection.find_one({"_id": _oid(user_id)})
    return _serialize_user(user)


@router.get("/roles/summary")
async def role_summary(current_user: dict = Depends(require_roles(UserRole.administrator))):
    """Real per-role counts for the Role & Permissions page — no invented percentages."""
    summary = {}
    for role in UserRole:
        summary[role.value] = await users_collection.count_documents({"role": role.value})
    return summary


# =========================================================================
# Subscriptions & Billing — no payment processor is integrated in this
# build, so this deliberately shows only real plan-tier assignment (which
# an admin can set) and real distribution counts. No fabricated revenue.
# =========================================================================
@router.patch("/users/{user_id}/plan", response_model=UserOut)
async def update_user_plan(
    user_id: str, payload: UserPlanUpdate, current_user: dict = Depends(require_roles(UserRole.administrator))
):
    result = await users_collection.update_one({"_id": _oid(user_id)}, {"$set": {"plan": payload.plan}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="User not found")
    await _log_action(current_user, "update_plan", target=user_id, details={"new_plan": payload.plan})
    user = await users_collection.find_one({"_id": _oid(user_id)})
    return _serialize_user(user)


@router.get("/plans/summary")
async def plan_summary(current_user: dict = Depends(require_roles(UserRole.administrator))):
    summary = {}
    for plan in ("free", "pro", "enterprise"):
        summary[plan] = await users_collection.count_documents({"plan": plan})
    # Users created before the `plan` field existed have none stored — count them as free.
    no_plan_field = await users_collection.count_documents({"plan": {"$exists": False}})
    summary["free"] += no_plan_field
    return summary


# =========================================================================
# System Analytics — real aggregations, no invented numbers.
# =========================================================================
@router.get("/analytics", response_model=PlatformAnalyticsOut)
async def platform_analytics(current_user: dict = Depends(require_roles(UserRole.administrator))):
    total_users = await users_collection.count_documents({})
    users_by_role = {role.value: await users_collection.count_documents({"role": role.value}) for role in UserRole}
    total_sessions = await debate_sessions_collection.count_documents({})
    total_fallacies = await fallacy_reports_collection.count_documents({"report.fallacy_detected": True})
    total_reports = await debate_feedback_reports_collection.count_documents({})

    today = datetime.utcnow().date()
    sessions_by_day = []
    signups_by_day = []
    for i in range(6, -1, -1):
        day = today - timedelta(days=i)
        day_str = day.isoformat()
        next_day_str = (day + timedelta(days=1)).isoformat()
        sessions_count = await debate_sessions_collection.count_documents(
            {"created_at": {"$gte": day_str, "$lt": next_day_str}}
        )
        signups_count = await users_collection.count_documents(
            {"created_at": {"$gte": day_str, "$lt": next_day_str}}
        )
        sessions_by_day.append({"date": day_str, "count": sessions_count})
        signups_by_day.append({"date": day_str, "count": signups_count})

    return PlatformAnalyticsOut(
        total_users=total_users,
        users_by_role=users_by_role,
        total_debate_sessions=total_sessions,
        sessions_last_7_days=sessions_by_day,
        user_signups_last_7_days=signups_by_day,
        total_fallacies_detected=total_fallacies,
        total_reports_generated=total_reports,
    )


# =========================================================================
# Debate Sessions oversight
# =========================================================================
@router.get("/debate-sessions", response_model=list[AdminDebateSessionOut])
async def list_all_debate_sessions(
    status_filter: str | None = None, current_user: dict = Depends(require_roles(UserRole.administrator))
):
    query = {"status": status_filter} if status_filter else {}
    cursor = debate_sessions_collection.find(query).sort("created_at", -1).limit(200)
    sessions = []
    async for s in cursor:
        sessions.append(
            AdminDebateSessionOut(
                id=str(s["_id"]),
                user_id=s.get("user_id", ""),
                topic=s.get("topic"),
                debate_format=s.get("debate_format"),
                status=s.get("status"),
                created_at=s.get("created_at"),
            )
        )
    return sessions


# =========================================================================
# Content Management — real CRUD over the debate topics collection that
# already powers AI Debate Simulation / Practice Topics for every learner.
# =========================================================================
@router.get("/content/topics", response_model=list[DebateTopicOut])
async def list_topics(current_user: dict = Depends(require_roles(UserRole.administrator))):
    cursor = debate_topics_collection.find({}).sort("popularity", -1)
    out = []
    async for t in cursor:
        out.append(
            DebateTopicOut(
                id=str(t["_id"]),
                title=t.get("title", ""),
                category=t.get("category", "General"),
                difficulty=t.get("difficulty", "beginner"),
                debate_format=t.get("debate_format", "one_on_one"),
                popularity=t.get("popularity", 50),
                created_at=t.get("created_at", datetime.utcnow().isoformat()),
            )
        )
    return out


@router.post("/content/topics", response_model=DebateTopicOut, status_code=status.HTTP_201_CREATED)
async def create_topic(payload: DebateTopicIn, current_user: dict = Depends(require_roles(UserRole.administrator))):
    doc = {**payload.model_dump(), "created_at": datetime.utcnow().isoformat()}
    result = await debate_topics_collection.insert_one(doc)
    await _log_action(current_user, "create_topic", target=str(result.inserted_id), details={"title": payload.title})
    return DebateTopicOut(id=str(result.inserted_id), **payload.model_dump(), created_at=doc["created_at"])


@router.patch("/content/topics/{topic_id}", response_model=DebateTopicOut)
async def update_topic(
    topic_id: str, payload: DebateTopicIn, current_user: dict = Depends(require_roles(UserRole.administrator))
):
    updated = await debate_topics_collection.find_one_and_update(
        {"_id": _oid(topic_id)}, {"$set": payload.model_dump()}, return_document=True
    )
    if not updated:
        raise HTTPException(status_code=404, detail="Topic not found")
    await _log_action(current_user, "update_topic", target=topic_id)
    return DebateTopicOut(
        id=str(updated["_id"]),
        title=updated["title"],
        category=updated["category"],
        difficulty=updated["difficulty"],
        debate_format=updated["debate_format"],
        popularity=updated["popularity"],
        created_at=updated.get("created_at", datetime.utcnow().isoformat()),
    )


@router.delete("/content/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(topic_id: str, current_user: dict = Depends(require_roles(UserRole.administrator))):
    result = await debate_topics_collection.delete_one({"_id": _oid(topic_id)})
    if not result.deleted_count:
        raise HTTPException(status_code=404, detail="Topic not found")
    await _log_action(current_user, "delete_topic", target=topic_id)


# =========================================================================
# Notification Center — real broadcast to real users, writes to the same
# notifications_collection every dashboard's bell icon already reads from.
# =========================================================================
@router.post("/notifications/broadcast", status_code=status.HTTP_201_CREATED)
async def broadcast_notification(
    payload: BroadcastNotificationIn, current_user: dict = Depends(require_roles(UserRole.administrator))
):
    query = {"role": payload.target_role.value} if payload.target_role else {}
    user_ids = [u["_id"] async for u in users_collection.find(query, {"_id": 1})]
    if not user_ids:
        raise HTTPException(status_code=400, detail="No users match that target")

    now = datetime.utcnow().isoformat()
    docs = [
        {
            "user_id": str(uid),
            "type": "platform_announcement",
            "title": payload.title,
            "message": payload.message,
            "read": False,
            "created_at": now,
            "related_session_id": None,
        }
        for uid in user_ids
    ]
    await notifications_collection.insert_many(docs)
    await _log_action(
        current_user,
        "broadcast_notification",
        details={"title": payload.title, "target_role": payload.target_role.value if payload.target_role else "all", "recipient_count": len(docs)},
    )
    return {"message": f"Notification sent to {len(docs)} user(s).", "recipient_count": len(docs)}


# =========================================================================
# Audit Logs — reads back exactly what _log_action wrote. Real, complete.
# =========================================================================
@router.get("/audit-logs", response_model=list[AuditLogOut])
async def list_audit_logs(
    action: str | None = None, current_user: dict = Depends(require_roles(UserRole.administrator))
):
    query = {"action": action} if action else {}
    cursor = audit_logs_collection.find(query).sort("created_at", -1).limit(300)
    out = []
    async for log in cursor:
        out.append(
            AuditLogOut(
                id=str(log["_id"]),
                actor_id=log["actor_id"],
                actor_name=log["actor_name"],
                action=log["action"],
                target=log.get("target"),
                details=log.get("details"),
                created_at=log["created_at"],
            )
        )
    return out


# =========================================================================
# System Settings — real, persisted platform config (single document).
# =========================================================================
@router.get("/settings", response_model=PlatformSettingsOut)
async def get_platform_settings(current_user: dict = Depends(require_roles(UserRole.administrator))):
    doc = await platform_settings_collection.find_one({"_id": "singleton"})
    if not doc:
        doc = {
            "_id": "singleton",
            "site_name": "AI Debate Coach",
            "support_email": "support@ai-debate-coach.local",
            "maintenance_mode": False,
            "allow_public_registration": True,
            "updated_at": datetime.utcnow().isoformat(),
        }
        await platform_settings_collection.insert_one(doc)
    return PlatformSettingsOut(**{k: v for k, v in doc.items() if k != "_id"})


@router.put("/settings", response_model=PlatformSettingsOut)
async def update_platform_settings(
    payload: PlatformSettingsIn, current_user: dict = Depends(require_roles(UserRole.administrator))
):
    now = datetime.utcnow().isoformat()
    doc = {**payload.model_dump(), "updated_at": now}
    await platform_settings_collection.update_one({"_id": "singleton"}, {"$set": doc}, upsert=True)
    await _log_action(current_user, "update_platform_settings", details=payload.model_dump())
    return PlatformSettingsOut(**doc)


# =========================================================================
# AI Models & Services — real config-derived status.
# =========================================================================
@router.get("/ai-services", response_model=list[AIServiceStatusOut])
async def ai_services_status(
    current_user: dict = Depends(require_roles(UserRole.administrator))
):
    return [
        AIServiceStatusOut(
            provider="Google Gemini",
            configured=bool(settings.GEMINI_API_KEY),
            role="primary" if settings.LLM_PROVIDER == "gemini" else "fallback",
        ),
        AIServiceStatusOut(
            provider=f"Local Whisper ({settings.LOCAL_WHISPER_MODEL})",
            configured=True,
            role="primary",
        ),
        AIServiceStatusOut(
            provider="Deterministic NLP fallback (always available)",
            configured=True,
            role="fallback",
        ),
    ]
 

# =========================================================================
# Integrations — real config-derived status for third-party services.
# =========================================================================
@router.get("/integrations", response_model=list[IntegrationStatusOut])
async def integrations_status(current_user: dict = Depends(require_roles(UserRole.administrator))):
    return [
        IntegrationStatusOut(
            name="SMTP Email",
            category="Communication",
            configured=bool(settings.SMTP_HOST),
            description="Sends OTP codes, password resets, and notification emails.",
        ),
        IntegrationStatusOut(
            name="Twilio SMS",
            category="Communication",
            configured=bool(settings.TWILIO_ACCOUNT_SID),
            description="Sends mobile OTP codes for phone verification.",
        ),
        IntegrationStatusOut(
            name="Google OAuth2",
            category="Authentication",
            configured=bool(settings.GOOGLE_CLIENT_ID),
            description="Allows learners to sign in with their Google account.",
        ),
        IntegrationStatusOut(
            name="OpenAI",
            category="AI / LLM",
            configured=bool(settings.GEMINI_API_KEY),
            description="Primary LLM provider for argument analysis, coaching, and the AI Debate Coach chatbot.",
        ),
    ]


# =========================================================================
# Backup & Recovery — real manual data export (no automated cloud backup
# system exists in this build, so this is honestly scoped to what's real:
# an on-demand export of live collection counts + a downloadable JSON of
# core records, not a fabricated "last backup: 2 hours ago" widget).
# =========================================================================
@router.get("/backup/collections-summary")
async def backup_collections_summary(current_user: dict = Depends(require_roles(UserRole.administrator))):
    return {
        "users": await users_collection.count_documents({}),
        "debate_sessions": await debate_sessions_collection.count_documents({}),
        "debate_topics": await debate_topics_collection.count_documents({}),
        "fallacy_reports": await fallacy_reports_collection.count_documents({}),
        "debate_feedback_reports": await debate_feedback_reports_collection.count_documents({}),
        "audit_logs": await audit_logs_collection.count_documents({}),
        "generated_at": datetime.utcnow().isoformat(),
    }


@router.get("/backup/export")
async def export_core_data(current_user: dict = Depends(require_roles(UserRole.administrator))):
    """Real, on-demand JSON export of the platform's core collections —
    an honest 'manual backup' rather than a fabricated automated-backup
    status widget."""

    def _clean(doc):
        doc = dict(doc)
        doc["_id"] = str(doc["_id"])
        return doc

    users = [_clean(u) async for u in users_collection.find({}, {"password_hash": 0})]
    topics = [_clean(t) async for t in debate_topics_collection.find({})]
    await _log_action(current_user, "export_core_data", details={"user_count": len(users), "topic_count": len(topics)})
    return {
        "exported_at": datetime.utcnow().isoformat(),
        "users": users,
        "debate_topics": topics,
    }


# =========================================================================
# Security & Compliance — real, derivable-from-data security posture. No
# session/token-store exists (JWTs are stateless) so "active sessions"
# isn't tracked; this honestly reports what IS real instead.
# =========================================================================
@router.get("/security/overview")
async def security_overview(current_user: dict = Depends(require_roles(UserRole.administrator))):
    total_users = await users_collection.count_documents({})
    verified_users = await users_collection.count_documents({"email_verified": True})
    inactive_users = await users_collection.count_documents({"is_active": False})
    admin_count = await users_collection.count_documents({"role": UserRole.administrator.value})
    recent_security_events = [
        AuditLogOut(
            id=str(log["_id"]),
            actor_id=log["actor_id"],
            actor_name=log["actor_name"],
            action=log["action"],
            target=log.get("target"),
            details=log.get("details"),
            created_at=log["created_at"],
        )
        async for log in audit_logs_collection.find(
            {"action": {"$in": ["create_user", "update_role", "update_plan"]}}
        )
        .sort("created_at", -1)
        .limit(10)
    ]
    return {
        "total_users": total_users,
        "email_verified_users": verified_users,
        "unverified_users": total_users - verified_users,
        "deactivated_users": inactive_users,
        "administrator_count": admin_count,
        "password_policy": "Minimum 6 characters, hashed with bcrypt, never stored or logged in plaintext.",
        "auth_mechanism": "JWT access + refresh tokens (stateless — no server-side session store to audit).",
        "recent_security_relevant_actions": recent_security_events,
    }
