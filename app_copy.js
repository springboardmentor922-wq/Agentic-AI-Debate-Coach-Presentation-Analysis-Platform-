/* ==========================================================================
   AI DEBATE COACH - MAIN APPLICATION CONTROLLER & RBAC ROUTER (app.js)
   ========================================================================== */

(function () {
  window.AIDebateState = {
    currentView: 'landing', // 'landing' | 'dashboard' | 'practice' | 'assignments' | 'history' | 'feedback' | 'reports' | 'users' | 'topics' | 'profile' | 'learner-directory' | 'evaluated-vault' | 'coach-feedback'
    theme: 'dark'
  };

  // Global Toast Notification Helper
  window.showToast = function (message, type = 'info') {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    const icon = type === 'success' ? '✅' : type === 'warning' ? '⚠️' : 'ℹ️';
    toast.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  function handleLocationRouting() {
    const user = window.AIDebateAuth.currentUser;
    if (!user) {
      window.AIDebateState.currentView = 'landing';
      window.location.hash = '';
      return;
    }
    let hash = window.location.hash || '';
    if (hash.startsWith('#/')) hash = hash.substring(2);
    else if (hash.startsWith('#')) hash = hash.substring(1);
    
    const path = hash || '';
    
    const reverseMapping = {
      'learner/dashboard': 'dashboard',
      'learner/practice': 'practice',
      'learner/history': 'history',
      'learner/feedback': 'feedback',
      'learner/coach-feedback': 'coach-feedback',
      'learner/improvement-trends': 'improvement-trends',
      'learner/recommended-exercises': 'recommended-exercises',
      'coach/dashboard': 'dashboard',
      'coach/evaluation-queue': 'dashboard',
      'coach/learner-directory': 'learner-directory',
      'coach/evaluated-vault': 'evaluated-vault',
      'coach/skill-gap-analysis': 'skill-gap-analysis',
      'educator/dashboard': 'dashboard',
      'educator/feedback': 'feedback',
      'educator/class-analytics': 'class-analytics',
      'educator/student-ranking': 'student-ranking',
      'educator/debate-report': 'debate-report',
      'admin/dashboard': 'dashboard',
      'admin/topics': 'topics',
      'admin/ai-monitoring': 'ai-monitoring',
      'admin/system-reports': 'system-reports'
    };

    if (reverseMapping[path]) {
      window.AIDebateState.currentView = reverseMapping[path];
    } else if (path.startsWith('coach/learner/')) {
      const id = path.split('/').pop();
      window.AIDebateState.currentView = 'learner-directory';
      setTimeout(() => {
        if (window.LearnerDirectoryModule && window.LearnerDirectoryModule._openLearnerProfile) {
          window.LearnerDirectoryModule._openLearnerProfile(id, document.getElementById('main-content-area'));
        }
      }, 200);
    } else if (path.startsWith('coach/evaluation/')) {
      const id = path.split('/').pop();
      window.AIDebateState.currentView = 'evaluated-vault';
      setTimeout(() => {
        if (window.EvaluatedVaultModule && window.EvaluatedVaultModule._openEvaluationModal) {
          const evs = window.AIDebateDB.getCoachEvaluations();
          const ev = evs.find(e => e.id === id);
          const asg = window.AIDebateDB.getAssignments().find(a => a.id === id);
          const learnerId = ev ? ev.learnerId : (asg ? (asg.learnerIds||[])[0] : '');
          window.EvaluatedVaultModule._openEvaluationModal(asg?.id || '', ev?.id || '', learnerId);
        }
      }, 200);
    } else if (path) {
      window.AIDebateState.currentView = path.split('/').pop();
    }
  }

  function syncHashWithView(viewName) {
    const user = window.AIDebateAuth.currentUser;
    if (!user) {
      window.location.hash = '';
      return;
    }
    const role = (user.role || '').toLowerCase();
    let targetHash = `#/${role}/${viewName}`;
    
    if (viewName === 'dashboard' && role === 'coach') {
      targetHash = '#/coach/evaluation-queue';
    }
    
    // Use history.pushState to enable browser Back/Forward navigation
    if (window.location.hash !== targetHash) {
      history.pushState(null, '', targetHash);
    }
  }

  window.addEventListener('hashchange', () => {
    handleLocationRouting();
    renderHeader();
    renderMainView();
  });

  window.initAIDebateApp = function () {
    // Check active user session
    const user = window.AIDebateAuth.currentUser;
    if (user && window.AIDebateState.currentView === 'landing') {
      window.AIDebateState.currentView = 'dashboard';
    }

    handleLocationRouting();

    renderHeader();
    renderMainView();
    initParticlesCanvas();
    if (window.AIAssistantWidget) window.AIAssistantWidget.init();
  };

  // Header Renderer with Strict RBAC
  function renderHeader() {
    const header = document.getElementById('main-header');
    if (!header) return;

    const user = window.AIDebateAuth.currentUser;
    const view = window.AIDebateState.currentView;

    header.innerHTML = `
      <div class="logo-container" id="logo-trigger">
        <div class="logo-icon">🎙️</div>
        <span>AI Debate<span style="color: var(--cyan);">Coach</span></span>
      </div>

      <ul class="nav-links">
        ${!user ? `
          <li><a class="nav-link ${view === 'landing' ? 'active' : ''}" id="nav-landing">Home</a></li>
          <li><a class="nav-link" id="nav-features">Features</a></li>
          <li><a class="nav-link" id="nav-pricing">Pricing</a></li>
        ` : `
          <li><a class="nav-link ${view === 'dashboard' ? 'active' : ''}" id="nav-dashboard">My Dashboard</a></li>
          ${user.role === 'learner' ? `<li><a class="nav-link ${view === 'practice' ? 'active' : ''}" id="nav-practice">Practice Studio</a></li>` : ''}
          ${user.role === 'learner' ? `<li><a class="nav-link ${view === 'history' ? 'active' : ''}" id="nav-history">History</a></li>` : ''}
          ${user.role === 'educator' ? `<li><a class="nav-link ${view === 'assignments' ? 'active' : ''}" id="nav-asg">Assignments</a></li>` : ''}
          ${user.role === 'admin' ? `<li><a class="nav-link ${view === 'topics' ? 'active' : ''}" id="nav-topics">Topic Catalogue</a></li>` : ''}
        `}
      </ul>

      <div class="nav-actions">
        ${user ? `
          <div style="display: flex; align-items: center; gap: 10px; background: rgba(30,41,59,0.7); border: 1px solid var(--border-glass); border-radius: var(--radius-full); padding: 4px 14px;">
            <span style="font-size: 0.85rem; font-weight: 700; color: var(--text-main);">${user.name}</span>
            <span class="badge-severity" style="background: rgba(6,182,212,0.2); color: var(--cyan); text-transform: uppercase;">${user.role}</span>
          </div>

          <button class="icon-btn" id="theme-toggle-btn" title="Toggle Theme">
            ${window.AIDebateState.theme === 'dark' ? '🌙' : '☀️'}
          </button>

          <button class="btn-secondary" id="logout-btn" style="padding: 6px 14px; font-size: 0.85rem; border-color: var(--rose); color: var(--rose);">
            Sign Out
          </button>
        ` : `
          <button class="icon-btn" id="theme-toggle-btn" title="Toggle Theme">
            ${window.AIDebateState.theme === 'dark' ? '🌙' : '☀️'}
          </button>
          
          <button class="gradient-btn" id="auth-modal-btn">
            Sign In / Register
          </button>
        `}
      </div>
    `;

    bindHeaderEvents();
  }

  function bindHeaderEvents() {
    document.getElementById('logo-trigger')?.addEventListener('click', () => switchView(window.AIDebateAuth.currentUser ? 'dashboard' : 'landing'));
    document.getElementById('nav-landing')?.addEventListener('click', () => switchView('landing'));
    document.getElementById('nav-dashboard')?.addEventListener('click', () => switchView('dashboard'));
    document.getElementById('nav-practice')?.addEventListener('click', () => switchView('practice'));
    document.getElementById('nav-history')?.addEventListener('click', () => switchView('history'));
    document.getElementById('nav-asg')?.addEventListener('click', () => switchView('dashboard'));
    document.getElementById('nav-topics')?.addEventListener('click', () => switchView('dashboard'));

    document.getElementById('nav-features')?.addEventListener('click', () => {
      switchView('landing');
      setTimeout(() => document.getElementById('features-section-anchor')?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    document.getElementById('nav-pricing')?.addEventListener('click', () => {
      switchView('landing');
      setTimeout(() => document.getElementById('pricing-section-anchor')?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    document.getElementById('theme-toggle-btn')?.addEventListener('click', () => {
      const next = window.AIDebateState.theme === 'dark' ? 'light' : 'dark';
      window.AIDebateState.theme = next;
      document.documentElement.setAttribute('data-theme', next);
      renderHeader();
      window.showToast(`Theme changed to ${next.toUpperCase()} mode`, 'info');
    });

    document.getElementById('auth-modal-btn')?.addEventListener('click', () => openAuthModal('login'));

    document.getElementById('logout-btn')?.addEventListener('click', () => {
      window.AIDebateAuth.logout();
      window.location.hash = '';
      window.AIDebateState.currentView = 'landing';
      renderHeader();
      renderMainView();
      if (window.AIAssistantWidget) window.AIAssistantWidget.init();
      window.showToast('Signed out successfully.', 'info');
    });
  }

  function switchView(viewName) {
    if (window.AIDebateAuth.routeExists && !window.AIDebateAuth.routeExists(viewName)) {
      renderNotFoundView();
      return;
    }
    if (!window.AIDebateAuth.canAccessRoute(viewName)) {
      renderAccessDeniedView();
      return;
    }
    window.AIDebateState.currentView = viewName;
    syncHashWithView(viewName);
    renderHeader();
    renderMainView();
  }

  function renderNotFoundView() {
    const main = document.getElementById('app-main');
    if (!main) return;
    main.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center; padding: 24px;">
        <div style="font-size: 4rem; margin-bottom: 16px; color: var(--rose);">404</div>
        <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--rose);">Page Not Found</h1>
        <p style="color: var(--text-muted); font-size: 1.05rem; max-width: 500px; margin: 12px 0 24px;">
          The route you are looking for does not exist in the AI DebateCoach platform.
        </p>
        <button class="gradient-btn" onclick="AIDebateState.currentView='dashboard'; window.initAIDebateApp();">
          Return to Dashboard
        </button>
      </div>
    `;
  }

  function renderAccessDeniedView() {
    const main = document.getElementById('app-main');
    if (!main) return;
    const user = window.AIDebateAuth.currentUser;

    main.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 70vh; text-align: center; padding: 24px;">
        <div style="font-size: 4rem; margin-bottom: 16px;">🚫</div>
        <h1 style="font-size: 2.2rem; font-weight: 800; color: var(--rose);">403 — Access Restricted</h1>
        <p style="color: var(--text-muted); font-size: 1.05rem; max-width: 500px; margin: 12px 0 24px;">
          Your account role (<strong style="color: var(--cyan); text-transform: uppercase;">${user ? user.role : 'GUEST'}</strong>) does not have authorization to view this portal.
        </p>
        <button class="gradient-btn" onclick="AIDebateState.currentView='dashboard'; window.initAIDebateApp();">
          Return to My ${user ? user.role.toUpperCase() : ''} Dashboard
        </button>
      </div>
    `;
  }

  function renderMainView() {
    const main = document.getElementById('app-main');
    if (!main) return;

    const user = window.AIDebateAuth.currentUser;
    const view = window.AIDebateState.currentView;

    if (!user || view === 'landing') {
      main.innerHTML = renderLandingPage();
      bindLandingEvents();
      return;
    }

    if (window.AIDebateAuth.routeExists && !window.AIDebateAuth.routeExists(view)) {
      renderNotFoundView();
      return;
    }

    // Role-based Layout Dispatcher
    const role = (user.role || '').toLowerCase();

    if (!window.AIDebateAuth.canAccessRoute(view)) {
      renderAccessDeniedView();
      return;
    }

    if (view === 'practice' && role === 'learner') {
      main.innerHTML = `<div class="dashboard-container">${renderSidebar()}<div class="dashboard-main">${window.PracticeStudioModule.render()}</div></div>`;
      window.PracticeStudioModule.bindEvents();
      bindSidebarEvents();
      return;
    }

    if (view === 'history' && role === 'learner') {
      main.innerHTML = `<div class="dashboard-container">${renderSidebar()}<div class="dashboard-main">${window.HistoryModule.render()}</div></div>`;
      window.HistoryModule.bindEvents();
      bindSidebarEvents();
      return;
    }

    if (view === 'feedback' && (role === 'learner' || role === 'educator')) {
      const content = role === 'learner' ? window.FeedbackModule.renderLearnerFeedback() : window.FeedbackModule.renderEducatorFeedbackDashboard();
      main.innerHTML = `<div class="dashboard-container">${renderSidebar()}<div class="dashboard-main">${content}</div></div>`;
      if (role === 'learner') window.FeedbackModule.bindLearnerFeedbackEvents();
      else window.FeedbackModule.bindEducatorFeedbackEvents();
      bindSidebarEvents();
      return;
    }

    // ── Coach: Learner Directory ─────────────────────────────
    if (view === 'learner-directory' && role === 'coach') {
      const html = window.LearnerDirectoryModule.render();
      main.innerHTML = `<div class="dashboard-container">${renderSidebar()}<div class="dashboard-main" id="main-content-area">${html}</div></div>`;
      window.LearnerDirectoryModule.bindEvents(document.getElementById('main-content-area'));
      bindSidebarEvents();
      return;
    }

    // ── Coach: Evaluated Vault ───────────────────────────────
    if (view === 'evaluated-vault' && role === 'coach') {
      const html = window.EvaluatedVaultModule.render();
      main.innerHTML = `<div class="dashboard-container">${renderSidebar()}<div class="dashboard-main" id="main-content-area">${html}</div></div>`;
      window.EvaluatedVaultModule.bindEvents(document.getElementById('main-content-area'));
      bindSidebarEvents();
      return;
    }

    // ── Learner: Coach Feedback ──────────────────────────────
    if (view === 'coach-feedback' && role === 'learner') {
      const html = window.CoachFeedbackLearnerModule.render();
      main.innerHTML = `<div class="dashboard-container">${renderSidebar()}<div class="dashboard-main" id="main-content-area">${html}</div></div>`;
      bindSidebarEvents();
      return;
    }

    // ── New Extension Views ──────────────────────────────────
    const extensionViews = ['improvement-trends', 'recommended-exercises', 'skill-gap-analysis', 'class-analytics', 'student-ranking', 'debate-report', 'ai-monitoring', 'system-reports'];
    if (extensionViews.includes(view) && window.ExtensionsModule) {
      const html = window.ExtensionsModule.render(view, role);
      main.innerHTML = `<div class="dashboard-container">${renderSidebar()}<div class="dashboard-main" id="main-content-area">${html}</div></div>`;
      window.ExtensionsModule.bindEvents(view, document.getElementById('main-content-area'));
      bindSidebarEvents();
      return;
    }

    // Default Dashboard Views per Role
    if (role === 'learner') {
      main.innerHTML = `<div class="dashboard-container">${renderSidebar()}<div class="dashboard-main">${renderLearnerDashboard()}</div></div>`;
      bindLearnerEvents();
    } else if (role === 'coach') {
      main.innerHTML = `<div class="dashboard-container">${renderSidebar()}<div class="dashboard-main">${window.EvaluationSuiteModule.render()}</div></div>`;
      window.EvaluationSuiteModule.bindEvents();
    } else if (role === 'educator') {
      main.innerHTML = `<div class="dashboard-container">${renderSidebar()}<div class="dashboard-main">${window.EducatorModule.render()}</div></div>`;
      window.EducatorModule.bindEvents();
    } else if (role === 'admin') {
      main.innerHTML = `<div class="dashboard-container">${renderSidebar()}<div class="dashboard-main">${window.AdminModule.render()}</div></div>`;
      window.AdminModule.bindEvents();
    }

    bindSidebarEvents();
  }

  // Sidebar Generator based on role permissions
  window.renderSidebar = function () {
    const user = window.AIDebateAuth.currentUser;
    if (!user) return '';

    const role = (user.role || '').toLowerCase();
    const view = window.AIDebateState.currentView;

    let items = [];
    if (role === 'learner') {
      items = [
        { id: 'dashboard',     icon: '📊', label: 'Learner Dashboard' },
        { id: 'practice',      icon: '🎙️', label: 'Practice Studio' },
        { id: 'history',       icon: '📜', label: 'Debate History' },
        { id: 'coach-feedback',icon: '📝', label: 'Coach Feedback' },
        { id: 'improvement-trends', icon: '📈', label: 'Improvement Trends' },
        { id: 'recommended-exercises', icon: '🎯', label: 'Recommended Exercises' },
        { id: 'feedback',      icon: '💬', label: 'Submit Feedback' }
      ];
    } else if (role === 'coach') {
      items = [
        { id: 'dashboard',        icon: '📋', label: 'Evaluation Queue' },
        { id: 'learner-directory',icon: '👨‍🎓', label: 'Learner Directory' },
        { id: 'evaluated-vault',  icon: '📁', label: 'Evaluated Vault' },
        { id: 'skill-gap-analysis', icon: '🔍', label: 'Skill Gap Analysis' }
      ];
    } else if (role === 'educator') {
      items = [
        { id: 'dashboard', icon: '🏫', label: 'Assignment Manager' },
        { id: 'feedback', icon: '💬', label: 'Feedback Dashboard' },
        { id: 'class-analytics', icon: '📈', label: 'Class Analytics' },
        { id: 'student-ranking', icon: '🏆', label: 'Student Ranking' },
        { id: 'debate-report', icon: '📄', label: 'Debate Report' }
      ];
    } else if (role === 'admin') {
      items = [
        { id: 'dashboard', icon: '⚡', label: 'Admin Console' },
        { id: 'ai-monitoring', icon: '🤖', label: 'AI Monitoring' },
        { id: 'system-reports', icon: '📊', label: 'System Reports' }
      ];
    }

    return `
      <div class="sidebar">
        <div class="sidebar-title">${role.toUpperCase()} PORTAL</div>
        ${items.map(item => `
          <a class="sidebar-item ${view === item.id || (view === 'dashboard' && item.id === 'dashboard') ? 'active' : ''}" data-side-id="${item.id}">
            <span>${item.icon}</span>
            <span>${item.label}</span>
          </a>
        `).join('')}
      </div>
    `;
  };

  window.bindSidebarEvents = function () {
    document.querySelectorAll('.sidebar-item[data-side-id]').forEach(item => {
      item.addEventListener('click', (e) => {
        const id = e.currentTarget.getAttribute('data-side-id');
        switchView(id);
      });
    });
  };

  // Learner Dashboard View Renderer
  function renderLearnerDashboard() {
    const user = window.AIDebateAuth.currentUser;
    const db = window.AIDebateDB;
    const myAsgs = db.getAssignmentsForLearner(user.id);
    const myHistory = db.getPracticeHistory(user.id);
    const myMetrics = user.metrics || { overall: 85, confidence: 90, fluency: 84, argumentStrength: 88, communication: 86, persuasiveness: 87, criticalThinking: 91, delivery: 83 };

    return `
      <div class="dash-header">
        <div>
          <h1>Welcome back, ${user.name} 👋</h1>
          <p style="color: var(--text-muted); font-size: 0.95rem;">${user.title || 'Varsity Debater'} • ${user.institution || 'Stanford Debate Union'} • Streak: <strong style="color: var(--amber);">🔥 ${user.streakDays || 7} Days</strong></p>
        </div>
        <button class="gradient-btn" id="btn-dash-practice">🎙️ Start Practice Debate</button>
      </div>

      <!-- Notifications Section -->
      ${(() => {
        const unread = db.getUnreadNotifications(user.id);
        if (!unread.length) return '';
        return `
        <div class="glass-panel" style="padding: 16px 20px; margin-bottom: 20px; border-left: 4px solid var(--cyan); background: rgba(6, 182, 212, 0.05);">
          <div style="font-weight: 800; font-size: 0.9rem; color: var(--cyan); display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span>🔔 Unread Notifications (${unread.length})</span>
            <button class="btn-secondary" style="padding: 2px 8px; font-size: 0.72rem;" onclick="window.AIDebateDB.markAllNotificationsRead('${user.id}'); window.initAIDebateApp();">Mark all read</button>
          </div>
          <div style="display: flex; flex-direction: column; gap: 8px;">
            ${unread.map(n => `
              <div style="font-size: 0.83rem; display: flex; align-items: center; justify-content: space-between; gap: 10px;">
                <span><strong>${n.title}:</strong> ${n.message}</span>
                <button class="gradient-btn" style="padding: 3px 10px; font-size: 0.75rem; flex-shrink:0;"
                  onclick="window.AIDebateDB.markNotificationRead('${n.id}'); window.AIDebateState.currentView='coach-feedback'; window.initAIDebateApp();">View Feedback</button>
              </div>
            `).join('')}
          </div>
        </div>`;
      })()}

      <!-- 8 Circular Progress Cards -->
      <div class="metrics-grid">
        ${renderMetricCard('Overall Score', myMetrics.overall, 'var(--cyan)')}
        ${renderMetricCard('Confidence', myMetrics.confidence, 'var(--purple)')}
        ${renderMetricCard('Fluency', myMetrics.fluency, 'var(--emerald)')}
        ${renderMetricCard('Arguments', myMetrics.argumentStrength, 'var(--blue)')}
        ${renderMetricCard('Communication', myMetrics.communication, 'var(--pink)')}
        ${renderMetricCard('Persuasiveness', myMetrics.persuasiveness, 'var(--amber)')}
        ${renderMetricCard('Critical Thinking', myMetrics.criticalThinking, 'var(--rose)')}
        ${renderMetricCard('Delivery Poise', myMetrics.delivery, 'var(--cyan)')}
      </div>

      <!-- Assigned Tasks Section -->
      <div class="glass-panel" style="padding: 24px; margin-bottom: 28px;">
        <h2 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 16px;">Assigned Educator Tasks (${myAsgs.length})</h2>
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr>
                <th>Assignment Title</th>
                <th>Topic</th>
                <th>Format</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              ${myAsgs.length === 0 ? `
                <tr><td colspan="6" style="text-align: center; color: var(--text-muted); padding: 24px;">No active assignments. Practice freely!</td></tr>
              ` : myAsgs.map(a => `
                <tr>
                  <td><strong>${a.title}</strong></td>
                  <td style="color: var(--text-muted);">${a.topic}</td>
                  <td>${a.debateType || 'LD'}</td>
                  <td>${a.dueDate}</td>
                  <td><span class="badge-severity" style="background: rgba(139,92,246,0.2); color: var(--purple);">${a.status}</span></td>
                  <td>
                    <button class="gradient-btn" style="padding: 4px 10px; font-size: 0.78rem;" onclick="AIDebateState.currentView='practice'; window.initAIDebateApp();">Start Task</button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  function renderMetricCard(label, val, color) {
    const offset = 180 - (180 * val) / 100;
    return `
      <div class="metric-card">
        <div class="circular-progress">
          <svg viewBox="0 0 64 64">
            <circle class="bg-circle" cx="32" cy="32" r="26"></circle>
            <circle class="fg-circle" cx="32" cy="32" r="26" style="stroke: ${color}; stroke-dashoffset: ${offset};"></circle>
          </svg>
          <div class="progress-text" style="color: ${color};">${val}%</div>
        </div>
        <span style="font-size: 0.8rem; font-weight: 600; color: var(--text-muted);">${label}</span>
      </div>
    `;
  }

  function bindLearnerEvents() {
    document.getElementById('btn-dash-practice')?.addEventListener('click', () => switchView('practice'));
  }

  // Landing Page HTML
  function renderLandingPage() {
    return `
      <section class="hero-section">
        <div class="hero-content">
          <div class="hero-badge">⚡ Commercial AI Speech & Rhetoric Engine</div>
          <h1 class="hero-title">Master the Art of Debate with <span class="gradient-text">Artificial Intelligence</span></h1>
          <p class="hero-subtitle">Practice live speeches, receive instant AI feedback, detect 9+ logical fallacies, and track public speaking progress with enterprise role-based portals.</p>
          <div class="hero-ctas">
            <button class="gradient-btn" onclick="openAuthModal('register')" style="padding: 14px 32px; font-size: 1rem;">Get Started Free</button>
            <button class="btn-secondary" onclick="openAuthModal('login')" style="padding: 14px 28px; font-size: 1rem;">⚡ Quick Role Demo Login</button>
          </div>
        </div>

        <div class="hero-mockup-wrapper">
          <div class="hero-mockup-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px;">
              <span style="font-weight: 700; font-size: 0.95rem; color: var(--text-cyan);">ENTERPRISE AI COACHING ENGINE</span>
              <span class="badge-severity" style="background: rgba(16,185,129,0.2); color: var(--emerald);">● Online</span>
            </div>
            <div class="mock-waveform">
              <div class="mock-bar"></div><div class="mock-bar"></div><div class="mock-bar"></div>
              <div class="mock-bar"></div><div class="mock-bar"></div><div class="mock-bar"></div>
              <div class="mock-bar"></div><div class="mock-bar"></div><div class="mock-bar"></div>
            </div>
            <div style="background: rgba(0,0,0,0.3); padding: 12px; border-radius: 8px; font-size: 0.85rem; color: var(--text-muted); margin-top: 14px;">
              "UBI provides an indispensable economic cushion against automation..."
              <div style="color: var(--cyan); margin-top: 4px; font-weight: bold;">✓ 92% Argument Logic Score</div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function bindLandingEvents() {}

  // Authentication Modal Handler
  window.openAuthModal = function () {
    let overlay = document.getElementById('auth-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'auth-modal-overlay';
      overlay.className = 'auth-overlay';
      overlay.innerHTML = `
        <div class="auth-modal">
          <button id="close-auth-modal" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem;">✕</button>
          <div class="auth-tabs">
            <button class="auth-tab active" id="tab-login">Sign In</button>
            <button class="auth-tab" id="tab-register">Register Account</button>
          </div>

          <!-- Demo Quick Preset Buttons -->
          <div style="background: rgba(30,41,59,0.5); padding: 10px; border-radius: 8px; margin-bottom: 16px; text-align: center;">
            <div style="font-size: 0.75rem; color: var(--text-muted); font-weight: bold; margin-bottom: 6px;">QUICK DEMO ACCESSIBILITY</div>
            <div style="display: flex; gap: 6px; justify-content: center; flex-wrap: wrap;">
              <button class="role-btn demo-login-btn" data-email="alex.chen@stanford.edu" data-pass="password123">Learner</button>
              <button class="role-btn demo-login-btn" data-email="elena@oxford.ac.uk" data-pass="password123">Educator</button>
              <button class="role-btn demo-login-btn" data-email="rthorne@harvard.edu" data-pass="password123">Coach</button>
              <button class="role-btn demo-login-btn" data-email="admin@aidebatecoach.com" data-pass="adminpassword123">Admin</button>
            </div>
          </div>

          <form id="auth-form" onsubmit="event.preventDefault(); window.handleAuthSubmit();">
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" id="auth-email" class="form-input" placeholder="alex.chen@stanford.edu" required />
            </div>

            <div class="form-group">
              <label>Password</label>
              <input type="password" id="auth-pass" class="form-input" placeholder="••••••••••••" required />
            </div>

            <div class="form-group" id="reg-name-group" style="display: none;">
              <label>Full Name</label>
              <input type="text" id="auth-name" class="form-input" placeholder="Alexandra Chen" />
            </div>

            <div class="form-group" id="reg-role-group" style="display: none;">
              <label>Select User Role Portal</label>
              <select class="form-select" id="auth-role">
                <option value="learner">Learner (Debater)</option>
                <option value="educator">Educator / Teacher</option>
                <option value="coach">Debate Coach</option>
                <option value="admin">System Administrator</option>
              </select>
            </div>

            <button type="submit" class="gradient-btn" style="width: 100%; justify-content: center; margin-top: 12px;">
              Continue to Portal
            </button>
          </form>
        </div>
      `;
      document.body.appendChild(overlay);

      document.getElementById('close-auth-modal').addEventListener('click', () => overlay.style.display = 'none');
      document.getElementById('tab-login').addEventListener('click', () => {
        document.getElementById('tab-login').classList.add('active');
        document.getElementById('tab-register').classList.remove('active');
        document.getElementById('reg-role-group').style.display = 'none';
        document.getElementById('reg-name-group').style.display = 'none';
      });
      document.getElementById('tab-register').addEventListener('click', () => {
        document.getElementById('tab-register').classList.add('active');
        document.getElementById('tab-login').classList.remove('active');
        document.getElementById('reg-role-group').style.display = 'flex';
        document.getElementById('reg-name-group').style.display = 'flex';
      });

      document.querySelectorAll('.demo-login-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const email = e.target.getAttribute('data-email');
          const pass = e.target.getAttribute('data-pass');
          document.getElementById('auth-email').value = email;
          document.getElementById('auth-pass').value = pass;
          window.handleAuthSubmit();
        });
      });
    }
    overlay.style.display = 'flex';
  };

  window.openDemoLoginModal = window.openAuthModal;

  window.handleAuthSubmit = function () {
    const email = document.getElementById('auth-email').value;
    const pass = document.getElementById('auth-pass').value;
    const isRegister = document.getElementById('tab-register').classList.contains('active');

    try {
      if (isRegister) {
        const name = document.getElementById('auth-name').value;
        const role = document.getElementById('auth-role').value;
        window.AIDebateAuth.register(name, email, pass, role);
      } else {
        window.AIDebateAuth.login(email, pass);
      }

      const overlay = document.getElementById('auth-modal-overlay');
      if (overlay) overlay.style.display = 'none';

      window.showToast(`Authenticated as ${window.AIDebateAuth.currentUser.name} (${window.AIDebateAuth.currentUser.role.toUpperCase()})`, 'success');
      window.AIDebateState.currentView = 'dashboard';
      window.initAIDebateApp();
    } catch (err) {
      if (window.showToast) window.showToast(err.message, 'warning');
    }
  };

  function initParticlesCanvas() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 2 + 1,
      dx: (Math.random() - 0.5) * 0.4,
      dy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.5 + 0.2
    }));

    function animate() {
      ctx.clearRect(0, 0, width, height);
      particles.forEach(p => {
        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0 || p.x > width) p.dx *= -1;
        if (p.y < 0 || p.y > height) p.dy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(6, 182, 212, ${p.alpha})`;
        ctx.fill();
      });
      requestAnimationFrame(animate);
    }
    animate();
  }

  document.addEventListener('DOMContentLoaded', () => {
    window.initAIDebateApp();
  });
})();
