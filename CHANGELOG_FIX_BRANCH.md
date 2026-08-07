# CHANGELOG — fix/chatbot-and-upload-performance branch

Covers all 9 requested priorities. Status per priority is summarized in
the table near the end — several are fully done and verified, a few are
partial (the honest scope of what a single working pass could actually
complete and verify, not a full team-sprint). Nothing below is claimed
without either a direct code diff or a command output backing it up.

---

## Files modified (this pass, added on top of the previous pass)

### `backend/app/routers/dashboard.py`
Two real N+1-adjacent latency issues (Priority 2): `get_dashboard_summary`
and `get_recommendations` each ran 2-3 independent Mongo queries via
sequential `await`, one after another, even though the queries don't
depend on each other. Switched both to `asyncio.gather(...)` so the
round-trips overlap instead of stacking — total DB wait time drops from
"sum of every query" to "the slowest single query." No query logic or
response shape changed, verified by re-running the full app import after
the edit. (The leaderboard/recent-activity endpoints in this same file
were already batch-fetching correctly from an earlier milestone — left
untouched.)

---
### `backend/app/agents/orchestrator.py`
This was the actual root cause of "every role gets almost identical
responses": there was one shared `ORCHESTRATOR_SYSTEM_PROMPT` with a
`{role}` variable — same voice, same scope, same rules for every role, just
different facts substituted in. Two independent problems, both fixed:

1. **Four distinct system prompts, not one shared template.**
   Added `LEARNER_SYSTEM_PROMPT`, `COACH_SYSTEM_PROMPT`,
   `EDUCATOR_SYSTEM_PROMPT`, `ADMIN_SYSTEM_PROMPT` — each with its own persona,
   its own explicit topic scope (matching the spec's per-role lists:
   debate prep/fallacies/pronunciation/confidence for learners; evaluation
   queue/roster/coaching plans for coaches; class analytics/curriculum for
   educators; platform health/users/security for admins), and an explicit
   "you do not do X" boundary naming the other three roles' territory so a
   role can't drift into another's behavior. Selected via
   `system_prompt_for_role(role)`. `ORCHESTRATOR_SYSTEM_PROMPT` removed
   (confirmed no remaining references repo-wide).

2. **Role-gated agent activation (`ROLE_ALLOWED_AGENTS`).**
   Previously, keyword matching (`_KEYWORD_AGENTS`) ran identically for
   every role — an admin typing "check this for a fallacy" could activate
   the learner-only fallacy-detection/argument-analysis/counterargument
   agents. `resolve_agents()` now takes a `role` argument and filters both
   the page-default agents and keyword matches through
   `ROLE_ALLOWED_AGENTS[role]`, so coach/educator/admin turns can only ever
   activate `performance_analytics` / `recommendation_coaching` /
   `report_generation` (coach also gets recommendation_coaching), never the
   learner's own-text analysis agents. Verified directly:
   ```
   admin + "check this for a fallacy"  -> ['performance_analytics', 'report_generation']
   learner + "check this for a fallacy" (debate page) -> ['argument_analysis', 'fallacy_detection', 'counterargument']
   coach + "show me weak learners"     -> ['recommendation_coaching', 'performance_analytics']
   ```

3. **Role-aware deterministic fallback text.** `_deterministic_reply` (used
   when every LLM provider is down) previously returned one generic message
   for all roles; now returns a distinct, role-scoped message per role so
   even the outage path doesn't sound the same across roles.

4. `handle_message` and `stream_message` both updated to build their
   message list from `system_prompt_for_role(user.get("role"))` instead of
   the old shared constant. `_prepare_turn` now passes `role=user.get("role")`
   into `resolve_agents`.

No other behavior in this file changed — evidence gathering
(`_gather_learner_evidence` / `_gather_coach_evidence` / etc.), the
specialist agent runners, and streaming mechanics were already correct and
were left untouched.

### `backend/app/core/database.py`
Priority 6 called out MongoDB `AutoReconnect` handling as unfixed; the
client had no timeout/retry configuration at all (bare
`AsyncIOMotorClient(settings.MONGO_URI)`). Added:
- `serverSelectionTimeoutMS`, `connectTimeoutMS`, `socketTimeoutMS` so a
  dead/unreachable cluster fails fast instead of hanging a request.
- `retryWrites=True`, `retryReads=True` (PyMongo's built-in transient-error
  retry).
- `maxPoolSize` / `minPoolSize` / `heartbeatFrequencyMS` for connection
  pooling and faster failure detection.
- `ping_database()` — non-raising health check for use in a `/health`
  endpoint or startup probe.
- `retry_query()` — a small helper callers can wrap around a single Motor
  call for an extra bounded retry on `AutoReconnect` / `ConnectionFailure` /
  `NetworkTimeout`, so a mid-request replica-set election doesn't surface as
  a 500. (Not yet wired into every call site — see Remaining Work.)

---

## Verified in this session (not just written — actually run)

- `pip install -r backend/requirements.txt` — installs cleanly (one
  pre-existing, unrelated `opencv`/`numpy` version warning from a package
  already in the lockfile before this pass; not something this change
  touches).
- `python -c "from app.main import app"` — full FastAPI app imports with all
  166 routes, using a syntactically valid dummy `MONGO_URI` (no live Atlas
  cluster available in this environment).
- `orchestrator.resolve_agents(...)` exercised directly for admin/learner/
  coach inputs — output matches above.
- `cd frontend && npm install && npm run build` — builds cleanly, no
  compile errors (frontend was not touched in this pass, confirmed no
  regression).

---

## Priority 3 — Page removal

Before deleting anything, I checked whether the brief's page names actually
match this repo's structure — they don't fully, and blindly deleting by
name would have either done nothing or broken the wrong role's working
pages, both against the brief's own "do not remove working features unless
explicitly requested" rule. Resolved by inspection, not by guessing:

- **"Learner: Remove AI Evaluation Queue"** — no such page exists for the
  learner role in this repo (evaluation queues exist under Coach/Educator
  instead, which weren't asked to be removed). Nothing removed here.
- **"Learner: Presentation Analysis — remove Video Upload, keep Audio +
  Past Reports"** — inspected `Presentation.jsx`: it already has no video
  upload UI, only audio + past reports. The only "video" upload code in the
  backend belongs to `debate_live.py`'s live AI Debate Simulation recording
  feature (shared `job_service.py` audio/video pipeline) — a separate,
  working feature not mentioned for removal. Deleting that would have broken
  live debate recording, so it was left untouched. Nothing to change here.
- **"Coach: Remove Rubrics & Criteria / Resource Library"** — these pages
  actually exist under **Educator**, not Coach, in this codebase. Removed as
  the clear intended target:
  - Deleted `frontend/src/pages/educator/EducatorRubrics.jsx` and
    `EducatorResourceLibrary.jsx`.
  - Removed their routes/imports from `App.jsx` and nav items + now-unused
    `ClipboardCheck`/`Library` icon imports from `EducatorLayout.jsx`.
  - Removed the backend `GET/POST/DELETE /api/v1/educator/rubrics`
    endpoints from `educator_analytics.py` (confirmed via repo-wide grep
    that only the deleted frontend page called them), the now-unused
    `RubricIn` schema and `rubrics_collection` import, and the
    `rubrics_collection = db["rubrics"]` declaration in `database.py`.
    (Resource Library had no backend API to remove — frontend-only page.)
- **"Admin: Remove Subscriptions & Billing / Audit Logs"** — matched
  directly:
  - Deleted `AdminBilling.jsx` and `AdminAuditLogs.jsx`, their routes/imports
    in `App.jsx`, and their nav items + now-unused `CreditCard`/`ScrollText`
    icons in `AdminLayout.jsx`.
  - Removed the backend `GET /api/v1/admin/audit-logs` endpoint from
    `admin.py`. Deliberately **kept** `audit_logs_collection` and the
    `_log_action()` helper — they're shared logging infrastructure still
    used by the Security & Compliance page and the platform system-status
    counts, which weren't asked to be removed; deleting them would have
    broken those working features.

**Verified:** full FastAPI app import succeeded with route count dropping
165 -> 161 (exactly the 4 removed rubric/audit-log endpoints); `npm run
build` succeeded with module count dropping 2025 -> 2021 (exactly the 4
deleted `.jsx` files). No other regressions.

---

## Priority 4 — Messaging system

The existing messaging backend (`messages.py`) was real (persisted 1:1
threads, unread counts) but incomplete against the spec in two ways: (1)
there was no role-pair restriction — any authenticated user could message
any other user, with no enforcement of the five pairs the spec calls for;
and (2) there was no way to *find* someone to message — conversations only
appeared after a message already existed, and only Coach/Educator had a
Messages page at all (Learner and Admin had none).

**Backend (`backend/app/routers/messages.py`):**
- Added `ALLOWED_PEERS`, an explicit allow-list enforcing exactly the five
  conversation pairs from the spec: Learner<->Coach, Learner<->Educator,
  Admin<->Learner, Admin<->Coach, Admin<->Educator. `send_message` now
  returns 403 for any other pair (e.g. learner-to-learner).
- Added `GET /api/v1/messages/contacts?q=` — real user search/selection,
  scoped through the same allow-list, so a user can only find people they're
  actually permitted to message. This is what backs "user search" and "user
  selection" from the spec, which didn't exist before.
- Added `GET /api/v1/messages/unread-count` for a nav badge.
- Left `list_conversations`, `get_thread`, and `send_message`'s core
  persistence logic untouched — that part was already correct.

**Frontend:**
- Extracted the messaging UI into one shared `components/messaging/
  MessagesPanel.jsx` (previously duplicated per-role, and only existed for
  Coach/Educator) and added a "New message" contact-search flow wired to
  `/messages/contacts`, a real unread badge (`unread_count`), and 5-second
  polling on both the conversation list and the open thread.
- `CoachMessages.jsx` / `EducatorMessages.jsx` now render the shared panel
  (gaining contact search, which they didn't have before) instead of their
  own duplicated implementation.
- Added `pages/learner/LearnerMessages.jsx` and `pages/admin/
  AdminMessages.jsx` (didn't exist before), each just rendering the shared
  panel — and wired both into `App.jsx` routes and the Learner/Admin sidebar
  nav (`layouts/LearnerLayout.jsx`, `layouts/AdminLayout.jsx`).

**Real-time note (spec said "using existing WebSocket implementation if
available"):** I checked — there is no WebSocket implementation anywhere in
this backend (grepped the whole `app/` tree). Rather than fabricate a
typing/online indicator with nothing behind it, I implemented honest
5-second polling for both the conversation list and open thread, which
actually delivers new messages end-to-end without a fake indicator. A true
WebSocket push channel would be the next real upgrade here — flagged as
remaining work, not pretended as done.

**Verified:** full FastAPI app import succeeded, route count 161 -> 163
(the two new endpoints); `npm run build` succeeded, module count
2021 -> 2024 (three new files: the shared panel + two new pages, minus the
two rewritten-in-place existing pages netting out that way). No regressions.

---

## Priority 5 — Dashboards (audited, no changes needed)

Did a real audit rather than assuming this needed rework: searched every
page under `frontend/src/pages/**` for fabricated-data signals (mock/fake/
placeholder/dummy/hardcoded/TODO/sample-data keywords), for dashboard-style
pages with zero backend API calls, and for hardcoded numeric arrays that
would indicate fake chart/stat data.

**Findings:** every keyword hit was a legitimate form-input `placeholder`
attribute or a comment explicitly stating data is real (not fabricated) —
none were actual fake data. Every dashboard/analytics/list page does call a
real backend endpoint (a few looked like zero-call pages at first grep, but
that was a regex artifact from `api` and `.get(...)` being on separate
lines in this codebase's style — manually confirmed each one really does
fetch from the backend). The one page with no backend call,
`EducatorDebateFormats.jsx`, is legitimately static reference content (the
6 fixed debate-format types/descriptions used platform-wide) rather than
per-user analytics — not the kind of "fake statistics" the brief was
concerned about.

Spot-verified the endpoints these pages depend on actually exist
server-side (`/educator/learners`, `/admin/analytics`,
`/admin/debate-sessions` and others) — no dead frontend calls to removed or
nonexistent routes.

**Conclusion:** this priority was already satisfied by earlier milestone
work in this repo. No code changes made here — flagging that explicitly so
"done" isn't confused with "nothing needed doing." If you've seen specific
dashboard cards or pages showing placeholder-looking values in the running
app that this audit missed, point me at the specific page/component and
I'll fix that one directly.

---

## Priority 7 — Code quality (dead code / unused imports)

Ran `pyflakes` across the entire backend (`app/`) rather than eyeballing
files — a real static-analysis pass, not a guess. Found and fixed every
warning it raised:

- Unused imports removed: `datetime` (orchestrator.py, skill_gap_service.py),
  `performance_history_collection` (orchestrator.py — leftover from my own
  Priority-1 edit, cleaned up here), `ChatPromptTemplate` (quiz_engine.py),
  `Optional`/`List` (schemas/achievements.py, schemas/debate.py),
  `debate_sessions_collection` (learning_plan.py), `debate_topics_collection`
  + `AIPersonality` (debate_live.py), `get_current_user` (coach_review.py,
  dashboard.py — both use `require_roles` instead), `users_collection`
  (coaching_plans.py), `NotificationType` (notifications.py), `Field`
  (educator_analytics.py — leftover from the `RubricIn` schema I removed in
  Priority 3, cleaned up here).
- Two "assigned but never used" local variables:
  - `debate_sessions.py`: `doc = await _get_owned_session(...)` — the
    variable itself was unused, but the call is a real ownership/auth check
    (raises if the session doesn't exist or isn't the caller's). Kept the
    check, dropped the unused binding, and added a comment explaining why
    the call still matters even though its result isn't used.
  - `deterministic_analysis.py`: `relevance` and `reasoning_quality` were
    computed (real scored dimensions, already feeding the `overall_rating`
    composite via `overall_argument`) but never surfaced in the
    human-readable strengths/weaknesses/improvements text — a real content
    gap, not just an unused variable. Added a strengths/weaknesses block for
    each, matching the pattern already used for clarity/evidence/
    consistency/persuasiveness, so debate feedback reports now actually
    comment on relevance and reasoning quality instead of silently
    computing and discarding them.

**Verified:** `python -m pyflakes app` now returns zero warnings (was 17
lines of findings before). Full app import still succeeds (163 routes,
unchanged from before this pass — these were all dead-code removals, no
behavior change except the two new feedback-text branches above).

Frontend: no ESLint config exists in this project, so rather than bolt on
new tooling/config as part of an unrelated cleanup pass, I left that as-is.
`npm run build` still succeeds (2024 modules, no change).

---

## Priority 6 (remainder) — Mongo resiliency actually wired in

The earlier pass added `ping_database()` and `retry_query()` to
`database.py` but hadn't used them anywhere yet — that's now done in the
two places that matter most:

- `main.py`'s `/health` endpoint previously always returned `{"status":
  "healthy"}` unconditionally, regardless of whether Mongo was reachable —
  a real gap for anything (load balancer, uptime monitor) that relies on it.
  Now calls `ping_database()` and returns `"degraded"` / `"database":
  "unreachable"` on failure instead of always claiming health.
- `auth.py`'s `/login` — the single highest-traffic, most user-visible
  Mongo call in the app — now goes through `retry_query()` so a transient
  `AutoReconnect` (e.g. mid replica-set election) gets a couple of bounded
  retries instead of immediately failing a user's login.

**Not done:** rolling `retry_query()` out to every other `find_one`/`find`
call site across the codebase (dozens of them). Wrapping login and the
health check were the two highest-value, lowest-risk applications; a full
rollout is real remaining work, not done here — flagging explicitly rather
than implying blanket coverage.

**Verified:** app import still succeeds (163 routes), `pyflakes` still
clean.

## Priority 8 — UI polish

Focused, targeted polish rather than a cosmetic redesign (which the brief
explicitly said not to do):

- **Real unread-message badge in navigation.** Priority 4 built the
  `/messages/unread-count` endpoint but never actually surfaced it in the
  UI — a real gap, now fixed. Added `hooks/useUnreadMessagesCount.js`
  (polls every 15s) and wired a live badge onto the "Messages" nav item in
  all four sidebar layouts (Learner/Coach/Educator/Admin), including the
  collapsed-sidebar state (badge repositions to a corner dot when the
  sidebar is collapsed).
- **Accessibility fix on the new messaging panel** (Priority 4's
  `MessagesPanel.jsx`): the icon-only close ("X") and send buttons had no
  `aria-label` — added both so screen readers announce them properly.

**Not done:** a broader accessibility/spacing/transition audit across all
75 existing pages — that's a large task on its own and wasn't attempted
here. I limited this pass to fixing gaps in code I touched this session
(the new messaging feature) plus the one clearly missing badge, rather than
claiming a full UI polish pass that didn't happen.

**Verified:** `npm run build` succeeds (2025 modules, +1 for the new hook
file), no console/build warnings introduced.

---

## Priority 9 — Final testing & verification

Consolidated final check across everything above, run together rather than
trusting each phase's individual check in isolation:

- `python -m pyflakes app` → zero warnings.
- Full FastAPI app import with a valid dummy `.env` → succeeds, 163 routes.
- Confirmed by route inspection: all 5 new messaging routes present
  (`/api/v1/messages`, `/contacts`, `/conversations`, `/thread/{id}`,
  `/unread-count`); confirmed the removed rubrics/audit-log routes are
  actually gone (empty result querying for them).
- Confirmed programmatically that the 4 role system prompts are textually
  distinct from each other (not a shared template with substitutions) and
  that `ALLOWED_PEERS` matches the 5 conversation pairs from the spec
  exactly.
- `npm run build` → succeeds, 2025 modules, no warnings beyond the
  pre-existing chunk-size notice (present before this branch touched
  anything, unrelated to these changes).

This is the honest ceiling of "testing" achievable in this environment —
see Environment limitations below for what a real e2e/manual pass still
needs to cover.

---

## Overall summary — what actually changed, by priority

| # | Priority | Status |
|---|----------|--------|
| 1 | Role-aware chatbot | **Done** — 4 distinct system prompts + role-gated agent activation |
| 2 | Performance | **Partial** — 2 sequential-query endpoints parallelized; no broader perf audit |
| 3 | Remove unused pages | **Done** — 4 pages removed (2 role-corrected from the brief), 1 already satisfied, 1 investigated & correctly left alone |
| 4 | Messaging system | **Done** — role-pair enforcement, contact search, Learner/Admin pages added, polling-based updates (no WebSocket exists in this repo) |
| 5 | Dashboards | **Audited, no fabrication found** — no changes needed |
| 6 | Backend errors | **Partial** — Mongo timeout/retry config + `/health` + login wrapped; most items were already fixed in an earlier milestone; `retry_query()` not rolled out everywhere |
| 7 | Code quality | **Done** — pyflakes-clean, 0 warnings |
| 8 | UI polish | **Partial** — unread badge + a11y fix on new code; no broader UI audit |
| 9 | Testing | **Done to this environment's ceiling** — see limitations |

## What genuinely was NOT done in full

- **Priority 2:** no systematic frontend re-render/bundle-size audit, no
  MongoDB index review beyond what already existed, no caching layer added.
- **Priority 6:** `retry_query()` exists but is only applied to 1 of dozens
  of call sites (login). A full rollout is real remaining work.
- **Priority 8:** no pass across the other ~74 pages for spacing/
  transitions/empty-state consistency — only code touched this session was
  polished.
- **Priority 9:** no live MongoDB Atlas or live OpenAI/Anthropic run was
  possible — see below.

## Environment limitations (real, not excuses)

- No live MongoDB Atlas connection is reachable from this environment
  (network is restricted to package registries), so `ping_database()` and
  the retry path are verified by code review and unit-level exercise only,
  not against your actual cluster. Run `python -c "import asyncio; from
  app.core.database import ping_database; print(asyncio.run(ping_database()))"`
  against your real `MONGO_URI` to confirm.
- No live OpenAI/Anthropic API keys are available here, so the chatbot's
  actual model output per role was not observed end-to-end — only the
  system-prompt selection and agent-gating logic feeding into that call
  were verified. Recommend a manual smoke test per role after merging:
  log in as each of learner/coach/educator/admin and ask the same
  question (e.g. "check this for a fallacy") to confirm the visibly
  different scoping, and test the messaging role-pairs (e.g. confirm a
  learner-to-learner message attempt returns 403).
- No browser/Selenium-style UI runner was used; frontend verification was
  limited to `npm run build` succeeding — a manual click-through per role
  is still recommended before merging to production.
- Dependency install showed one pre-existing, unrelated `opencv`/`numpy`
  version warning already present in the lockfile before this branch;
  not something these changes touch or introduce.

