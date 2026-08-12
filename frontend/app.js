const app = document.querySelector("#app");
const difficultyLevels = ["Novice", "Advanced", "Master"];
const presRecorder = { mediaRecorder: null, chunks: [], isRecording: false };

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
  coachHistory: [],
  coachBusy: false,
  coachLastFallacy: null,
  coachLastScore: null,
  notifOpen: false,
  notifications: [],
};

const roleOptions = [
  ["learner", "Learner"],
  ["coach", "Debate Coach"],
  ["educator", "Educator"],
];

const toolConfig = {
  toolAnalyze:  { title: "Argument Analyzer", endpoint: "/api/tools/analyze", placeholder: "Paste an argument to score it..." },
  toolFallacy:  { title: "Fallacy Detector", endpoint: "/api/tools/fallacy", placeholder: "Paste an argument to check for logical fallacies..." },
  toolCounter:  { title: "Counterargument Generator", endpoint: "/api/tools/counterargument", placeholder: "Paste an argument to get a counterargument..." },
};

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
  if (!response.ok) throw new Error(data.error || data.detail || "Something went wrong");
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
    ${navButton("coach","🤖 AI Debate Coach")}
    ${navButton("toolAnalyze","🔍 Argument Analyzer")}
    ${navButton("toolFallacy","⚠️ Fallacy Detector")}
    ${navButton("toolCounter","💬 Counterargument Generator")}
    ${navButton("toolPresentation","🎤 Presentation Analysis")}
    ${["learner","coach","educator"].includes(state.user.role) ? navButton("tasks", state.user.role==="learner" ? "✅ My Tasks" : "✅ Assign Tasks") : ""}

    ${["coach","educator","admin"].includes(state.user.role) ? `
    <span class="nav-group-label">People</span>
    ${navButton("people","👥 " + peopleLabel())}
    ${navButton("skillGap","📊 Skill Gap")}
    ` : ""}

    <span class="nav-group-label">Account</span>
    ${navButton("profile","👤 Profile")}
</nav>
<button class="notif-bell" onclick="setView('notifications')">
  🔔 Notifications
  <span id="notifBadge" class="notif-badge" style="display:none;">0</span>
</button>
<div class="notif-panel" id="notifPanel"></div>
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
  refreshNotifBadge();
}

setInterval(async () => {
  if (state.token && state.user) {
    try { await api("/api/sessions"); } catch (e) {}
  }
}, 30000); // every 30 seconds

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
    if (state.view === "dashboard") {
  const dashboardData = await api("/api/dashboard");
  const recommendation = state.user.role === "learner" ? await api("/api/learner/recommendations") : null;
  return renderDashboard(view, dashboardData, recommendation);
}
    if (state.view === "profile") {
  const profileData = await api("/api/profile");
  const myCoachData = state.user.role === "learner" ? await api("/api/my-coach") : null;
  return renderProfile(view, profileData, myCoachData);
}
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
    if (state.view === "notifications") {
  const data = await api("/api/notifications");
  return renderNotifications(view, data);
}
    if (state.view === "toolPresentation") return renderPresentationTool(view);
    if (state.view === "topics") return renderTopics(view, await api("/api/topics"));
    if (state.view === "skills") {
      if (state.user.role !== "learner") {
        state.view = "dashboard";
        return loadView();
      }
      return renderSkills(view, await api("/api/skills"));
    }
    if (state.view === "reports") return renderReports(view, await api("/api/reports"));
    if (state.view === "debateRoom") {
      const id = state.activeSessionId;
      if (!id) {
        state.view = "sessions";
        return loadView();
      }
      const data = await api(`/api/debate/turns/${id}`);
      return renderDebateRoom(view, data);
    }
    if (state.view === "skillGap") {
      if (!["coach", "educator", "admin"].includes(state.user.role)) {
        state.view = "dashboard";
        return loadView();
      }
      return renderSkillGap(view, await api("/api/coach/skill-gap"));
    }
    if (["toolAnalyze","toolFallacy","toolCounter"].includes(state.view)) return renderToolPage(view, state.view);
    if (state.view === "coach") return renderCoachPage(view);
    if (state.view === "tasks") {
  const tasksData = await api("/api/tasks");
  const learnersData = tasksData.scope === "assigner" ? await api("/api/users") : null;
  return renderTasks(view, tasksData, learnersData);
}
  } catch (error) {
    view.innerHTML = `<div class="message error">${escapeHtml(error.message)}</div>`;
  }
}

function renderPresentationTool(view) {
  view.innerHTML = html`
    <div class="dash-header">
      <span class="dash-header-role">${escapeHtml(state.user.roleLabel)}</span>
      <h1>Presentation Analysis</h1>
      <p>Record a clip or upload an audio file to check your speaking pace, filler words, confidence, and clarity.</p>
    </div>
    <section class="panel">
      <div class="pres-input-tabs">
        <button class="pres-tab active" id="presTabRecord" onclick="switchPresInputMode('record')">🎙 Record</button>
        <button class="pres-tab" id="presTabUpload" onclick="switchPresInputMode('upload')">📁 Upload File</button>
      </div>

      <div id="presRecordSection">
        <div class="room-controls">
          <button id="presRecordBtn" class="primary" onclick="togglePresentationRecording()">🎙 Start speaking</button>
        </div>
      </div>

      <div id="presUploadSection" style="display:none;">
        <div class="field">
          <label for="presFileInput">Choose an audio file (.mp3, .wav, .m4a, .webm)</label>
          <input id="presFileInput" type="file" accept="audio/*" />
        </div>
        <button class="primary" onclick="submitPresentationFile()">Analyze File</button>
      </div>

      <div id="presStatus" class="muted" style="margin-top:10px;"></div>
      <div id="presResult" style="margin-top:14px;"></div>
    </section>
  `;
}

function switchPresInputMode(mode) {
  const recordSection = document.querySelector("#presRecordSection");
  const uploadSection = document.querySelector("#presUploadSection");
  const recordTab = document.querySelector("#presTabRecord");
  const uploadTab = document.querySelector("#presTabUpload");

  if (mode === "record") {
    recordSection.style.display = "";
    uploadSection.style.display = "none";
    recordTab.classList.add("active");
    uploadTab.classList.remove("active");
  } else {
    recordSection.style.display = "none";
    uploadSection.style.display = "";
    recordTab.classList.remove("active");
    uploadTab.classList.add("active");
  }
}

async function submitPresentationFile() {
  const fileInput = document.querySelector("#presFileInput");
  const file = fileInput.files[0];
  if (!file) {
    document.querySelector("#presStatus").textContent = "Choose a file first.";
    return;
  }
  // Duration isn't known upfront for an uploaded file without decoding it client-side,
  // so pace (WPM) is skipped for uploads -- delivery scores still work fine.
  await submitPresentationAudio(file, null);
}

async function togglePresentationRecording() {
  if (presRecorder.isRecording) {
    presRecorder.mediaRecorder.stop();
    return;
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    presRecorder.mediaRecorder = mediaRecorder;
    presRecorder.chunks = [];
    presRecorder.isRecording = true;
    presRecordingStart = Date.now();
    updatePresRecordButton();

    mediaRecorder.addEventListener("dataavailable", (e) => { if (e.data.size > 0) presRecorder.chunks.push(e.data); });
    mediaRecorder.addEventListener("stop", async () => {
      presRecorder.isRecording = false;
      updatePresRecordButton();
      stream.getTracks().forEach((t) => t.stop());
      const durationSeconds = presRecordingStart ? (Date.now() - presRecordingStart) / 1000 : null;
      presRecordingStart = null;

      const blob = new Blob(presRecorder.chunks, { type: "audio/webm" });
      if (blob.size === 0) {
        document.querySelector("#presStatus").textContent = "Didn't catch any audio -- try again.";
        return;
      }
      await submitPresentationAudio(blob, durationSeconds);
    });

    mediaRecorder.start();
    document.querySelector("#presStatus").textContent = "Recording... click again to stop.";
  } catch (error) {
    document.querySelector("#presStatus").textContent = "Microphone access was denied.";
  }
}

function updatePresRecordButton() {
  const btn = document.querySelector("#presRecordBtn");
  if (!btn) return;
  btn.textContent = presRecorder.isRecording ? "⏹ Stop & analyze" : "🎙 Start speaking";
  btn.classList.toggle("recording", presRecorder.isRecording);
}

async function submitPresentationAudio(blob, durationSeconds) {
  const statusEl = document.querySelector("#presStatus");
  const resultEl = document.querySelector("#presResult");
  statusEl.textContent = "Analyzing your delivery...";
  try {
    const formData = new FormData();
    const filename = blob.name || "clip.webm"; // uploaded File objects carry their own name
    formData.append("audio", blob, filename);
    formData.append("audio", blob, "clip.webm");
    if (durationSeconds) formData.append("duration_seconds", durationSeconds);
    const headers = {};
    if (state.token) headers.Authorization = `Bearer ${state.token}`;
    const response = await fetch("/api/tools/presentation", { method: "POST", body: formData, headers });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(result.error || "Something went wrong");

    statusEl.textContent = "";
    const m = result.metrics;
    resultEl.innerHTML = html`
      <div class="summary-block"><h4>Transcript</h4><p>${escapeHtml(result.transcript)}</p></div>
      ${result.wordsPerMinute ? `<div class="summary-block"><h4>Pace</h4><p>${result.wordsPerMinute} WPM (${escapeHtml(result.paceStatus)})</p></div>` : ""}
      <div class="summary-block">
        <h4>Delivery Scores</h4>
        <div class="criteria-grid">
          <div class="criteria-cell"><span class="criteria-label">Confidence</span><span class="criteria-value">${m.confidence_score}%</span></div>
          <div class="criteria-cell"><span class="criteria-label">Clarity</span><span class="criteria-value">${m.clarity_score}%</span></div>
          <div class="criteria-cell"><span class="criteria-label">Engagement</span><span class="criteria-value">${m.engagement_score}%</span></div>
        </div>
      </div>
      <div class="summary-block"><h4>Filler Words</h4><p>${m.filler_word_count} detected${m.filler_words_found.length ? ": " + m.filler_words_found.map(escapeHtml).join(", ") : ""}</p></div>
      ${m.feedback ? `<div class="summary-block"><h4>Feedback</h4><p>${escapeHtml(m.feedback)}</p></div>` : ""}
    `;
  } catch (error) {
    statusEl.textContent = "";
    resultEl.innerHTML = `<div class="message error">${escapeHtml(error.message)}</div>`;
  }
}

function renderDashboard(view, data, recommendation = null) {
  const stats = data.stats;
  const role = state.user.role;

  const roleHeading =
    role === "learner" ? "Learner Dashboard"
    : role === "coach" ? "Coach Dashboard"
    : role === "educator" ? "Educator Dashboard"
    : "Admin Dashboard";

  const roleSubtitle =
    role === "learner"
      ? "Track your debate skills, prepare for upcoming sessions, and review AI coaching feedback."
    : role === "coach"
      ? "Monitor your assigned learners' progress and evaluate their debates."
    : role === "educator"
      ? "Review class-wide debate performance and presentation outcomes."
    : "Platform-wide usage, users, and system health.";

  const headerHtml = html`
    <div class="dash-header">
      <span class="dash-header-role">${escapeHtml(state.user.roleLabel)}</span>
      <h1>${roleHeading}</h1>
      <p>${roleSubtitle}</p>
    </div>
  `;

  let statsHtml = "";
  if (role === "learner") {
    statsHtml = html`<div class="grid four">
      ${statCard("Average Skill", `${stats.averageSkill}%`, "tone-brand")}
      ${statCard("Visible Sessions", stats.visibleSessions, "tone-violet")}
      ${statCard("Scheduled", stats.scheduledSessions, "tone-accent")}
      ${statCard("Completed", stats.completedSessions, "tone-green")}
    </div>`;
  } else if (role === "coach") {
    statsHtml = html`<div class="grid four">
      ${statCard("Learners", stats.learners, "tone-brand")}
      ${statCard("Pending Evaluations", (data.pendingFeedback || []).length, "tone-red")}
      ${statCard("Scheduled", stats.scheduledSessions, "tone-accent")}
      ${statCard("Completed", stats.completedSessions, "tone-green")}
    </div>`;
  } else if (role === "educator") {
    statsHtml = html`<div class="grid four">
      ${statCard("Students", stats.learners, "tone-brand")}
      ${statCard("Visible Sessions", stats.visibleSessions, "tone-violet")}
      ${statCard("Scheduled", stats.scheduledSessions, "tone-accent")}
      ${statCard("Completed", stats.completedSessions, "tone-green")}
    </div>`;
  } else {
    statsHtml = html`<div class="grid four">
      ${statCard("Platform Users", stats.platformUsers, "tone-brand")}
      ${statCard("Learners", stats.learners, "tone-violet")}
      ${statCard("Visible Sessions", stats.visibleSessions, "tone-accent")}
      ${statCard("Completed", stats.completedSessions, "tone-green")}
    </div>`;
  }

  let bodyHtml = "";

 if (role === "learner") {
  bodyHtml = html`
    <div class="dash-cols" style="margin-top:20px;">
      <div class="dash-col">
        <section class="panel">
          <h2 class="section-title">Skill Progress</h2>
          <p class="section-subtitle">Computed from your scored debate turns.</p>
          ${radarChartSvg(data.skills)}
          ${data.skills.map(skill => skillDisplay(skill.skill_name, skill.score)).join("")}
        </section>
        <section class="panel">
          <h2 class="section-title">Recent Sessions</h2>
          <p class="section-subtitle">Your latest debate activity.</p>
          ${recentSessionsListHtml(data.recentSessions)}
        </section>
      </div>
      <div class="dash-col">
        <section class="panel">
          <h2 class="section-title">Quick Actions</h2>
          <p class="section-subtitle">Jump back into practice.</p>
          <div class="action-list">
            <button class="action-row" onclick="setView('newSession')">
              <div><span class="action-row-label">Schedule a Debate</span><div class="action-row-desc">Start a new practice session</div></div>
              <span class="action-row-arrow">→</span>
            </button>
            <button class="action-row" onclick="setView('topics')">
              <div><span class="action-row-label">Practice Topics</span><div class="action-row-desc">Browse or add debate topics</div></div>
              <span class="action-row-arrow">→</span>
            </button>
            <button class="action-row" onclick="setView('profile')">
              <div><span class="action-row-label">Update Profile</span><div class="action-row-desc">Preferences and coach selection</div></div>
              <span class="action-row-arrow">→</span>
            </button>
            <button class="action-row" onclick="setView('reports')">
              <div><span class="action-row-label">View Progress</span><div class="action-row-desc">Session history and completion rate</div></div>
              <span class="action-row-arrow">→</span>
            </button>
          </div>
        </section>
        ${recommendation ? html`<section class="panel">
          <h2 class="section-title">Coaching Recommendation</h2>
          ${recommendationPanelInnerHtml(recommendation)}
        </section>` : `<section class="panel"><div class="empty">No recommendation yet.</div></section>`}
      </div>
    </div>
  `;
}
   else if (role === "coach") {
    bodyHtml = html`
      <div class="grid two" style="margin-top:20px;">
        <section class="panel">
          <h2 class="section-title">Evaluation Queue</h2>
          <p class="section-subtitle">Completed debates awaiting your feedback.</p>
          ${queueListHtml(data.pendingFeedback)}
        </section>
        <section class="panel">
          <h2 class="section-title">Top Learners</h2>
          <p class="section-subtitle">Ranked by average debate score.</p>
          ${rankListHtml(data.topLearners)}
        </section>
      </div>
      <div class="grid two" style="margin-top:14px;">
        <section class="panel">
          <h2 class="section-title">Your Learners</h2>
          <div class="action-list">
            <button class="action-row" onclick="setView('people')">
              <div><span class="action-row-label">View Learners</span><div class="action-row-desc">${stats.learners} assigned learner${stats.learners === 1 ? "" : "s"}</div></div>
              <span class="action-row-arrow">→</span>
            </button>
            <button class="action-row" onclick="setView('skillGap')">
              <div><span class="action-row-label">Skill Gap Analysis</span><div class="action-row-desc">Class-wide strengths and weaknesses</div></div>
              <span class="action-row-arrow">→</span>
            </button>
          </div>
        </section>
        <section class="panel">
          <h2 class="section-title">Recent Activity</h2>
          <p class="section-subtitle">Latest sessions from your learners.</p>
          ${recentSessionsListHtml(data.recentSessions)}
        </section>
      </div>
    `;
  } else if (role === "educator") {
    bodyHtml = html`
      <div class="grid two" style="margin-top:20px;">
        <section class="panel">
          <h2 class="section-title">Student Rankings</h2>
          <p class="section-subtitle">Ranked by average debate score.</p>
          ${rankListHtml(data.topLearners)}
        </section>
        <section class="panel">
          <h2 class="section-title">Performance Reports</h2>
          <h3 class="compact-title" style="margin-top:0;">Debate Performance</h3>
          <ul class="report-list">
            <li>Overall class participation</li>
            <li>Debate completion rate</li>
            <li>Student engagement</li>
          </ul>
          <h3 class="compact-title">Presentation Assessment</h3>
          <ul class="report-list">
            <li>Communication skills</li>
            <li>Critical thinking</li>
            <li>Content delivery</li>
          </ul>
        </section>
      </div>
      <section class="panel" style="margin-top:14px;">
        <h2 class="section-title">Recent Class Activity</h2>
        ${recentSessionsListHtml(data.recentSessions)}
      </section>
    `;
  } else {
    bodyHtml = html`
      <div class="grid two" style="margin-top:20px;">
        <section class="panel">
          <h2 class="section-title">Top Active Debates</h2>
          <p class="section-subtitle">Most-practiced topics on the platform.</p>
          ${topTopicsListHtml(data.topTopics)}
        </section>
        <section class="panel">
          <h2 class="section-title">System Status</h2>
          <ul class="report-list">
            <li>Authentication Service — Operational</li>
            <li>Database — Connected</li>
            <li>Debate Sessions — Active</li>
            <li>Reports — Available</li>
          </ul>
          <h3 class="compact-title">Administrator Actions</h3>
          <div class="action-list">
            <button class="action-row" onclick="setView('people')">
              <div><span class="action-row-label">Manage Users</span></div><span class="action-row-arrow">→</span>
            </button>
            <button class="action-row" onclick="setView('sessions')">
              <div><span class="action-row-label">View Sessions</span></div><span class="action-row-arrow">→</span>
            </button>
          </div>
        </section>
      </div>
    `;
  }

  view.innerHTML = html`
    <div class="dashboard">
      ${headerHtml}
      ${statsHtml}
      ${bodyHtml}
    </div>
  `;
}

function recentSessionsListHtml(sessions) {
  if (!sessions || !sessions.length) return `<div class="empty">No sessions yet.</div>`;
  return html`
    <div class="recent-list">
      ${sessions.map((s) => html`
        <div class="recent-row">
          <div class="recent-row-title">${escapeHtml(s.topic)}</div>
          <div class="recent-row-meta">
            ${escapeHtml(s.owner_name || "")} ${s.owner_name ? "· " : ""}${escapeHtml(s.format)} · ${escapeHtml(s.status)}
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

function rankListHtml(learners) {
  if (!learners || !learners.length) return `<div class="empty">No scored debates yet.</div>`;
  return html`
    <div class="rank-list">
      ${learners.map((l, i) => html`
        <div class="rank-row">
          <span class="rank-number">${i + 1}</span>
          <span class="rank-name">${escapeHtml(l.name)}</span>
          <span class="rank-meta">${l.sessions_count} debate${l.sessions_count === 1 ? "" : "s"}</span>
          <span class="rank-score">${l.avg_score}%</span>
        </div>
      `).join("")}
    </div>
  `;
}

function queueListHtml(pending) {
  if (!pending || !pending.length) return `<div class="empty">Nothing pending — you're all caught up.</div>`;
  return html`
    <div class="recent-list">
      ${pending.map((p) => html`
        <div class="queue-row">
          <div>
            <div class="recent-row-title">${escapeHtml(p.topic)}</div>
            <div class="recent-row-meta">${escapeHtml(p.owner_name)}</div>
          </div>
          <button class="ghost" onclick="openDebateRoom(${p.id})">Review</button>
        </div>
      `).join("")}
    </div>
  `;
}

function topTopicsListHtml(topics) {
  if (!topics || !topics.length) return `<div class="empty">No sessions yet.</div>`;
  return html`
    <div class="rank-list">
      ${topics.map((t, i) => html`
        <div class="rank-row">
          <span class="rank-number">${i + 1}</span>
          <span class="rank-name">${escapeHtml(t.topic)}</span>
          <span class="rank-score">${t.session_count}</span>
        </div>
      `).join("")}
    </div>
  `;
}

function recommendationPanelHtml(recommendation) {
  return html`<section class="panel" style="margin-top:14px;"><h2 class="section-title">Coaching Recommendation</h2>${recommendationPanelInnerHtml(recommendation)}</section>`;
}

function recommendationPanelInnerHtml(recommendation) {
  return html`
    <div class="summary-block">
      <h4>Focus Area</h4>
      <p>${escapeHtml(recommendation.focus_area)}</p>
    </div>
    <div class="summary-block">
      <h4>Insight</h4>
      <p>${escapeHtml(recommendation.insight)}</p>
    </div>
    <div class="summary-block">
      <h4>Recommended Drills</h4>
      <ul>${(recommendation.recommended_drills || []).map((d) => `<li>${escapeHtml(d)}</li>`).join("")}</ul>
    </div>
    <div class="summary-block">
      <h4>Recommended Topics</h4>
      <ul>${(recommendation.recommended_topics || []).map((t) => `<li>${escapeHtml(t)}</li>`).join("")}</ul>
    </div>
  `;
}

function statCard(label, value, tone = "") {
  return `<article class="card stat ${tone}"><span class="muted">${label}</span><strong>${value}</strong></article>`;
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

function renderProfile(view, profileData, myCoachData = null) {
  const profile = profileData.profile;
  const fields = profileFieldsForRole(state.user.role);
  const myCoach = myCoachData ? myCoachData.coach : null;

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

    ${
      myCoachData
        ? html`
          <section class="panel" style="max-width:850px;margin:14px auto 0;">
            <h2 class="section-title">My Debate Coach</h2>
            <p class="muted">Pick who you want guiding your practice. You can change this anytime.</p>
            <div class="card">
              ${
                myCoach
                  ? html`<strong>${escapeHtml(myCoach.coach_name)}</strong>
                     <p class="muted" style="margin:4px 0 10px;">${escapeHtml(myCoach.coach_email)}</p>`
                  : `<p class="muted" style="margin:6px 0 10px;">No coach chosen yet.</p>`
              }
              <button class="ghost" onclick="browseCoaches()">${myCoach ? "Change Coach" : "Choose a Coach"}</button>
            </div>
            <div id="coachBrowsePanel"></div>
          </section>
        `
        : ""
    }
  `;

  document.querySelector("#profileForm").addEventListener("submit", saveProfile);
}

async function browseCoaches() {
  const panel = document.querySelector("#coachBrowsePanel");
  if (!panel) return;
  panel.innerHTML = `<div class="empty" style="margin-top:12px;">Loading...</div>`;
  try {
    const data = await api("/api/coaches");
    const list = data.coaches || [];
    panel.innerHTML = html`
      <h3 class="compact-title" style="margin-top:14px;">Choose a Coach</h3>
      ${
        list.length
          ? list
              .map(
                (c) => html`
                  <article class="card person-card" style="margin-bottom:8px;cursor:default;">
                    <div>
                      <strong>${escapeHtml(c.name)}</strong>
                      <p class="muted">${escapeHtml(c.specialization || "No specialization listed")} &middot; ${c.learner_count} learner${c.learner_count === 1 ? "" : "s"}</p>
                    </div>
                    <button class="primary" onclick="chooseCoach(${c.id})">Choose</button>
                  </article>
                `
              )
              .join("")
          : `<div class="empty">No coaches available yet.</div>`
      }
    `;
  } catch (error) {
    panel.innerHTML = `<div class="message error">${escapeHtml(error.message)}</div>`;
  }
}

async function chooseCoach(coachId) {
  try {
    await api("/api/my-coach", {
      method: "POST",
      body: JSON.stringify({ learner_id: state.user.id, coach_id: coachId }),
    });
    await loadView();
  } catch (error) {
    alert(error.message);
  }
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
        ${selectField("difficulty", "Difficulty Level", difficultyLevels.map((d) => [d, d]), "Advanced")}
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
      <div class="export-actions">
  <a class="ghost" href="/api/admin/export/excel" target="_blank">📊 Export Report</a>
</div>

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

function renderReports(view, data) {
  const sessions = data.completedSessions || [];

  view.innerHTML = html`
    <div class="dash-header">
      <span class="dash-header-role">${escapeHtml(state.user.roleLabel)}</span>
      <h1>Reports</h1>
      <p>Completed debate reports, scores, and exportable summaries.</p>
    </div>

    <div class="grid three" style="margin-bottom:16px;">
      ${statCard("Completed Debates", data.totalCompleted, "tone-brand")}
      ${statCard("Average Score", `${data.averageScore}/100`, "tone-green")}
      ${statCard("This View", state.user.roleLabel, "tone-violet")}
    </div>

    <section class="panel">
      <h2 class="section-title">Debate Reports</h2>
      <p class="section-subtitle">Click a report to view or export it.</p>
      ${
        sessions.length
          ? html`<div class="report-row-list">
              ${sessions.map((s) => reportRowHtml(s)).join("")}
            </div>`
          : `<div class="empty">No completed debates yet.</div>`
      }
    </section>
  `;
}

function reportRowHtml(session) {
  return html`
    <div class="report-row">
      <div class="report-row-main" onclick="openDebateRoom(${session.id})">
        <div class="report-row-title">${escapeHtml(session.topic)}</div>
        <div class="report-row-meta">
          ${escapeHtml(session.owner_name || "")} ${session.owner_name ? "· " : ""}${escapeHtml(session.format)} · ${escapeHtml(session.scheduled_for)}
        </div>
      </div>
      <div class="report-row-side">
        ${session.overall_score != null ? `<span class="badge session-score-badge">${session.overall_score}/100</span>` : ""}
        <a class="ghost" href="/api/sessions/${session.id}/export/pdf?token=${encodeURIComponent(state.token)}" target="_blank" onclick="event.stopPropagation()">PDF</a>
        <a class="ghost" href="/api/sessions/${session.id}/export/excel?token=${encodeURIComponent(state.token)}" target="_blank" onclick="event.stopPropagation()">Excel</a>
      </div>
    </div>
  `;
}

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
      <div class="export-actions">
  <a class="ghost" href="/api/sessions/${state.activeSessionId}/export/pdf?token=${encodeURIComponent(state.token)}" target="_blank">📄 Export PDF</a>
<a class="ghost" href="/api/sessions/${state.activeSessionId}/export/excel?token=${encodeURIComponent(state.token)}" target="_blank">📊 Export Excel</a>
</div>

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
          isUser && turn.confidence_score_delivery != null
            ? `<div class="presentation-flag">
            <strong>Delivery:</strong> Confidence ${turn.confidence_score_delivery} · Clarity ${turn.clarity_score_delivery} · Engagement ${turn.engagement_score}
            ${turn.filler_word_count ? `<span class="muted"> · ${turn.filler_word_count} filler word${turn.filler_word_count === 1 ? "" : "s"}</span>` : ""}
            ${turn.presentation_feedback ? `<p class="muted">${escapeHtml(turn.presentation_feedback)}</p>` : ""}
            </div>`
           : ""
        }

        ${
          !isUser && turn.rebuttal_type
            ? `<div class="rebuttal-tag rebuttal-tag-${turn.rebuttal_type.toLowerCase().replace(/[^a-z]/g, "-")}">${escapeHtml(turn.rebuttal_type)} Rebuttal</div>`
            : ""
        }

        ${
          !isUser && turn.challenge_question
            ? `<div class="challenge-flag"><strong>Challenge:</strong> ${escapeHtml(turn.challenge_question)}</div>`
            : ""
        }

        ${
          !isUser && turn.strategy_suggestion
            ? `<p class="muted" style="margin-top:6px;"><strong>Tip:</strong> ${escapeHtml(turn.strategy_suggestion)}</p>`
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
      ${radarChartSvg(skills)}
${skills.map((s) => skillDisplay(s.skill_name, s.score)).join("")}
    </section>
  `;
}

function renderTasks(view, tasksData, learnersData) {
  const tasks = tasksData.tasks || [];
  const isLearner = tasksData.scope === "learner";

  view.innerHTML = html`
    <div class="grid ${!isLearner ? "two" : ""}">
      ${
        !isLearner
          ? html`
            <section class="panel">
              <h2 class="section-title">Assign a Task</h2>
              <form id="assignTaskForm">
                <div class="field">
                  <label for="taskLearner">Learner</label>
                  <select id="taskLearner" name="learner_id" required>
                    ${(learnersData?.users || [])
                      .map((u) => `<option value="${u.id}">${escapeHtml(u.name)}</option>`)
                      .join("")}
                  </select>
                </div>
                <div class="field">
                  <label for="taskTitle">Title</label>
                  <input id="taskTitle" name="title" type="text" placeholder="e.g. Practice Evidence-Based Rebuttals" required />
                </div>
                <div class="field">
                  <label for="taskDescription">Description (optional)</label>
                  <textarea id="taskDescription" name="description" placeholder="Any details..."></textarea>
                </div>
                <button class="primary" type="submit">Assign Task</button>
              </form>
            </section>
          `
          : ""
      }
      <section class="panel">
        <h2 class="section-title">${isLearner ? "My Tasks" : "Tasks You've Assigned"}</h2>
        ${
          tasks.length
            ? tasks.map((t) => taskCard(t, isLearner)).join("")
            : `<div class="empty">No tasks yet.</div>`
        }
      </section>
    </div>
  `;

  if (!isLearner) {
    document.querySelector("#assignTaskForm").addEventListener("submit", async (event) => {
      event.preventDefault();
      const data = Object.fromEntries(new FormData(event.target));
      try {
        await api("/api/tasks", { method: "POST", body: JSON.stringify(data) });
        await loadView();
      } catch (error) {
        alert(error.message);
      }
    });
  }
}

function taskCard(task, isLearner) {
  return html`
    <article class="card">
      <header style="display:flex;justify-content:space-between;align-items:center;">
        <strong>${escapeHtml(task.title)}</strong>
        <span class="badge ${task.status === "completed" ? "badge-completed" : "badge-scheduled"}">${escapeHtml(task.status)}</span>
      </header>
      ${task.description ? `<p class="muted">${escapeHtml(task.description)}</p>` : ""}
      <p class="muted" style="font-size:12px;">
        ${isLearner ? `Assigned by ${escapeHtml(task.assigned_by_name)}` : `For ${escapeHtml(task.learner_name)}`}
        &nbsp;·&nbsp; ${escapeHtml(task.created_at)}
      </p>
      ${
        isLearner && task.status === "pending"
          ? `<button class="ghost" onclick="markTaskComplete(${task.id})">Mark Complete</button>`
          : ""
      }
    </article>
  `;
}

async function markTaskComplete(taskId) {
  try {
    await api(`/api/tasks/${taskId}`, { method: "PUT", body: JSON.stringify({ status: "completed" }) });
    await loadView();
  } catch (error) {
    alert(error.message);
  }
}


/* ---------------------------------------------------------------------- */
/* AI Debate Coach -- full page, orchestrator-routed chat                  */
/* ---------------------------------------------------------------------- */

const coachQuickActions = [
  ["Analyze my argument", "Analyze this argument: "],
  ["Detect fallacies", "Check this for logical fallacies: "],
  ["Get a counterargument", "Give me a counterargument to: "],
  ["Ask a question", ""],
];

function renderCoachPage(view) {
  view.innerHTML = html`
    <div class="coach-page">
      <section class="panel coach-chat-panel">
        <div class="coach-chat-header">
          <div>
            <h2 class="section-title" style="margin-bottom:2px;">🤖 AI Debate Coach</h2>
            <p class="muted" style="margin:0;">Your personal AI coach for arguments, fallacies, and counterarguments.</p>
          </div>
          <button class="ghost" onclick="clearCoachChat()">New Chat</button>
        </div>

        <div class="coach-quick-actions">
          ${coachQuickActions
            .map(
              ([label, prefill]) =>
                `<button class="ghost" onclick="prefillCoachInput('${prefill.replace(/'/g, "\\'")}')">${escapeHtml(label)}</button>`
            )
            .join("")}
        </div>

        <div class="coach-messages" id="coachMessages">
          ${coachMessagesHtml()}
        </div>

        <form id="coachForm" class="coach-form">
          <input id="coachInput" type="text" placeholder="Ask me anything, or paste an argument to analyze..." autocomplete="off" />
          <button class="primary" type="submit">Send</button>
        </form>
      </section>

      <aside class="coach-sidebar">
        <section class="panel">
          <h3 class="compact-title" style="margin-top:0;">Feedback Overview</h3>
          ${coachFeedbackPanelHtml()}
        </section>
        <section class="panel">
          <h3 class="compact-title" style="margin-top:0;">How to use it</h3>
          <ul class="report-list">
            <li>Paste an argument and ask to "analyze" it for a score</li>
            <li>Ask to "detect fallacies" to audit your reasoning</li>
            <li>Ask for a "counterargument" to practice rebuttals</li>
            <li>Or just ask a plain question about debating</li>
          </ul>
        </section>
      </aside>
    </div>
  `;

  document.querySelector("#coachForm").addEventListener("submit", handleCoachSend);
  const container = document.querySelector("#coachMessages");
  if (container) container.scrollTop = container.scrollHeight;
}

function coachMessagesHtml() {
  if (!state.coachHistory.length) {
    return `<div class="assistant-empty">I'm here to help you become a better debater. Ask me anything, or try one of the quick actions above.</div>`;
  }
  const rows = state.coachHistory
    .map(
      (turn) => html`
        <div class="assistant-row ${turn.role === "user" ? "assistant-row-user" : "assistant-row-bot"}">
          <div class="assistant-bubble">${escapeHtml(turn.content)}</div>
        </div>
      `
    )
    .join("");
  const typing = state.coachBusy
    ? `<div class="assistant-row assistant-row-bot"><div class="assistant-bubble assistant-typing">Thinking...</div></div>`
    : "";
  return rows + typing;
}

function coachFeedbackPanelHtml() {
  if (state.coachLastScore) {
    const s = state.coachLastScore;
    return html`
      <div class="grid two">
        ${statCard("Overall", `${s.overall_score}/100`)}
        ${statCard("Clarity", `${s.clarity}/100`)}
        ${statCard("Evidence", `${s.evidence_strength}/100`)}
        ${statCard("Consistency", `${s.logical_consistency}/100`)}
      </div>
      ${s.feedback ? `<p class="muted" style="margin-top:10px;">${escapeHtml(s.feedback)}</p>` : ""}
    `;
  }
  if (state.coachLastFallacy) {
    const f = state.coachLastFallacy;
    return f.fallacy_detected
      ? `<div class="fallacy-flag"><strong>⚠ ${escapeHtml(f.fallacy_type)}</strong><p>${escapeHtml(f.explanation || "")}</p></div>`
      : `<p class="muted">No fallacy detected in your last check.</p>`;
  }
  return `<p class="muted">Ask me to analyze an argument or check for fallacies, and results will show up here.</p>`;
}

function prefillCoachInput(text) {
  const input = document.querySelector("#coachInput");
  if (!input) return;
  input.value = text;
  input.focus();
}

function clearCoachChat() {
  state.coachHistory = [];
  state.coachLastFallacy = null;
  state.coachLastScore = null;
  renderCoachPage(document.querySelector("#view"));
}

async function handleCoachSend(event) {
  event.preventDefault();
  const input = document.querySelector("#coachInput");
  const message = input.value.trim();
  if (!message || state.coachBusy) return;

  input.value = "";
  state.coachHistory.push({ role: "user", content: message });
  state.coachBusy = true;
  refreshCoachMessages();

  try {
    const payload = await api("/api/coach/chat", {
      method: "POST",
      body: JSON.stringify({ message, history: state.coachHistory.slice(0, -1) }),
    });
    state.coachHistory.push({ role: "assistant", content: payload.reply });
    state.coachLastFallacy = payload.fallacy || state.coachLastFallacy;
    state.coachLastScore = payload.score || state.coachLastScore;
  } catch (error) {
    state.coachHistory.push({ role: "assistant", content: `Sorry, something went wrong: ${error.message}` });
  } finally {
    state.coachBusy = false;
    refreshCoachMessages();
    const sidebar = document.querySelector(".coach-sidebar");
    if (sidebar) sidebar.querySelector(".panel").innerHTML = `<h3 class="compact-title" style="margin-top:0;">Feedback Overview</h3>${coachFeedbackPanelHtml()}`;
  }
}

function refreshCoachMessages() {
  const container = document.querySelector("#coachMessages");
  if (!container) return;
  container.innerHTML = coachMessagesHtml();
  container.scrollTop = container.scrollHeight;
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

function radarChartSvg(skills, size = 280) {
  // skills: array of {skill_name, score} -- expects exactly 5 for a clean pentagon
  const center = size / 2;
  const maxRadius = size * 0.38;
  const angleStep = (Math.PI * 2) / skills.length;
  const startAngle = -Math.PI / 2;

  const pointFor = (i, radiusRatio) => {
    const angle = startAngle + i * angleStep;
    const r = maxRadius * radiusRatio;
    return [center + r * Math.cos(angle), center + r * Math.sin(angle)];
  };

  // Grid rings at 25/50/75/100%
  const rings = [0.25, 0.5, 0.75, 1].map((ratio) => {
    const points = skills.map((_, i) => pointFor(i, ratio).join(",")).join(" ");
    return `<polygon points="${points}" fill="none" stroke="#e5e7eb" stroke-width="1" />`;
  }).join("");

  // Axis lines from center to each vertex
  const axes = skills.map((_, i) => {
    const [x, y] = pointFor(i, 1);
    return `<line x1="${center}" y1="${center}" x2="${x}" y2="${y}" stroke="#e5e7eb" stroke-width="1" />`;
  }).join("");

  // Data polygon
  const dataPoints = skills.map((s, i) => pointFor(i, Math.max(0, Math.min(1, s.score / 100)))).map((p) => p.join(",")).join(" ");

  // Labels
  const labels = skills.map((s, i) => {
    const [x, y] = pointFor(i, 1.22);
    return `<text x="${x}" y="${y}" font-size="11" fill="#374151" text-anchor="middle" dominant-baseline="middle">${escapeHtml(s.skill_name)}</text>`;
  }).join("");

  return `
    <svg viewBox="0 0 ${size} ${size}" width="100%" height="${size}" style="max-width:${size}px;display:block;margin:0 auto;">
      ${rings}
      ${axes}
      <polygon points="${dataPoints}" fill="rgba(15,118,110,0.25)" stroke="#0f766e" stroke-width="2" />
      ${labels}
    </svg>
  `;
}

function renderNotifications(view, data) {
  const notifications = data.notifications || [];
  updateNotifBadge(0); // viewing the page marks the badge visually clear; actual read-state handled per-row

  view.innerHTML = html`
    <div class="dash-header">
      <span class="dash-header-role">${escapeHtml(state.user.roleLabel)}</span>
      <h1>Notifications</h1>
      <p>Reminders, feedback alerts, and updates.</p>
    </div>
    <section class="panel">
      <div style="display:flex;justify-content:flex-end;margin-bottom:10px;">
        <button class="ghost" onclick="markAllNotifsRead()">Mark all read</button>
      </div>
      ${
        notifications.length
          ? html`<div class="notif-list">
              ${notifications.map((n) => html`
                <div class="notif-row ${n.is_read ? "" : "unread"}" onclick="handleNotifClick(${n.id}, ${n.related_session_id || "null"})">
                  <div class="notif-row-title">${escapeHtml(n.title)}</div>
                  <div class="notif-row-body">${escapeHtml(n.body)}</div>
                  <div class="notif-row-time">${escapeHtml(n.created_at)}</div>
                </div>
              `).join("")}
            </div>`
          : `<div class="empty">No notifications yet.</div>`
      }
    </section>
  `;
}

async function markAllNotifsRead() {
  try {
    await api("/api/notifications/read-all", { method: "PUT" });
    await loadView();
  } catch (error) {
    alert(error.message);
  }
}

async function handleNotifClick(id, sessionId) {
  try {
    await api(`/api/notifications/${id}/read`, { method: "PUT" });
  } catch (e) {}
  if (sessionId) openDebateRoom(sessionId);
  else loadView();
}

function renderToolPage(view, key) {
  const cfg = toolConfig[key];
  view.innerHTML = html`
    <div class="dash-header">
      <span class="dash-header-role">${escapeHtml(state.user.roleLabel)}</span>
      <h1>${cfg.title}</h1>
      <p>Standalone tool — analyze any text without starting a full debate session.</p>
    </div>
    <section class="panel">
      <form id="toolForm">
        <div class="field">
          <textarea id="toolInput" rows="4" placeholder="${cfg.placeholder}" required></textarea>
        </div>
        <button class="primary" type="submit">Analyze</button>
      </form>
      <div id="toolResult" style="margin-top:14px;"></div>
    </section>
  `;

  document.querySelector("#toolForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const text = document.querySelector("#toolInput").value.trim();
    const resultEl = document.querySelector("#toolResult");
    if (!text) return;
    resultEl.innerHTML = `<div class="empty">Analyzing...</div>`;
    try {
      const result = await api(cfg.endpoint, { method: "POST", body: JSON.stringify({ text }) });
      resultEl.innerHTML = toolResultHtml(key, result);
    } catch (error) {
      resultEl.innerHTML = `<div class="message error">${escapeHtml(error.message)}</div>`;
    }
  });
}





async function refreshNotifBadge() {
  try {
    const data = await api("/api/notifications");
    updateNotifBadge(data.unreadCount);
  } catch (e) {}
}



function updateNotifBadge(count) {
  const badge = document.querySelector("#notifBadge");
  if (!badge) return;
  if (count > 0) {
    badge.textContent = count > 9 ? "9+" : count;
    badge.style.display = "inline-block";
  } else {
    badge.style.display = "none";
  }
}

function toolResultHtml(key, result) {
  if (key === "toolAnalyze") {
    return html`
      <div class="summary-block"><h4>Overall Score</h4><p>${result.overall_score}/100</p></div>
      <div class="summary-block"><h4>Main Claim</h4><p>${escapeHtml(result.main_claim)}</p></div>
      <div class="summary-block"><h4>Feedback</h4><p>${escapeHtml(result.feedback || "")}</p></div>
    `;
  }
  if (key === "toolFallacy") {
    return result.fallacy_detected
      ? `<div class="fallacy-flag"><strong>⚠ ${escapeHtml(result.fallacy_type)}</strong><p>${escapeHtml(result.explanation || "")}</p><p class="muted">Try instead: ${escapeHtml(result.correction_suggestion || "")}</p></div>`
      : `<div class="message ok">No logical fallacy detected.</div>`;
  }
  if (key === "toolCounter") {
    return html`
      <div class="rebuttal-tag rebuttal-tag-${(result.rebuttal_type || "").toLowerCase().replace(/[^a-z]/g,"-")}">${escapeHtml(result.rebuttal_type)} Rebuttal</div>
      <div class="summary-block" style="margin-top:8px;"><h4>Counterargument</h4><p>${escapeHtml(result.rebuttal_text)}</p></div>
      <div class="challenge-flag"><strong>Challenge:</strong> ${escapeHtml(result.challenge_question)}</div>
    `;
  }
  return "";
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
window.markTaskComplete = markTaskComplete;
window.browseCoaches = browseCoaches;
window.chooseCoach = chooseCoach;
window.togglePresentationRecording = togglePresentationRecording;
window.handleNotifClick = handleNotifClick;
window.markAllNotifsRead = markAllNotifsRead;


render();

