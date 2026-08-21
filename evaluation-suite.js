/* ==========================================================================
   AI DEBATE COACH - COACH EVALUATION SUITE v3.0
   Pending Reviews · Evaluated Reviews · Learner Directory · Real-time sync
   ========================================================================== */

(function () {
  'use strict';

  window.EvaluationSuiteModule = {
    activeTab: 'pending',

    render() {
      const allAsgs     = window.AIDebateDB.getAssignments();
      const pendingAsgs = allAsgs.filter(a => a.status === 'Submitted' || a.status === 'Pending Review');
      const evaluatedAsgs = allAsgs.filter(a => a.status === 'Evaluated' || a.status === 'Completed');
      const allLearners = window.AIDebateDB.getUsers().filter(u => u.role === 'learner');

      const tabStyle = (id) =>
        `class="auth-tab${this.activeTab === id ? ' active' : ''}" id="eval-tab-${id}"`;

      return `
        <div class="dash-header">
          <div>
            <h1>Debate Evaluation &amp; Review Suite</h1>
            <p style="color:var(--text-muted);font-size:0.95rem;">
              Grade student speeches across 10 rubrics · Sync feedback to learner portals in real time.
            </p>
          </div>
          <div style="display:flex;gap:12px;">
            <button id="btn-save-draft-eval"  class="btn-secondary">💾 Save Draft</button>
            <button id="btn-submit-eval"      class="gradient-btn">🚀 Submit Evaluation</button>
          </div>
        </div>

        <!-- PENDING REVIEWS -->
        <div id="eval-panel-pending" style="display:block">
          <div class="glass-panel" style="padding:24px;margin-bottom:32px;">
            <h2 style="font-size:1.2rem;font-weight:800;margin-bottom:16px;">
              Pending Submission Queue — Awaiting Coach Review
            </h2>
            <div class="table-wrapper">
              <table class="data-table" id="pending-submissions-table">
                <thead>
                  <tr>
                    <th>Learner Name</th>
                    <th>Assignment Title</th>
                    <th>Debate Topic</th>
                    <th>Submitted Date</th>
                    <th>Duration</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  ${pendingAsgs.length === 0 ? `
                    <tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:30px;">
                      No pending submissions. All caught up! 🎉
                    </td></tr>
                  ` : pendingAsgs.map(a => {
                    const learnerNames = (a.learnerIds || [])
                      .map(lid => { const u = window.AIDebateDB.getUserById(lid); return u ? u.name : lid; })
                      .join(', ');
                    return `
                      <tr>
                        <td><strong>${learnerNames}</strong></td>
                        <td>${a.title}</td>
                        <td style="color:var(--text-muted);font-size:0.82rem;">${a.topic}</td>
                        <td style="color:var(--text-dim);font-size:0.82rem;">${a.submittedAt || a.createdAt}</td>
                        <td style="font-family:monospace;">${a.duration}</td>
                        <td>
                          <span class="badge-severity" style="background:rgba(245,158,11,0.2);color:var(--amber);">
                            ${a.status}
                          </span>
                        </td>
                        <td>
                          <button class="gradient-btn" style="padding:4px 10px;font-size:0.78rem;"
                            onclick="EvaluationSuiteModule.openEvaluationModal('${a.id}')">
                            📝 Evaluate
                          </button>
                        </td>
                      </tr>
                    `;
                  }).join('')}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      `;
    },

    _slider(label, key, val) {
      return `
        <div class="glass-card" style="padding:12px 16px;">
          <div style="display:flex;justify-content:space-between;font-size:0.85rem;font-weight:600;margin-bottom:6px;">
            <span>${label}</span>
            <span id="eval-val-${key}" style="color:var(--cyan);">${val}</span>
          </div>
          <input type="range" class="eval-range-slider" data-key="${key}"
            min="50" max="100" value="${val}"
            style="width:100%;accent-color:var(--cyan);cursor:pointer;" />
        </div>`;
    },

    _learnerCard(learner) {
      const history = window.AIDebateDB.getPracticeHistory(learner.id);
      const asgs    = window.AIDebateDB.getAssignmentsForLearner(learner.id);
      const avgScore = history.length
        ? Math.round(history.reduce((s, h) => s + (h.score || 0), 0) / history.length)
        : learner.metrics?.overall || 0;

      return `
        <div class="glass-card" style="padding:18px;cursor:pointer;"
             onclick="EvaluationSuiteModule.openLearnerProfile('${learner.id}')">
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:12px;">
            <div style="width:42px;height:42px;border-radius:50%;background:var(--grad-primary);
                        display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1.1rem;">
              ${learner.name.charAt(0)}
            </div>
            <div>
              <div style="font-weight:700;font-size:0.95rem;">${learner.name}</div>
              <div style="font-size:0.8rem;color:var(--text-muted);">${learner.email}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;text-align:center;font-size:0.82rem;">
            <div>
              <div style="font-weight:800;color:var(--cyan);font-size:1.1rem;">${history.length}</div>
              <div style="color:var(--text-muted);">Debates</div>
            </div>
            <div>
              <div style="font-weight:800;color:var(--emerald);font-size:1.1rem;">${avgScore}%</div>
              <div style="color:var(--text-muted);">Avg Score</div>
            </div>
            <div>
              <div style="font-weight:800;color:var(--purple);font-size:1.1rem;">${asgs.length}</div>
              <div style="color:var(--text-muted);">Tasks</div>
            </div>
          </div>
          <div style="margin-top:10px;font-size:0.78rem;color:var(--text-dim);text-align:right;">
            ${learner.institution || 'Institution N/A'} · ${learner.status || 'Active'}
          </div>
        </div>`;
    },

    bindEvents() {
      /* Tab switching */
      ['pending','evaluated','learners'].forEach(tab => {
        document.getElementById(`eval-tab-${tab}`)?.addEventListener('click', () => {
          this.activeTab = tab;
          this._reRender();
        });
      });

      /* Rubric sliders */
      const sliders = document.querySelectorAll('.eval-range-slider');
      const scoreTotalEl = document.getElementById('eval-score-total');
      const updateAvg = () => {
        let sum = 0;
        sliders.forEach(s => sum += parseInt(s.value, 10));
        const avg = Math.round(sum / sliders.length);
        if (scoreTotalEl) scoreTotalEl.textContent = avg + ' / 100';
        sliders.forEach(s => {
          const el = document.getElementById('eval-val-' + s.getAttribute('data-key'));
          if (el) el.textContent = s.value;
        });
      };
      sliders.forEach(s => s.addEventListener('input', updateAvg));
      updateAvg();

      /* Submit evaluation */
      document.getElementById('btn-submit-eval')?.addEventListener('click', () => {
        const asgId = document.getElementById('current-eval-asg-id')?.value;
        const notes = document.getElementById('eval-coach-notes')?.value || '';
        const score = scoreTotalEl ? parseInt(scoreTotalEl.textContent) : 85;

        if (!asgId) {
          if (window.showToast) window.showToast('Select a submission from the queue first.', 'warning');
          return;
        }

        const asg = window.AIDebateDB.getAssignments().find(a => a.id === asgId);
        const evaluatedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);

        window.AIDebateDB.updateAssignmentStatus(asgId, 'Evaluated', {
          score, coachNotes: notes, evaluatedAt
        });

        /* Push feedback to each assigned learner's feedback collection */
        if (asg && asg.learnerIds) {
          asg.learnerIds.forEach(lid => {
            const learner = window.AIDebateDB.getUserById(lid);
            if (learner) {
              window.AIDebateDB.addFeedback({
                learnerId   : lid,
                learnerName : learner.name,
                learnerEmail: learner.email,
                rating      : Math.round(score / 20), // 5-star
                message     : notes || 'Evaluation completed by coach.',
                debateTopic : asg.topic,
                reviewerName: window.AIDebateAuth.currentUser?.name || 'Debate Coach',
                reviewerRole: 'coach',
                evaluationDate: evaluatedAt
              });
            }
          });
        }

        if (window.showToast) window.showToast('✅ Evaluation submitted! Learner feedback updated.', 'success');
        document.getElementById('current-eval-asg-id').value = '';
        document.getElementById('eval-coach-notes').value = '';
        this.activeTab = 'evaluated';
        this._reRender();
      });

      /* Learner directory search */
      const searchInput = document.getElementById('learner-dir-search');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const q = e.target.value.toLowerCase();
          document.querySelectorAll('#learner-cards-grid > div').forEach(card => {
            card.style.display = card.innerText.toLowerCase().includes(q) ? '' : 'none';
          });
        });
      }
    },

    openEvaluationModal(asgId) {
      const asg = window.AIDebateDB.getAssignments().find(a => a.id === asgId);
      if (!asg) return;

      const learnerNames = (asg.learnerIds || [])
        .map(lid => { const u = window.AIDebateDB.getUserById(lid); return u ? u.name : lid; })
        .join(', ');

      // Mark as under review
      window.AIDebateDB.updateAssignmentStatus(asgId, 'Pending Review');

      // Set hidden field
      const hiddenField = document.getElementById('current-eval-asg-id');
      if (hiddenField) hiddenField.value = asgId;

      // Pre-fill coach notes
      const notesEl = document.getElementById('eval-coach-notes');
      if (notesEl) notesEl.value = asg.coachNotes || '';

      if (window.showToast) window.showToast(`Evaluating: ${learnerNames} — "${asg.title}"`, 'info');

      // Show rubric panel
      const rubric = document.getElementById('rubric-matrix');
      if (rubric) rubric.scrollIntoView({ behavior: 'smooth', block: 'center' });
    },

    openEditFeedbackModal(asgId) {
      const asg = window.AIDebateDB.getAssignments().find(a => a.id === asgId);
      if (!asg) return;

      const modal = document.createElement('div');
      modal.className = 'auth-overlay';
      modal.id = 'edit-feedback-modal';
      modal.innerHTML = `
        <div class="auth-modal" style="max-width:500px;">
          <button id="close-edit-fb-modal"
            style="position:absolute;top:16px;right:16px;background:none;border:none;
                   color:var(--text-muted);cursor:pointer;font-size:1.2rem;">✕</button>
          <h2 style="font-size:1.2rem;font-weight:800;margin-bottom:16px;">
            ✏️ Edit Coach Feedback
          </h2>
          <div style="font-size:0.85rem;color:var(--text-muted);margin-bottom:12px;">
            ${asg.title} — Current Score: <strong style="color:var(--cyan);">${asg.score || 'N/A'}</strong>
          </div>
          <div class="form-group">
            <label>Updated Score (50–100)</label>
            <input type="number" id="edit-fb-score" class="form-input"
              min="50" max="100" value="${asg.score || 80}" />
          </div>
          <div class="form-group">
            <label>Updated Coach Notes</label>
            <textarea id="edit-fb-notes" class="form-input"
              style="height:100px;resize:vertical;">${asg.coachNotes || ''}</textarea>
          </div>
          <button id="save-edit-fb-btn" class="gradient-btn"
            style="width:100%;justify-content:center;margin-top:8px;">
            💾 Save &amp; Sync to Learner Portal
          </button>
        </div>`;

      document.body.appendChild(modal);

      document.getElementById('close-edit-fb-modal').addEventListener('click', () => modal.remove());

      document.getElementById('save-edit-fb-btn').addEventListener('click', () => {
        const newScore = parseInt(document.getElementById('edit-fb-score').value, 10);
        const newNotes = document.getElementById('edit-fb-notes').value;

        window.AIDebateDB.updateAssignmentStatus(asgId, 'Evaluated', {
          score: newScore, coachNotes: newNotes,
          evaluatedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
        });

        // Sync updated feedback to learner
        if (asg.learnerIds) {
          asg.learnerIds.forEach(lid => {
            const learner = window.AIDebateDB.getUserById(lid);
            if (learner) {
              window.AIDebateDB.addFeedback({
                learnerId: lid, learnerName: learner.name, learnerEmail: learner.email,
                rating: Math.round(newScore / 20), message: newNotes || 'Feedback updated by coach.',
                debateTopic: asg.topic,
                reviewerName: window.AIDebateAuth.currentUser?.name || 'Debate Coach',
                reviewerRole: 'coach',
                evaluationDate: new Date().toISOString().replace('T', ' ').substring(0, 16)
              });
            }
          });
        }

        if (window.showToast) window.showToast('Feedback updated and synced to Learner Portal!', 'success');
        modal.remove();
        this._reRender();
      });
    },

    openLearnerProfile(learnerId) {
      const learner = window.AIDebateDB.getUserById(learnerId);
      if (!learner) return;

      const history = window.AIDebateDB.getPracticeHistory(learnerId);
      const asgs    = window.AIDebateDB.getAssignmentsForLearner(learnerId);
      const avgScore = history.length
        ? Math.round(history.reduce((s, h) => s + (h.score || 0), 0) / history.length) : 0;
      const best  = history.length ? Math.max(...history.map(h => h.score || 0)) : 0;
      const worst = history.length ? Math.min(...history.map(h => h.score || 0)) : 0;

      const modal = document.createElement('div');
      modal.className = 'auth-overlay';
      modal.id = 'learner-profile-modal';
      modal.style.alignItems = 'flex-start';
      modal.style.paddingTop = '40px';
      modal.innerHTML = `
        <div class="auth-modal" style="max-width:640px;max-height:80vh;overflow-y:auto;">
          <button id="close-learner-profile"
            style="position:absolute;top:16px;right:16px;background:none;border:none;
                   color:var(--text-muted);cursor:pointer;font-size:1.2rem;">✕</button>
          <h2 style="font-size:1.2rem;font-weight:800;margin-bottom:4px;">${learner.name}</h2>
          <div style="font-size:0.82rem;color:var(--text-muted);margin-bottom:16px;">
            ${learner.email} · ${learner.institution || 'N/A'} · ${learner.role.toUpperCase()}
          </div>
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
            ${this._statBadge('Debates', history.length, 'var(--cyan)')}
            ${this._statBadge('Avg Score', avgScore + '%', 'var(--emerald)')}
            ${this._statBadge('Best', best + '%', 'var(--purple)')}
            ${this._statBadge('Tasks', asgs.length, 'var(--amber)')}
          </div>
          <h3 style="font-size:1rem;font-weight:700;margin-bottom:10px;">📜 Recent Debate History</h3>
          <div style="display:flex;flex-direction:column;gap:8px;max-height:300px;overflow-y:auto;">
            ${history.slice(0, 10).map(h => `
              <div style="padding:10px;background:rgba(0,0,0,0.3);border-radius:8px;font-size:0.85rem;">
                <div style="font-weight:700;">${h.topic}</div>
                <div style="color:var(--text-muted);font-size:0.78rem;">${h.date} · ${h.duration}</div>
                <div style="color:var(--cyan);font-weight:800;">${h.score || 0} / 100</div>
                ${h.transcript ? `<div style="color:var(--text-dim);font-size:0.78rem;margin-top:4px;">"${h.transcript.substring(0,80)}…"</div>` : ''}
              </div>`).join('') || '<div style="color:var(--text-muted);">No practice history yet.</div>'}
          </div>
        </div>`;

      document.body.appendChild(modal);
      document.getElementById('close-learner-profile').addEventListener('click', () => modal.remove());
    },

    _statBadge(label, val, color) {
      return `
        <div style="text-align:center;background:rgba(0,0,0,0.2);padding:10px;border-radius:8px;">
          <div style="font-size:1.2rem;font-weight:800;color:${color};">${val}</div>
          <div style="font-size:0.75rem;color:var(--text-muted);">${label}</div>
        </div>`;
    },

    _reRender() {
      const main = document.getElementById('app-main');
      if (main) {
        main.innerHTML = `<div class="dashboard-container">${window.renderSidebar()}<div class="dashboard-main">${this.render()}</div></div>`;
        this.bindEvents();
        if (window.bindSidebarEvents) window.bindSidebarEvents();
      }
    }
  };

})();
