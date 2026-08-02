const app = document.querySelector("#app");

const state = {
  token: localStorage.getItem("dc_token"),
  user: JSON.parse(localStorage.getItem("dc_user") || "null"),
  view: "dashboard",
  authMode: "login",
  pendingEmail: null,
  selectedPersonId: null,
  activeSessionId: null,
  prefillTopic: null,
  assistantOpen: false,
  assistantMaximized: false,
  assistantHistory: [],
  assistantBusy: false,
};

const roleOptions = [
  ["learner", "Learner"],
  ["coach", "Debate Coach"],
  ["educator", "Educator"],
];

const debateFormats = [
  "One-on-One Debate",
  "Parliamentary Debate",
  "Oxford Debate",
  "Policy Debate",
  "Public Forum Debate",
  "AI Debate Simulation",
];
const positions = ["For", "Against"];
const opponents = ["AI Opponent", "Human Opponent", "Coach Review"];
const statuses = ["scheduled", "active", "completed", "cancelled"];


function peopleLabel() {
  if (!state.user) return "People";
  if (state.user.role === "coach") return "Learners";
  if (state.user.role === "educator") return "Students";
  if (state.user.role === "admin") return "Admin";
  return "People";
}

async function api(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  const response = await fetch(path, { ...options, headers });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

function saveSession(payload) {
  state.token = payload.token;
  state.user = payload.user;
  localStorage.setItem("dc_token", state.token);
  localStorage.setItem("dc_user", JSON.stringify(state.user));
}

function logout() {
  state.token = null;
  state.user = null;
  localStorage.removeItem("dc_token");
  localStorage.removeItem("dc_user");
  render();
}

function setView(view) {
  state.view = view;
  render();
}

function html(strings, ...values) {
  return strings.map((part, index) => part + (values[index] ?? "")).join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  if (!state.token || !state.user) return renderAuth();

  app.innerHTML = html`
<div class="app-layout">
    <aside class="sidebar">
        <div class="logo">
            <div class="mark">DC</div>
            <div>
                <h2>Debate Coach</h2>
                <span>Presentation Analysis Platform</span>
            </div>
        </div>
        <nav class="sidebar-nav">
    <span class="nav-group-label">Main</span>
    ${navButton("dashboard","🏠 Dashboard")}
    ${navButton("sessions","🎤 Debate Sessions")}
    ${state.user.role==="learner" ? navButton("newSession","➕ New Session") : ""}

    <span class="nav-group-label">Practice</span>
    ${navButton("topics","📚 Debate Topics")}
    ${state.user.role==="learner" ? navButton("skills","📈 Skill Tracking") : ""}
    ${navButton("reports","📊 Reports")}

    ${["coach","educator","admin"].includes(state.user.role) ? `
    <span class="nav-group-label">People</span>
    ${navButton("people","👥 " + peopleLabel())}
    ${navButton("skillGap","📊 Skill Gap")}
    ` : ""}

    <span class="nav-group-label">Account</span>
    ${navButton("profile","👤 Profile")}
</nav>
        <div class="sidebar-footer">
            <div class="user-info">
                <strong>${escapeHtml(state.user.name)}</strong>
                <span class="badge">${escapeHtml(state.user.roleLabel)}</span>
            </div>
            <button class="logout-btn" onclick="logout()">🚪 Logout</button>
        </div>
    </aside>
    <main class="main-content">
        <section class="page" id="view"></section>
    </main>
</div>
${renderAssistantWidget()}
`;

  attachAssistantFormHandler();
  loadView();
}

function navButton(view,label){
    return `
<button class="sidebar-btn ${state.view===view?"active":""}" onclick="setView('${view}')">
${label}
</button>
`;
}

/* ---------------------------------------------------------------------- */
/* Auth                                                                     */
/* ---------------------------------------------------------------------- */

function renderAuth(message = "") {
  if (state.authMode === "otp") return renderOtpStep(message);

  const isLogin = state.authMode === "login";
  app.innerHTML = html`
    <section class="auth-page">
      <div class="auth-story">
        <h1>Agentic AI Debate Coach</h1>
        <p>Plan debates, track argument skills, manage practice sessions, and get AI-powered feedback.</p>
      </div>
      <div class="auth-panel">
        <h2>${isLogin ? "Welcome back" : "Create account"}</h2>
        <p class="muted">${isLogin ? "We'll email you a one-time code to finish signing in." : "Choose a role and answer a few quick questions to personalize your experience."}</p>
        <div class="tabs">
          <button class="${isLogin ? "active" : ""}" onclick="switchAuth('login')">Login</button>
          <button class="${!isLogin ? "active" : ""}" onclick="switchAuth('register')">Register</button>
        </div>
        ${message}
        <form id="authForm">
          ${!isLogin ? field("name", "Full name", "text", "Your name") : ""}
          ${field("email", "Email", "email", isLogin ? "learner@example.com" : "you@example.com")}
          ${field("password", "Password", "password", "password123")}
          ${
            !isLogin
              ? html`
                <div class="field">
                  <label for="role">Role</label>
                  <select id="role" name="role" required onchange="updateRoleFields()">
                    ${roleOptions.map(([value, text]) => `<option value="${value}">${text}</option>`).join("")}
                  </select>
                </div>
                <div id="roleFieldsContainer">${roleFieldsHtml(roleOptions[0][0])}</div>
              `
              : ""
          }
          <button class="primary" type="submit">${isLogin ? "Send login code" : "Create account"}</button>
        </form>
        <p class="muted">Demo password: <strong>password123</strong></p>
      </div>
    </section>
  `;
  document.querySelector("#authForm").addEventListener("submit", handleAuth);
}

function renderOtpStep(message = "") {
  app.innerHTML = html`
    <section class="auth-page">
      <div class="auth-story">
        <h1>Check your email</h1>
        <p>For your security, we send a one-time code to your email address every time you log in.</p>
      </div>
      <div class="auth-panel">
        <h2>Enter your code</h2>
        <p class="muted">We sent a 6-digit code to <strong>${escapeHtml(state.pendingEmail || "")}</strong>. It expires in 5 minutes.</p>
        ${message}
        <form id="otpForm">
          ${field("code", "6-digit code", "text", "123456")}
          <button class="primary" type="submit">Verify &amp; log in</button>
        </form>
        <p class="muted">
          Didn't get it? <a href="#" onclick="resendOtp();return false;">Resend code</a>
          &nbsp;·&nbsp;
          <a href="#" onclick="switchAuth('login');return false;">Use a different account</a>
        </p>
      </div>
    </section>
  `;
  document.querySelector("#otpForm").addEventListener("submit", handleOtpVerify);
}

function switchAuth(mode) {
  state.authMode = mode;
  state.pendingEmail = null;
  renderAuth();
}

async function handleAuth(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  try {
    if (state.authMode === "login") {
      const payload = await api("/api/login", { method: "POST", body: JSON.stringify(data) });
      state.pendingEmail = payload.email;
      state.authMode = "otp";
      renderAuth();
    } else {
      const payload = await api("/api/register", { method: "POST", body: JSON.stringify(data) });
      saveSession(payload);
      state.view = "dashboard";
      render();
    }
  } catch (error) {
    renderAuth(`<div class="message error">${escapeHtml(error.message)}</div>`);
  }
}

async function handleOtpVerify(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  try {
    const payload = await api("/api/login/verify", {
      method: "POST",
      body: JSON.stringify({ email: state.pendingEmail, code: data.code }),
    });
    saveSession(payload);
    state.authMode = "login";
    state.pendingEmail = null;
    state.view = "dashboard";
    render();
  } catch (error) {
    renderOtpStep(`<div class="message error">${escapeHtml(error.message)}</div>`);
  }
}

async function resendOtp() {
  try {
    await api("/api/login/resend", { method: "POST", body: JSON.stringify({ email: state.pendingEmail }) });
    renderOtpStep(`<div class="message ok">A new code was sent to ${escapeHtml(state.pendingEmail)}.</div>`);
  } catch (error) {
    renderOtpStep(`<div class="message error">${escapeHtml(error.message)}</div>`);
  }
}

function field(name, label, type = "text", placeholder = "") {
  return html`
    <div class="field">
      <label for="${name}">${label}</label>
      <input id="${name}" name="${name}" type="${type}" placeholder="${placeholder}" required />
    </div>
  `;
}

function selectField(name, label, options, selected = "") {
  return html`
    <div class="field">
      <label for="${name}">${label}</label>
      <select id="${name}" name="${name}" required>
        ${options.map(([value, text]) => `<option value="${value}" ${value === selected ? "selected" : ""}>${text}</option>`).join("")}
      </select>
    </div>
  `;
}

function roleFieldsHtml(role) {
  if (role === "coach") {
    return html`
      ${selectField("experience_level", "Coaching Expertise Level", [["Novice", "Novice"], ["Intermediate", "Intermediate"], ["Expert", "Expert"]])}
      ${field("specialization", "Coaching Specialization", "text", "e.g. Policy Debate, Public Speaking")}
      ${field("years_of_experience", "Years of Coaching Experience", "text", "e.g. 3 years")}
    `;
  }
  if (role === "educator") {
    return html`
      ${field("institution", "Institution / School", "text", "e.g. Lincoln High School")}
      ${field("specialization", "Subject Area", "text", "e.g. English, Social Studies")}
      ${selectField("experience_level", "Teaching Experience Level", [["Novice", "Novice"], ["Intermediate", "Intermediate"], ["Expert", "Expert"]])}
    `;
  }
  return html`
    ${selectField("experience_level", "Debate Experience Level", [["Beginner", "Beginner"], ["Intermediate", "Intermediate"], ["Advanced", "Advanced"]])}
    ${field("preferred_topics", "Preferred Debate Topics", "text", "e.g. Technology, Politics")}
  `;
}

function updateRoleFields() {
  const role = document.querySelector("#role").value;
  document.querySelector("#roleFieldsContainer").innerHTML = roleFieldsHtml(role);
}

async function loadView() {
  const view = document.querySelector("#view");
  view.innerHTML = `<div class="empty">Loading...</div>`;
  try {
    if (state.view === "dashboard") return renderDashboard(view, await api("/api/dashboard"));
    if (state.view === "profile") return renderProfile(view, await api("/api/profile"));
    if (state.view === "sessions") return renderSessions(view, await api("/api/sessions"));
    if (state.view === "newSession") {
      if (state.user.role !== "learner") {
        state.view = "dashboard";
        return loadView();
      }
      return renderNewSession(view, await api("/api/topics"));
    }
    if (state.view === "people") {
      const people = await api("/api/users");
      const adminOverview = state.user.role === "admin" ? await api("/api/admin/overview") : null;
      return renderPeople(view, people, adminOverview);
    }
    if (state.view === "personProfile") {
      const id = state.selectedPersonId;
      if (!id) {
        state.view = "people";
        return loadView();
      }
      const profileData = await api(`/api/users/${id}/profile`);
      const sessionsData = await api(`/api/users/${id}/sessions`);
      return renderPersonProfile(view, profileData, sessionsData);
    }
    if (state.view === "topics") return renderTopics(view, await api("/api/topics"));
    if (state.view === "skills") {
      if (state.user.role !== "learner") {
        state.view = "dashboard";
        return loadView();
      }
      return renderSkills(view, await api("/api/skills"));
    }
    if (state.view === "reports") return renderReports(view, await api("/api/dashboard"));
    if (state.view === "debateRoom") {
      const id = state.activeSessionId;
      if (!id) {
        state.view = "sessions";
        return loadView();
      }
      const data = await api(`/api/debate/turns/${id}`);
      return renderDebateRoom(view, data);
    }
  } catch (error) {
    view.innerHTML = `<div class="message error">${escapeHtml(error.message)}</div>`;
  }
  if (state.view === "skillGap") {
  if (!["coach", "educator", "admin"].includes(state.user.role)) {
    state.view = "dashboard";
    return loadView();
  }
  return renderSkillGap(view, await api("/api/coach/skill-gap"));
}
}

function renderDashboard(view, data) {
  const stats = data.stats;
  view.innerHTML = html`
    <div class="dashboard">
      <section class="hero">
        <div>
          <h1>Welcome, ${escapeHtml(state.user.name)} 👋</h1>
          <p>
          ${
            state.user.role === "learner"
              ? "Track your debate skills, prepare for upcoming sessions and improve your communication."
            : state.user.role === "coach"
              ? "Monitor learner performance and guide them through every debate."
            : state.user.role === "educator"
              ? "Analyze classroom debate performance and presentation skills."
            : "Manage users, debate sessions and monitor the overall platform."
          }
          </p>
        </div>
      </section>
      <div class="grid four">
        ${
          state.user.role === "learner"
            ? statCard("Average Skill", `${stats.averageSkill}%`)
            : state.user.role === "coach"
            ? statCard("Learners", stats.learners)
            : state.user.role === "educator"
            ? statCard("Students", stats.learners)
            : statCard("Platform Users", stats.platformUsers)
        }
        ${statCard("Visible Sessions", stats.visibleSessions)}
        ${statCard("Scheduled", stats.scheduledSessions)}
        ${statCard("Completed", stats.completedSessions)}
      </div>
      ${
      state.user.role==="learner"
      ? `
      <div class="grid two">
        <section class="panel">
          <h2 class="section-title">Skill Progress</h2>
          ${data.skills.map(skill=>skillDisplay(skill.skill_name,skill.score)).join("")}
        </section>
        <section class="panel">
          <h2 class="section-title">Quick Actions</h2>
          <div class="quick-actions">
            <button class="card" onclick="setView('newSession')"><h3>🎤</h3><p>Schedule Debate</p></button>
            <button class="card" onclick="setView('topics')"><h3>📚</h3><p>Practice Topics</p></button>
            <button class="card" onclick="setView('profile')"><h3>👤</h3><p>Update Profile</p></button>
            <button class="card" onclick="setView('reports')"><h3>📈</h3><p>View Progress</p></button>
          </div>
        </section>
      </div>
      `
      : state.user.role==="coach"
      ? `
      <div class="grid two">
        <section class="panel">
          <h2 class="section-title">Learner Overview</h2>
          <div class="grid two">
            ${statCard("Learners",stats.learners)}
            ${statCard("Scheduled",stats.scheduledSessions)}
            ${statCard("Completed",stats.completedSessions)}
            ${statCard("Visible",stats.visibleSessions)}
          </div>
        </section>
        <section class="panel">
          <h2 class="section-title">Coaching Activities</h2>
          <ul class="report-list">
            <li>Review learner debate sessions</li>
            <li>Provide constructive feedback</li>
            <li>Monitor debate completion</li>
            <li>Track learner improvement</li>
            <li>Guide presentation skills</li>
          </ul>
        </section>
      </div>
      `
      : state.user.role==="educator"
      ? `
      <div class="grid two">
          <section class="panel">
              <h2 class="section-title">Class Analytics</h2>
              <div class="grid two">
                  ${statCard("Students",stats.learners)}
                  ${statCard("Scheduled",stats.scheduledSessions)}
                  ${statCard("Completed",stats.completedSessions)}
                  ${statCard("Visible",stats.visibleSessions)}
              </div>
          </section>
          <section class="panel">
              <h2 class="section-title">Performance Reports</h2>
              <div class="card">
                  <h3 class="compact-title">Debate Performance</h3>
                  <ul class="report-list">
                      <li>Overall class participation</li>
                      <li>Debate completion rate</li>
                      <li>Student engagement</li>
                      <li>Speaking confidence</li>
                  </ul>
              </div>
              <br>
              <div class="card">
                  <h3 class="compact-title">Presentation Assessment</h3>
                  <ul class="report-list">
                      <li>Communication Skills</li>
                      <li>Critical Thinking</li>
                      <li>Organization</li>
                      <li>Content Delivery</li>
                  </ul>
              </div>
          </section>
      </div>
      `
      : `
      <div class="grid two">
      <section class="panel">
      <h2 class="section-title">Platform Overview</h2>
      <div class="grid two">
      ${statCard("Users",stats.platformUsers)}
      ${statCard("Learners",stats.learners)}
      ${statCard("Sessions",stats.visibleSessions)}
      ${statCard("Completed",stats.completedSessions)}
      </div>
      </section>
      <section class="panel">
      <h2 class="section-title">System Status</h2>
      <div class="card">
      <h3 class="compact-title">Platform Health</h3>
      <ul class="report-list">
      <li>🟢 Authentication Service</li>
      <li>🟢 Database Connected</li>
      <li>🟢 Debate Sessions Active</li>
      <li>🟢 Reports Available</li>
      </ul>
      </div>
      <br>
      <div class="card">
      <h3 class="compact-title">Administrator Actions</h3>
      <div class="quick-actions">
      <button class="card" onclick="setView('people')"><h3>👥</h3><p>Manage Users</p></button>
      <button class="card" onclick="setView('sessions')"><h3>🎤</h3><p>View Sessions</p></button>
      <button class="card" onclick="setView('reports')"><h3>📊</h3><p>Reports</p></button>
      <button class="card" onclick="setView('people')"><h3>⚙️</h3><p>System</p></button>
      </div>
      </div>
      </section>
      </div>
      `
      }
    </div>
  `;
}

function statCard(label, value) {
  return `<article class="card stat"><span class="muted">${label}</span><strong>${value}</strong></article>`;
}

function skillDisplay(name, score) {
  const value = Number(score) || 0;
  return html`
    <div class="skill-item">
      <div class="skill-item-header">
        <strong>${escapeHtml(name)}</strong>
        <span class="skill-percent">${value}%</span>
      </div>
      <div class="skill-bar-track"><div class="skill-bar-fill" style="width:${value}%"></div></div>
    </div>
  `;
}

function profileFieldsForRole(role) {
  if (role === "coach") {
    return [
      ["experience_level", "Coaching Expertise Level"],
      ["specialization", "Coaching Specialization"],
      ["years_of_experience", "Years of Coaching Experience"],
      ["coaching_preferences", "Coaching Style / Preferences"],
    ];
  }
  if (role === "educator") {
    return [
      ["institution", "Institution / School"],
      ["specialization", "Subject Area"],
      ["experience_level", "Teaching Experience Level"],
      ["years_of_experience", "Years of Teaching Experience"],
    ];
  }
  if (role === "admin") {
    return [
      ["experience_level", "Experience Level"],
      ["institution", "Institution / Organization"],
      ["specialization", "Area of Focus"],
      ["years_of_experience", "Years of Experience"],
    ];
  }
  return [
    ["experience_level", "Experience Level"],
    ["preferred_topics", "Preferred Debate Topics"],
    ["presentation_domains", "Presentation Domains"],
    ["learning_goals", "Learning Goals"],
    ["coaching_preferences", "Coaching Preferences"],
  ];
}

function renderProfile(view, profileData) {
  const profile = profileData.profile;
  const fields = profileFieldsForRole(state.user.role);

  view.innerHTML = html`
    <section class="panel" style="max-width:850px;margin:auto;">
      <h2 class="section-title">Profile</h2>
      <p class="muted">Update your preferences and personalize your debate experience.</p>
      <h3 class="compact-title">Account Information</h3>
      <div class="grid two">
        <div class="field"><label>Name</label><input value="${escapeHtml(state.user.name)}" readonly /></div>
        <div class="field"><label>Email</label><input value="${escapeHtml(state.user.email)}" readonly /></div>
        <div class="field"><label>Role</label><input value="${escapeHtml(state.user.roleLabel)}" readonly /></div>
      </div>
      <h3 class="compact-title">Details</h3>
      <form id="profileForm">
        ${fields.map(([name, label]) => textarea(name, label, profile[name])).join("")}
        <button class="primary" type="submit">Save Changes</button>
      </form>
    </section>
  `;

  document.querySelector("#profileForm").addEventListener("submit", saveProfile);
}

function textarea(name, label, value) {
  return html`
    <div class="field">
      <label for="${name}">${label}</label>
      <textarea id="${name}" name="${name}" required>${escapeHtml(value)}</textarea>
    </div>
  `;
}

async function saveProfile(event) {
  event.preventDefault();
  await api("/api/profile", { method: "PUT", body: JSON.stringify(Object.fromEntries(new FormData(event.target))) });
  await loadView();
}

/* ---------------------------------------------------------------------- */
/* Debate Sessions                                                          */
/* ---------------------------------------------------------------------- */

function renderSessions(view, data) {
  view.innerHTML = html`
    <div class="grid">
      <section class="panel">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;">
          <h2 class="section-title" style="margin:0;">
            ${
              state.user.role === "coach"
                ? "Learner Debate Sessions"
                : state.user.role === "educator"
                ? "Student Debate Sessions"
                : state.user.role === "admin"
                ? "All Debate Sessions"
                : "My Debate Sessions"
            }
          </h2>
          ${state.user.role === "learner" ? `<button class="primary" onclick="setView('newSession')">➕ New Session</button>` : ""}
        </div>
        ${
          data.sessions.length
            ? data.sessions.map(sessionCard).join("")
            : `<div class="empty">No sessions found.${state.user.role === "learner" ? " Create one to get started." : ""}</div>`
        }
      </section>
    </div>
  `;
}

function renderNewSession(view, topicData) {
  const serverTopics = topicData.topics || [];
  const customTopics = loadCustomTopics().map((t) => t.topic);
  const allTopics = [...customTopics, ...serverTopics];

  const prefill = state.prefillTopic;
  state.prefillTopic = null;

  const topicOptions = prefill && !allTopics.includes(prefill) ? [prefill, ...allTopics] : allTopics;
  const nowLocal = new Date(Date.now() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);

  view.innerHTML = html`
    <section class="panel" style="max-width:640px;margin:auto;">
      <h2 class="section-title">Start a New Debate Session</h2>
      <p class="muted">Pick a topic, format, position, and opponent, then enter the room.</p>
      <form id="createSessionForm">
        <div class="field">
          <label for="topic">Topic</label>
          <select id="topic" name="topic" required>
            ${topicOptions.map((t) => `<option value="${escapeHtml(t)}" ${t === prefill ? "selected" : ""}>${escapeHtml(t)}</option>`).join("")}
          </select>
        </div>
        ${selectField("format", "Debate Format", debateFormats.map((f) => [f, f]))}
        ${selectField("position", "Your Position", positions.map((p) => [p, p]))}
        ${selectField("opponent_type", "Opponent Type", opponents.map((o) => [o, o]))}
        <div class="field">
          <label for="scheduled_for">Scheduled For</label>
          <input id="scheduled_for" name="scheduled_for" type="datetime-local" required value="${nowLocal}" />
        </div>
        <div class="field">
          <label for="notes">Notes (optional)</label>
          <textarea id="notes" name="notes" placeholder="Anything to focus on..."></textarea>
        </div>
        <button class="primary" type="submit">Create &amp; Enter Room</button>
      </form>
    </section>
  `;

  document.querySelector("#createSessionForm").addEventListener("submit", handleCreateSession);
}

async function handleCreateSession(event) {
  event.preventDefault();
  const data = Object.fromEntries(new FormData(event.target));
  try {
    const result = await api("/api/sessions", { method: "POST", body: JSON.stringify(data) });
    openDebateRoom(result.session.id);
  } catch (error) {
    alert(error.message);
  }
}

function sessionCard(session) {
  const isOver = session.status === "completed" || session.status === "cancelled";
  return html`
    <article class="card session">
      <header>
        <div>
          <h3>${escapeHtml(session.topic)}</h3>
          <span class="muted">${escapeHtml(session.owner_name || state.user.name)}</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          ${
            session.overall_score != null
              ? `<span class="badge session-score-badge">${session.overall_score}/100</span>`
              : ""
          }
          <span class="badge badge-${session.status}">${escapeHtml(session.status)}</span>
        </div>
      </header>
      <dl>
        <div><dt>Format</dt><dd>${escapeHtml(session.format)}</dd></div>
        <div><dt>Position</dt><dd>${escapeHtml(session.position)}</dd></div>
        <div><dt>Opponent</dt><dd>${escapeHtml(session.opponent_type)}</dd></div>
        <div><dt>Scheduled</dt><dd>${escapeHtml(session.scheduled_for)}</dd></div>
      </dl>
      ${session.notes ? `<p class="muted">${escapeHtml(session.notes)}</p>` : ""}
      <div class="actions">
        <button class="primary" onclick="openDebateRoom(${session.id})">
          ${isOver ? "📄 View Debate" : "🎙 Enter Room"}
        </button>
        <select aria-label="Status" onchange="updateSession(${session.id}, this.value)">
          ${statuses.map((status) => `<option value="${status}" ${status === session.status ? "selected" : ""}>${status}</option>`).join("")}
        </select>
        <button class="ghost danger" onclick="deleteSession(${session.id})">Delete</button>
      </div>
    </article>
  `;
}

async function updateSession(id, status) {
  await api(`/api/sessions/${id}`, { method: "PUT", body: JSON.stringify({ status }) });
  await loadView();
}

async function deleteSession(id) {
  await api(`/api/sessions/${id}`, { method: "DELETE" });
  await loadView();
}

function renderPeople(view, data, adminOverview = null) {
 const heading =
data.scope === "learners" ? "Learners" : data.scope === "students" ? "Students" : "User Management";
  const helpText = data.scope === "learners"
    ? "Coach access is limited to learner accounts and their debate activity. Click a learner to view their profile."
    : data.scope === "students"
      ? "Educator access focuses on student accounts and their debate progress. Click a student to view their profile and sessions."
      : "Administrator access covers all platform roles and backend management areas. Click anyone to view their full profile and sessions.";
  const isAdmin = state.user.role === "admin";

  view.innerHTML = html`
    <div class="grid ${adminOverview ? "two" : ""}">
      <section class="panel">
        <h2 class="section-title">${heading}</h2>
        <p class="muted">${helpText}</p>
        <div class="grid">
          ${data.users.map((person) => html`
            <article class="card person-card" onclick="openPersonProfile(${person.id})">
              <div class="person-card-row">
                <div>
                  <strong>${escapeHtml(person.name)}</strong>
                  <p class="muted">${escapeHtml(person.email)}</p>
                </div>
                <span class="badge">${escapeHtml(person.role)}</span>
              </div>
              ${
                isAdmin && person.id !== state.user.id
                  ? html`<button class="ghost danger" onclick="event.stopPropagation(); adminDeleteUser(${person.id})">Delete</button>`
                  : ""
              }
            </article>
          `).join("")}
        </div>
      </section>
      ${adminOverview ? renderAdminOverview(adminOverview) : ""}
    </div>
  `;
}

async function adminChangeRole(userId, newRole) {
  if (!confirm(`Change this user's role to "${newRole}"?`)) {
    return loadView();
  }
  try {
    await api(`/api/admin/users/${userId}/role?role=${encodeURIComponent(newRole)}`, { method: "PUT" });
    await loadView();
  } catch (error) {
    alert(error.message);
  }
}

async function adminDeleteUser(userId) {
  if (!confirm("Permanently delete this user and all their data? This cannot be undone.")) return;
  try {
    await api(`/api/admin/users/${userId}`, { method: "DELETE" });
    await loadView();
  } catch (error) {
    alert(error.message);
  }
}

function renderAdminOverview(data) {
  const health = data.systemHealth || {};
  return html`
    <section class="panel">
      <h2 class="section-title">Platform Overview</h2>

      <div class="admin-stat-grid">
        ${adminStatCard("👥", "purple", "Total Users", data.totalUsers)}
        ${adminStatCard("🎤", "orange", "Total Sessions", data.totalSessions)}
        ${adminStatCard("🟢", "green", "Active Now", data.activeSessions)}
        ${adminStatCard("⭐", "blue", "Avg Score", `${data.platformAverageScore}/100`)}
      </div>

      <div class="grid two" style="margin-top:18px;">
        <div class="admin-subpanel">
          <h3 class="compact-title">User Role Distribution</h3>
          <div class="role-dist-list">
            ${(data.roleDistribution || []).map((r) => html`
              <div class="role-dist-row">
                <span class="role-dist-name">${escapeHtml(r.role)}</span>
                <div class="role-dist-track">
                  <div class="role-dist-fill role-dist-${r.role}" style="width:${r.percent}%"></div>
                </div>
                <span class="role-dist-value">${r.total} (${r.percent}%)</span>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="admin-subpanel">
          <h3 class="compact-title">System Health</h3>
          <ul class="health-list">
            <li><span class="health-dot ${health.database ? "on" : "off"}"></span> Database</li>
            <li><span class="health-dot ${health.aiService ? "on" : "off"}"></span> AI Service (Groq)</li>
            <li><span class="health-dot ${health.emailService ? "on" : "off"}"></span> Email Service (SMTP)</li>
            <li><span class="health-dot on"></span> Debate Sessions</li>
          </ul>
        </div>
      </div>

      <h3 class="compact-title" style="margin-top:18px;">Recent Activity</h3>
      <div class="activity-feed">
        ${
          (data.recentActivity || []).length
            ? data.recentActivity.map((item) => html`
                <div class="activity-row">
                  <span class="activity-dot ${item.type === "user_registered" ? "activity-dot-user" : "activity-dot-session"}"></span>
                  <span class="activity-text">${escapeHtml(item.text)}</span>
                  <span class="activity-time">${escapeHtml(item.created_at)}</span>
                </div>
              `).join("")
            : `<div class="empty">No recent activity.</div>`
        }
      </div>
    </section>
  `;
}

function adminStatCard(icon, color, label, value) {
  return html`
    <div class="admin-stat-card">
      <div class="admin-stat-icon admin-stat-icon-${color}">${icon}</div>
      <div>
        <span class="admin-stat-label">${label}</span>
        <strong class="admin-stat-value">${value}</strong>
      </div>
    </div>
  `;
}

function openPersonProfile(id) {
  state.selectedPersonId = id;
  setView("personProfile");
}

function profileFieldRow(label, value) {
  if (!value) return "";
  return `<div class="field"><label>${escapeHtml(label)}</label><input value="${escapeHtml(value)}" readonly /></div>`;
}

function renderPersonProfile(view, profileData, sessionsData) {
  const target = profileData.user;
  const profile = profileData.profile || {};
  const skills = profileData.skills || [];
  const sessions = sessionsData.sessions || [];

  view.innerHTML = html`
    <button class="ghost" onclick="setView('people')">&larr; Back to ${escapeHtml(peopleLabel())}</button>

    <section class="panel" style="margin-top:12px;">
      <h2 class="section-title">${escapeHtml(target.name)}</h2>
      <p class="muted">${escapeHtml(target.email)} &nbsp;·&nbsp; <span class="badge">${escapeHtml(target.roleLabel)}</span></p>

      <h3 class="compact-title">Profile</h3>
      <div class="grid two">
        ${profileFieldRow("Experience / Expertise Level", profile.experience_level)}
        ${profileFieldRow("Institution", profile.institution)}
        ${profileFieldRow("Specialization", profile.specialization)}
        ${profileFieldRow("Years of Experience", profile.years_of_experience)}
        ${profileFieldRow("Preferred Topics", profile.preferred_topics)}
        ${profileFieldRow("Presentation Domains", profile.presentation_domains)}
        ${profileFieldRow("Learning Goals", profile.learning_goals)}
        ${profileFieldRow("Coaching Preferences", profile.coaching_preferences)}
      </div>

      ${
        skills.length
          ? `<h3 class="compact-title">Skills</h3>${skills.map((skill) => skillDisplay(skill.skill_name, skill.score)).join("")}`
          : ""
      }
    </section>

    <section class="panel" style="margin-top:14px;">
      <h2 class="section-title">Debate Sessions</h2>
      ${sessions.length ? sessions.map(sessionCard).join("") : `<div class="empty">No sessions found.</div>`}
    </section>
  `;
}

let topicsCache = [];

function loadCustomTopics() {
  try {
    return JSON.parse(localStorage.getItem("dc_custom_topics") || "[]");
  } catch {
    return [];
  }
}

function saveCustomTopics(list) {
  localStorage.setItem("dc_custom_topics", JSON.stringify(list));
}

function renderTopics(view, topicData) {
  const serverTopics = (topicData.topics || []).map((topic) => ({ topic, difficulty: "Standard", custom: false }));
  const customTopics = loadCustomTopics();
  topicsCache = [...customTopics, ...serverTopics];
  const isLearner = state.user.role === "learner";

  view.innerHTML = html`
    <div class="grid ${isLearner ? "two" : ""}">
      ${
        isLearner
          ? `
      <section class="panel">
        <h2 class="section-title">Add a Debate Topic</h2>
        <p class="muted">Custom topics are saved on this device and added to your list below.</p>
        <form id="topicForm">
          <div class="field">
            <label for="topicText">Topic</label>
            <input id="topicText" name="topic" type="text" placeholder="e.g. Should homework be abolished?" required />
          </div>
          ${selectField("difficulty", "Difficulty", [["Beginner", "Beginner"], ["Intermediate", "Intermediate"], ["Advanced", "Advanced"]])}
          <button class="primary" type="submit">Add Topic</button>
        </form>
      </section>
      `
          : ""
      }
      <section class="panel">
        <h2 class="section-title">Debate Topics</h2>
        <p class="muted">${topicsCache.length} topics available${isLearner ? " — pick one to set up a session." : "."}</p>
        <div class="grid">
          ${topicsCache.map((topic, index) => topicCard(topic, index)).join("")}
        </div>
      </section>
    </div>
  `;

  if (isLearner) {
    document.querySelector("#topicForm").addEventListener("submit", (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target));
      const updated = [{ topic: data.topic.trim(), difficulty: data.difficulty, custom: true }, ...loadCustomTopics()];
      saveCustomTopics(updated);
      renderTopics(view, topicData);
    });

    view.querySelectorAll("[data-start-topic]").forEach((button) => {
      button.addEventListener("click", () => {
        goToNewSessionWithTopic(topicsCache[Number(button.dataset.startTopic)].topic);
      });
    });
  }
}

function topicCard(topicItem, index) {
  return html`
    <article class="card topic-card">
      <div>
        <strong>${escapeHtml(topicItem.topic)}</strong>
        <div class="topic-meta">
          <span class="badge">${escapeHtml(topicItem.difficulty)}</span>
          ${topicItem.custom ? `<span class="muted">Custom</span>` : ""}
        </div>
      </div>
      ${state.user.role === "learner" ? `<button class="ghost" data-start-topic="${index}">Set Up Debate</button>` : ""}
    </article>
  `;
}

function goToNewSessionWithTopic(topic) {
  state.prefillTopic = topic;
  setView("newSession");
}

function renderSkills(view, skillsData) {
  const skills = skillsData.skills || [];
  view.innerHTML = html`
    <section class="panel" style="max-width:760px;margin:auto;">
      <h2 class="section-title">Skill Tracking</h2>
      <p class="muted">Your current skill levels, as assessed by your coach/educator as you practice.</p>
      ${
        skills.length
          ? skills.map((skill) => skillDisplay(skill.skill_name, skill.score)).join("")
          : `<div class="empty">No skills tracked yet.</div>`
      }
    </section>
  `;
}

function renderReports(view, dashboardData) {
  const stats = dashboardData.stats;
  const completionRate = stats.visibleSessions > 0
    ? Math.round((stats.completedSessions / stats.visibleSessions) * 100)
    : 0;

  view.innerHTML = html`
    <div class="dashboard">
      <section class="panel">
        <h2 class="section-title">Performance Reports</h2>
        <p class="muted">A snapshot built from your current session data.</p>
      </section>
      <div class="grid four">
        ${statCard("Total Sessions", stats.visibleSessions)}
        ${statCard("Completed", stats.completedSessions)}
        ${statCard("Scheduled", stats.scheduledSessions)}
        ${statCard("Completion Rate", `${completionRate}%`)}
      </div>
    </div>
  `;
}

/* ---------------------------------------------------------------------- */
/* Debate Room                                                              */
/* ---------------------------------------------------------------------- */

const recorder = {
  mediaRecorder: null,
  chunks: [],
  isRecording: false,
};
let recordingStartTime = null;

function openDebateRoom(sessionId) {
  state.activeSessionId = sessionId;
  setView("debateRoom");
}

function renderDebateRoom(view, data) {
  const session = data.session;
  const turns = data.turns || [];
  const summary = data.summary;
  const feedback = data.feedback || [];
  const isEnded = session.status === "completed" || session.status === "cancelled";
  const canLeaveFeedback = ["coach", "educator", "admin"].includes(state.user.role);

  view.innerHTML = html`
    <button class="ghost" onclick="setView('sessions')">&larr; Back to sessions</button>

    <section class="panel" style="margin-top:12px;">
      <h2 class="section-title">${escapeHtml(session.topic)}</h2>
      <p class="muted">
        ${escapeHtml(session.format)} &nbsp;·&nbsp;
        You are arguing <strong>${escapeHtml(session.position)}</strong> &nbsp;·&nbsp;
        <span class="badge badge-${session.status}">${escapeHtml(session.status)}</span>
      </p>
    </section>

    ${summary ? renderSessionSummaryPanel(summary) : ""}

    ${renderCoachFeedbackPanel(feedback, canLeaveFeedback)}

    <section class="panel" style="margin-top:14px;">
      <div id="transcript" class="transcript">
        ${
          turns.length
            ? turns.map(transcriptRow).join("")
            : `<div class="empty">No turns yet. Record your opening argument to start the debate.</div>`
        }
      </div>

      <div id="roomStatus" class="muted" style="margin:10px 0;"></div>

      ${
        isEnded
          ? `<p class="muted">This debate has ended.${session.status === "cancelled" ? " It was cancelled because the scheduled time passed without starting." : ""}</p>`
          : html`
            <div class="room-controls">
              <button id="recordBtn" class="primary" onclick="toggleRecording()">🎙 Start speaking</button>
              <span class="muted">or type instead:</span>
              <form id="textTurnForm" style="flex:1;display:flex;gap:8px;">
                <input id="textTurnInput" name="message" type="text" placeholder="Type your argument..." style="flex:1;min-height:40px;border:1px solid var(--line);border-radius:var(--radius-sm);padding:8px 10px;background:#fbfcfe;" />
                <button class="ghost" type="submit">Send</button>
              </form>
              <button class="ghost finish-btn" onclick="endDebate()">🏁 End Debate</button>
            </div>
          `
      }
    </section>
  `;

  if (!isEnded) {
    document.querySelector("#textTurnForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const input = document.querySelector("#textTurnInput");
      const message = input.value.trim();
      if (!message) return;
      input.value = "";
      await sendDebateTurn({ message });
    });
  }

  if (canLeaveFeedback) {
    const feedbackForm = document.querySelector("#coachFeedbackForm");
    if (feedbackForm) {
      feedbackForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const input = document.querySelector("#coachFeedbackInput");
        const text = input.value.trim();
        if (!text) return;
        try {
          await api(`/api/sessions/${state.activeSessionId}/feedback`, {
            method: "POST",
            body: JSON.stringify({ feedback_text: text }),
          });
          input.value = "";
          await loadView();
        } catch (error) {
          alert(error.message);
        }
      });
    }
  }

  const transcriptEl = document.querySelector("#transcript");
  transcriptEl.scrollTop = transcriptEl.scrollHeight;
}

function renderCoachFeedbackPanel(feedback, canLeaveFeedback) {
  if (!feedback.length && !canLeaveFeedback) return "";
  return html`
    <section class="panel" style="margin-top:14px;">
      <h2 class="section-title">Coach Feedback</h2>
      ${
        feedback.length
          ? feedback.map((f) => html`
              <div class="coach-feedback-note">
                <p>${escapeHtml(f.feedback_text)}</p>
                <span class="muted">— ${escapeHtml(f.coach_name)}, ${escapeHtml(f.created_at)}</span>
              </div>
            `).join("")
          : `<p class="muted">No coach feedback yet.</p>`
      }
      ${
        canLeaveFeedback
          ? html`
            <form id="coachFeedbackForm" style="display:flex;gap:8px;margin-top:12px;">
              <input id="coachFeedbackInput" type="text" placeholder="Leave feedback for this learner..." style="flex:1;min-height:40px;border:1px solid var(--line);border-radius:var(--radius-sm);padding:8px 10px;" />
              <button class="primary" type="submit">Add Note</button>
            </form>
          `
          : ""
      }
    </section>
  `;
}

function renderSessionSummaryPanel(summary) {
  return html`
    <section class="panel" style="margin-top:14px;">
      <h2 class="section-title">Debate Summary</h2>

      <div class="summary-block">
        <h4>Overall Score</h4>
        <p>${summary.avg_overall}/100</p>
      </div>

      <div class="summary-block">
        <h4>Turns Taken</h4>
        <p>${summary.turns_count}</p>
      </div>

      <div class="summary-block">
        <h4>Fallacies Detected</h4>
        <p>${summary.fallacy_count}</p>
      </div>

      <div class="summary-block">
        <h4>Scoring Criteria</h4>
        <div class="criteria-grid">
          <div class="criteria-cell">
            <span class="criteria-label">Clarity</span>
            <span class="criteria-value">${summary.avg_clarity}%</span>
          </div>
          <div class="criteria-cell">
            <span class="criteria-label">Relevance</span>
            <span class="criteria-value">${summary.avg_relevance}%</span>
          </div>
          <div class="criteria-cell">
            <span class="criteria-label">Evidence Strength</span>
            <span class="criteria-value">${summary.avg_evidence}%</span>
          </div>
          <div class="criteria-cell">
            <span class="criteria-label">Logical Consistency</span>
            <span class="criteria-value">${summary.avg_consistency}%</span>
          </div>
          <div class="criteria-cell">
            <span class="criteria-label">Persuasiveness</span>
            <span class="criteria-value">${summary.avg_persuasiveness}%</span>
          </div>
        </div>
      </div>

      <div class="summary-block">
        <h4>Remarks</h4>
        <p>${escapeHtml(summary.overall_assessment)}</p>
      </div>

      <div class="summary-block">
        <h4>Strengths</h4>
        <ul>${(summary.strengths || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
      </div>

      <div class="summary-block">
        <h4>Suggestions</h4>
        <ul>${(summary.areas_to_improve || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
      </div>

      <div class="summary-block">
        <h4>Next Steps</h4>
        <ul>${(summary.suggested_next_steps || []).map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ul>
      </div>
    </section>
  `;
}

function transcriptRow(turn) {
  const isUser = turn.speaker === "user";
  return html`
    <div class="chat-row ${isUser ? "chat-user" : "chat-opponent"}">
      <div class="chat-bubble">
        <span class="chat-label">${isUser ? "You" : "Opponent"}</span>
        <p>${escapeHtml(turn.message)}</p>

        ${
          isUser && turn.audio_path
            ? `<audio controls src="${escapeHtml(turn.audio_path)}" style="width:100%;margin-top:6px;"></audio>`
            : ""
        }

        ${
          isUser && turn.main_claim
            ? `<div class="analysis-flag">
                <strong>Claim:</strong> ${escapeHtml(turn.main_claim)}
                ${
                  turn.evidence_offered && turn.evidence_offered.length
                    ? `<p class="muted"><strong>Evidence:</strong> ${turn.evidence_offered.map(escapeHtml).join("; ")}</p>`
                    : `<p class="muted">No supporting evidence offered.</p>`
                }
              </div>`
            : ""
        }

        ${
          isUser && turn.overall_score != null
            ? `<div class="score-flag">
                <strong>Score: ${turn.overall_score}/100</strong>
                <span class="muted"> · Clarity ${turn.clarity_score} · Evidence ${turn.evidence_score} · Consistency ${turn.consistency_score} · Persuasiveness ${turn.persuasiveness_score}</span>
                ${turn.score_feedback ? `<p class="muted">${escapeHtml(turn.score_feedback)}</p>` : ""}
              </div>`
            : ""
        }

        ${
          isUser && turn.words_per_minute
            ? `<p class="muted">🗣 ${turn.words_per_minute} WPM (${escapeHtml(turn.pace_status || "")})</p>`
            : ""
        }

        ${
          turn.fallacy_detected
            ? `<div class="fallacy-flag">
                <strong>⚠ ${escapeHtml(turn.fallacy_type)}</strong>
                <p>${escapeHtml(turn.explanation || "")}</p>
                ${turn.correction_suggestion ? `<p class="muted">Try instead: ${escapeHtml(turn.correction_suggestion)}</p>` : ""}
              </div>`
            : ""
        }
      </div>
    </div>
  `;
}

async function toggleRecording() {
  if (recorder.isRecording) {
    recorder.mediaRecorder.stop();
    return;
  }

  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    setRoomStatus("Your browser doesn't support microphone recording. Use the text box instead.", true);
    return;
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    recorder.mediaRecorder = mediaRecorder;
    recorder.chunks = [];
    recorder.isRecording = true;
    recordingStartTime = Date.now();
    updateRecordButton();

    mediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) recorder.chunks.push(event.data);
    });

    mediaRecorder.addEventListener("stop", async () => {
      recorder.isRecording = false;
      updateRecordButton();
      stream.getTracks().forEach((track) => track.stop());

      const durationSeconds = recordingStartTime ? (Date.now() - recordingStartTime) / 1000 : null;
      recordingStartTime = null;

      const blob = new Blob(recorder.chunks, { type: "audio/webm" });
      if (blob.size === 0) {
        setRoomStatus("Didn't catch any audio -- try again.", true);
        return;
      }
      await sendDebateTurn({ audioBlob: blob, durationSeconds });
    });

    mediaRecorder.start();
    setRoomStatus("Recording... click again to stop.");
  } catch (error) {
    setRoomStatus("Microphone access was denied. Use the text box instead.", true);
  }
}

function updateRecordButton() {
  const btn = document.querySelector("#recordBtn");
  if (!btn) return;
  btn.textContent = recorder.isRecording ? "⏹ Stop & send" : "🎙 Start speaking";
  btn.classList.toggle("recording", recorder.isRecording);
}

function setRoomStatus(text, isError = false) {
  const el = document.querySelector("#roomStatus");
  if (!el) return;
  el.textContent = text;
  el.style.color = isError ? "var(--red)" : "";
}

async function sendDebateTurn({ message, audioBlob, durationSeconds }) {
  setRoomStatus("The auditor, scorer, and opponent are thinking...");
  try {
    const formData = new FormData();
    formData.append("session_id", state.activeSessionId);
    if (audioBlob) {
      formData.append("audio", audioBlob, "turn.webm");
      if (durationSeconds) formData.append("duration_seconds", durationSeconds);
    } else {
      formData.append("message", message);
    }

    const headers = {};
    if (state.token) headers.Authorization = `Bearer ${state.token}`;
    const response = await fetch("/api/debate/turn", { method: "POST", body: formData, headers });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Something went wrong");

    setRoomStatus("");
    await loadView();
  } catch (error) {
    setRoomStatus(error.message, true);
  }
}

async function endDebate() {
  if (!confirm("End this debate now and see your final score and feedback?")) return;
  setRoomStatus("Wrapping up your debate and preparing your final report...");
  try {
    await api(`/api/sessions/${state.activeSessionId}/end`, { method: "POST" });
    await loadView();
  } catch (error) {
    setRoomStatus(error.message, true);
  }
}


function renderSkillGap(view, data) {
  const skills = data.skills || [];
  view.innerHTML = html`
    <section class="panel" style="max-width:760px;margin:auto;">
      <h2 class="section-title">Skill Gap Analysis</h2>
      <p class="muted">
        ${
          data.sample_size > 0
            ? `Averaged across ${data.sample_size} scored debate turns from all learners.`
            : "No scored debate turns yet across your learners."
        }
      </p>
      ${skills.map((s) => skillDisplay(s.skill_name, s.score)).join("")}
    </section>
  `;
}



/* ---------------------------------------------------------------------- */
/* Global floating AI Debate Coach Assistant                               */
/* (friendly helper on every page -- not the in-room Opponent agent)       */
/* ---------------------------------------------------------------------- */

function renderAssistantWidget() {
  if (!state.token || !state.user) return "";

  return html`
    <div class="assistant-widget">
      <button class="assistant-fab" onclick="toggleAssistant()" aria-label="Open AI Debate Coach Assistant">
        🤖
      </button>
      <div class="assistant-panel ${state.assistantOpen ? "open" : ""} ${state.assistantMaximized ? "maximized" : ""}" id="assistantPanel">
        <div class="assistant-header">
          <strong>🤖 AI Debate Coach</strong>
          <div class="assistant-header-actions">
            <button class="assistant-icon-btn" id="assistantMaximizeBtn" onclick="toggleAssistantMaximize()" aria-label="${state.assistantMaximized ? "Restore" : "Maximize"}">
              ${state.assistantMaximized ? "⤡" : "⤢"}
            </button>
            <button class="assistant-icon-btn" onclick="toggleAssistant()" aria-label="Close">✕</button>
          </div>
        </div>
        <div class="assistant-messages" id="assistantMessages">
          ${assistantMessagesHtml()}
        </div>
        <form id="assistantForm" class="assistant-form">
          <input id="assistantInput" type="text" placeholder="Ask me anything..." autocomplete="off" />
          <button class="primary" type="submit">Send</button>
        </form>
      </div>
    </div>
  `;
}

function assistantMessagesHtml() {
  if (!state.assistantHistory.length) {
    return `<div class="assistant-empty">Hi${state.user ? " " + escapeHtml(state.user.name.split(" ")[0]) : ""}! Ask me about debating, logical fallacies, or how this platform works.</div>`;
  }
  const rows = state.assistantHistory
    .map(
      (turn) => html`
        <div class="assistant-row ${turn.role === "user" ? "assistant-row-user" : "assistant-row-bot"}">
          <div class="assistant-bubble">${escapeHtml(turn.content)}</div>
        </div>
      `
    )
    .join("");
  const typing = state.assistantBusy
    ? `<div class="assistant-row assistant-row-bot"><div class="assistant-bubble assistant-typing">Thinking...</div></div>`
    : "";
  return rows + typing;
}

function toggleAssistant() {
  state.assistantOpen = !state.assistantOpen;
  const panel = document.querySelector("#assistantPanel");
  if (panel) panel.classList.toggle("open", state.assistantOpen);

  if (state.assistantOpen) {
    attachAssistantFormHandler();
    const input = document.querySelector("#assistantInput");
    if (input) input.focus();
  }
}

function toggleAssistantMaximize() {
  state.assistantMaximized = !state.assistantMaximized;
  const panel = document.querySelector("#assistantPanel");
  if (panel) panel.classList.toggle("maximized", state.assistantMaximized);
  const btn = document.querySelector("#assistantMaximizeBtn");
  if (btn) {
    btn.textContent = state.assistantMaximized ? "⤡" : "⤢";
    btn.setAttribute("aria-label", state.assistantMaximized ? "Restore" : "Maximize");
  }
  const container = document.querySelector("#assistantMessages");
  if (container) container.scrollTop = container.scrollHeight;
}

function attachAssistantFormHandler() {
  const form = document.querySelector("#assistantForm");
  if (!form || form.dataset.bound) return;
  form.dataset.bound = "true";
  form.addEventListener("submit", handleAssistantSend);
}

function refreshAssistantMessages() {
  const container = document.querySelector("#assistantMessages");
  if (!container) return;
  container.innerHTML = assistantMessagesHtml();
  container.scrollTop = container.scrollHeight;
}

async function handleAssistantSend(event) {
  event.preventDefault();
  const input = document.querySelector("#assistantInput");
  const message = input.value.trim();
  if (!message || state.assistantBusy) return;

  input.value = "";
  state.assistantHistory.push({ role: "user", content: message });
  state.assistantBusy = true;
  refreshAssistantMessages();

  try {
    const payload = await api("/api/assistant/chat", {
      method: "POST",
      body: JSON.stringify({ message, history: state.assistantHistory.slice(0, -1) }),
    });
    state.assistantHistory.push({ role: "assistant", content: payload.reply });
  } catch (error) {
    state.assistantHistory.push({ role: "assistant", content: `Sorry, something went wrong: ${error.message}` });
  } finally {
    state.assistantBusy = false;
    refreshAssistantMessages();
  }
}

window.logout = logout;
window.setView = setView;
window.switchAuth = switchAuth;
window.updateRoleFields = updateRoleFields;
window.resendOtp = resendOtp;
window.updateSession = updateSession;
window.deleteSession = deleteSession;
window.openPersonProfile = openPersonProfile;
window.openDebateRoom = openDebateRoom;
window.toggleRecording = toggleRecording;
window.goToNewSessionWithTopic = goToNewSessionWithTopic;
window.endDebate = endDebate;
window.adminChangeRole = adminChangeRole;
window.adminDeleteUser = adminDeleteUser;
window.toggleAssistant = toggleAssistant;
window.toggleAssistantMaximize = toggleAssistantMaximize;

render();