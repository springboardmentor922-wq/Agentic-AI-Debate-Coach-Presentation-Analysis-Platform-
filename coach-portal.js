/* ==========================================================================
   AI DEBATE COACH — COACH PORTAL EXTENSION v2.0
   Learner Directory · Evaluated Vault · Coach Feedback Panel
   Real-time sync via localStorage + CustomEvent
   ========================================================================== */

/* ============================================================
 *  BADGE META
 * ============================================================ */
const BADGES = {
  top_performer:    { icon: '🏆', label: 'Top Performer',     color: 'var(--amber)' },
  excellent_speaker:{ icon: '🎙️', label: 'Excellent Speaker', color: 'var(--cyan)' },
  consistency:      { icon: '🔥', label: 'Consistency',       color: 'var(--rose)' },
  hundred_debates:  { icon: '💯', label: '100 Debates',       color: 'var(--violet)' },
  perfect_attendance:{ icon: '📅', label: 'Perfect Attendance', color: 'var(--emerald)' },
  most_improved:    { icon: '📈', label: 'Most Improved',     color: 'var(--cyan)' },
};

const ACTIVITY_ICONS = {
  practice_completed:       '🎙️',
  assignment_submitted:     '📄',
  coach_feedback_received:  '📝',
  login:                    '🔐',
};

/* ============================================================
 *  MINI CHART RENDERER (SVG sparklines — no lib deps)
 * ============================================================ */
function sparkline(data, w=120, h=40, color='var(--cyan)') {
  if (!data || !data.length) return '<svg style="opacity:.3" width="120" height="40"><text x="10" y="25" fill="rgba(255,255,255,.3)" font-size="11">No data</text></svg>';
  const max = Math.max(...data, 1), min = Math.min(...data, 0);
  const pts = data.map((v,i) => {
    const x = (i/(data.length-1||1))*w;
    const y = h - ((v-min)/(max-min||1)) * h;
    return `${x},${y}`;
  }).join(' ');
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="${pts.split(' ').pop().split(',')[0]}" cy="${pts.split(' ').pop().split(',')[1]}" r="3" fill="${color}"/>
  </svg>`;
}

function circleScore(val, max=100, color='var(--cyan)', size=56) {
  const pct = Math.min(val/max, 1);
  const r = (size-8)/2, circ = 2*Math.PI*r;
  const dash = circ * pct;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="rgba(255,255,255,.08)" stroke-width="4"/>
    <circle cx="${size/2}" cy="${size/2}" r="${r}" fill="none" stroke="${color}" stroke-width="4"
      stroke-dasharray="${dash} ${circ-dash}" stroke-dashoffset="${circ*0.25}" stroke-linecap="round"/>
    <text x="${size/2}" y="${size/2+5}" text-anchor="middle" fill="${color}" font-size="13" font-weight="800">${val}</text>
  </svg>`;
}

/* ============================================================
 *  LEARNER DIRECTORY MODULE
 * ============================================================ */
window.LearnerDirectoryModule = {
  _searchTerm: '',
  _filterBatch: '',
  _filterDept: '',
  _filterLevel: '',
  _filterStatus: '',
  _sortBy: 'name',

  render() {
    const coach = window.AIDebateAuth?.currentUser;
    const allLearners = window.AIDebateDB.getUsers().filter(u => u.role === 'learner');

    // Get unique filter options
    const batches  = [...new Set(allLearners.map(l => l.batch).filter(Boolean))];
    const depts    = [...new Set(allLearners.map(l => l.department).filter(Boolean))];
    const levels   = [...new Set(allLearners.map(l => l.level).filter(Boolean))];

    return `
    <div class="module-container" style="padding:0;">
      <!-- Header -->
      <div style="background:var(--surface-glass);border-bottom:1px solid var(--border-glass);padding:20px 28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div>
          <h1 style="font-size:1.4rem;font-weight:800;margin:0;">👨‍🎓 Learner Directory</h1>
          <p style="margin:4px 0 0;color:var(--text-muted);font-size:0.85rem;">${allLearners.length} registered learners · Real-time database</p>
        </div>
        <div style="display:flex;gap:10px;flex-wrap:wrap;">
          <button class="btn-secondary" id="dir-export-pdf" style="padding:8px 16px;font-size:0.82rem;">📄 Export PDF</button>
          <button class="btn-secondary" id="dir-export-csv" style="padding:8px 16px;font-size:0.82rem;">📊 Export CSV</button>
          <button class="btn-secondary" id="dir-toggle-view" style="padding:8px 16px;font-size:0.82rem;">⊞ Table View</button>
        </div>
      </div>

      <!-- Stats Row -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:14px;padding:18px 28px;">
        ${this._statBox('Total Learners', allLearners.length, '👨‍🎓', 'var(--cyan)')}
        ${this._statBox('Active Today', allLearners.filter(l=>l.status==='Active').length, '🟢', 'var(--emerald)')}
        ${this._statBox('Avg Score', (() => {
          const avgs = allLearners.map(l => l.metrics?.overall || 0).filter(v => v > 0);
          return avgs.length ? Math.round(avgs.reduce((a,b)=>a+b,0)/avgs.length) : 0;
        })() + '%', '📊', 'var(--violet)')}
        ${this._statBox('Batches', batches.length, '📚', 'var(--amber)')}
        ${this._statBox('Departments', depts.length, '🏛️', 'var(--rose)')}
      </div>

      <!-- Filters -->
      <div style="padding:0 28px 16px;display:flex;flex-wrap:wrap;gap:10px;align-items:flex-end;">
        <div style="flex:1;min-width:200px;">
          <input type="search" id="dir-search" class="form-input" placeholder="🔍 Search name, email, ID…"
            value="${this._searchTerm}" style="width:100%;box-sizing:border-box;" />
        </div>
        <select id="dir-batch" class="form-input" style="min-width:130px;">
          <option value="">All Batches</option>
          ${batches.map(b => `<option value="${b}" ${this._filterBatch===b?'selected':''}>${b}</option>`).join('')}
        </select>
        <select id="dir-dept" class="form-input" style="min-width:150px;">
          <option value="">All Departments</option>
          ${depts.map(d => `<option value="${d}" ${this._filterDept===d?'selected':''}>${d}</option>`).join('')}
        </select>
        <select id="dir-level" class="form-input" style="min-width:130px;">
          <option value="">All Levels</option>
          ${levels.map(l => `<option value="${l}" ${this._filterLevel===l?'selected':''}>${l}</option>`).join('')}
        </select>
        <select id="dir-status" class="form-input" style="min-width:120px;">
          <option value="">All Status</option>
          <option value="Active"   ${this._filterStatus==='Active'?'selected':''}>Active</option>
          <option value="Inactive" ${this._filterStatus==='Inactive'?'selected':''}>Inactive</option>
        </select>
        <select id="dir-sort" class="form-input" style="min-width:160px;">
          <option value="name"     ${this._sortBy==='name'?'selected':''}>Sort: A→Z</option>
          <option value="score_desc" ${this._sortBy==='score_desc'?'selected':''}>Highest Score</option>
          <option value="score_asc"  ${this._sortBy==='score_asc'?'selected':''}>Lowest Score</option>
          <option value="latest"   ${this._sortBy==='latest'?'selected':''}>Latest Joined</option>
        </select>
        <button class="btn-secondary" id="dir-clear-filters" style="padding:10px 14px;font-size:0.82rem;">✕ Clear</button>
      </div>

      <!-- Learner Cards Grid -->
      <div id="dir-cards-grid" style="padding:0 28px 28px;display:grid;grid-template-columns:repeat(auto-fill,minmax(380px,1fr));gap:18px;">
        ${this._renderCards(allLearners)}
      </div>
    </div>`;
  },

  _statBox(label, value, icon, color) {
    return `<div class="glass-card" style="padding:14px 18px;display:flex;align-items:center;gap:14px;">
      <div style="font-size:1.6rem;">${icon}</div>
      <div>
        <div style="font-size:1.4rem;font-weight:900;color:${color};">${value}</div>
        <div style="font-size:0.78rem;color:var(--text-muted);">${label}</div>
      </div>
    </div>`;
  },

  _applyFilters(learners) {
    let list = learners.filter(l => l.role === 'learner');
    if (this._searchTerm) {
      const t = this._searchTerm.toLowerCase();
      list = list.filter(l => l.name.toLowerCase().includes(t) || l.email.toLowerCase().includes(t) || (l.studentId||'').toLowerCase().includes(t));
    }
    if (this._filterBatch)  list = list.filter(l => l.batch  === this._filterBatch);
    if (this._filterDept)   list = list.filter(l => l.department === this._filterDept);
    if (this._filterLevel)  list = list.filter(l => l.level  === this._filterLevel);
    if (this._filterStatus) list = list.filter(l => l.status === this._filterStatus);
    switch (this._sortBy) {
      case 'score_desc': list.sort((a,b) => (b.metrics?.overall||0) - (a.metrics?.overall||0)); break;
      case 'score_asc':  list.sort((a,b) => (a.metrics?.overall||0) - (b.metrics?.overall||0)); break;
      case 'latest':     list.sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      default:           list.sort((a,b) => a.name.localeCompare(b.name));
    }
    return list;
  },

  _renderCards(allLearners) {
    const filtered = this._applyFilters(allLearners);
    if (!filtered.length) return '<div style="grid-column:1/-1;text-align:center;padding:60px;color:var(--text-muted);">No learners found matching your filters.</div>';
    return filtered.map(learner => this._learnerCard(learner)).join('');
  },

  _learnerCard(l) {
    const analytics = window.AIDebateDB.getLearnerAnalytics(l.id);
    const initials = l.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
    const scoreTrend = (analytics.scoreTrend||[]).map(s=>s.score);
    const statusColor = l.status === 'Active' ? 'var(--emerald)' : 'var(--rose)';
    const levelColors = { Advanced:'var(--violet)', Intermediate:'var(--amber)', Beginner:'var(--cyan)' };
    const levelColor  = levelColors[l.level] || 'var(--cyan)';

    const badgeHTML = (l.badges||[]).slice(0,3).map(b => {
      const meta = BADGES[b] || {};
      return `<span title="${meta.label||b}" style="font-size:1.1rem;">${meta.icon||'🏅'}</span>`;
    }).join('');

    return `
    <div class="glass-card learner-dir-card" data-learner-id="${l.id}"
         style="padding:0;overflow:hidden;cursor:pointer;transition:transform .2s,box-shadow .2s;"
         onmouseenter="this.style.transform='translateY(-3px)';this.style.boxShadow='0 8px 32px rgba(6,182,212,.15)'"
         onmouseleave="this.style.transform='';this.style.boxShadow=''">

      <!-- Card Header -->
      <div style="background:linear-gradient(135deg,rgba(6,182,212,.12),rgba(139,92,246,.08));padding:18px 18px 14px;display:flex;align-items:center;gap:14px;">
        <div style="width:52px;height:52px;border-radius:50%;background:var(--grad-primary);
                    display:flex;align-items:center;justify-content:center;font-size:1.1rem;
                    font-weight:800;color:#fff;flex-shrink:0;">${initials}</div>
        <div style="flex:1;min-width:0;">
          <div style="font-weight:800;font-size:1rem;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${l.name}</div>
          <div style="font-size:0.78rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${l.email}</div>
          <div style="display:flex;gap:6px;margin-top:5px;flex-wrap:wrap;">
            <span style="background:rgba(6,182,212,.12);color:${levelColor};padding:2px 8px;border-radius:10px;font-size:0.72rem;font-weight:700;">${l.level||'—'}</span>
            <span style="background:${l.status==='Active'?'rgba(16,185,129,.12)':'rgba(239,68,68,.12)'};color:${statusColor};padding:2px 8px;border-radius:10px;font-size:0.72rem;font-weight:700;">${l.status}</span>
            <span style="font-size:0.9rem;">${badgeHTML}</span>
          </div>
        </div>
        <div style="text-align:right;flex-shrink:0;">
          ${circleScore(l.metrics?.overall||0, 100, 'var(--cyan)', 52)}
        </div>
      </div>

      <!-- Card Body — Quick Stats -->
      <div style="padding:14px 18px;display:grid;grid-template-columns:repeat(4,1fr);gap:10px;border-bottom:1px solid rgba(255,255,255,.05);">
        ${this._miniStat('Debates', analytics.totalDebates)}
        ${this._miniStat('Avg Score', (analytics.avgScore||0)+'%')}
        ${this._miniStat('Best', (analytics.bestScore||0)+'%')}
        ${this._miniStat('Fluency', (analytics.avgFluency||0)+'%')}
        ${this._miniStat('Grammar', (analytics.avgGrammar||0)+'%')}
        ${this._miniStat('Logic', (analytics.avgLogic||0)+'%')}
        ${this._miniStat('Coach Evals', analytics.coachEvaluationsCount||0)}
        ${this._miniStat('WPM', analytics.avgWPM||'—')}
      </div>

      <!-- Score Trend Sparkline -->
      <div style="padding:10px 18px;display:flex;align-items:center;justify-content:space-between;">
        <div style="font-size:0.73rem;color:var(--text-muted);">Score Trend</div>
        ${sparkline(scoreTrend.length ? scoreTrend : [0], 100, 32)}
      </div>

      <!-- Card Footer -->
      <div style="padding:10px 18px;background:rgba(255,255,255,.02);display:flex;align-items:center;justify-content:space-between;">
        <div style="font-size:0.72rem;color:var(--text-muted);">
          ${l.studentId||'No ID'} · ${l.batch||'—'} · ${l.department||'—'}
        </div>
        <button class="gradient-btn view-learner-btn" data-id="${l.id}"
                style="padding:5px 12px;font-size:0.75rem;" onclick="event.stopPropagation()">
          View Profile →
        </button>
      </div>
    </div>`;
  },

  _miniStat(label, value) {
    return `<div style="text-align:center;">
      <div style="font-size:0.95rem;font-weight:800;color:var(--text-main);">${value}</div>
      <div style="font-size:0.68rem;color:var(--text-muted);">${label}</div>
    </div>`;
  },

  bindEvents(container) {
    // Search
    container.querySelector('#dir-search')?.addEventListener('input', e => {
      this._searchTerm = e.target.value;
      this._refreshCards(container);
    });
    // Filters
    ['dir-batch','dir-dept','dir-level','dir-status','dir-sort'].forEach(id => {
      container.querySelector(`#${id}`)?.addEventListener('change', e => {
        if (id==='dir-batch')  this._filterBatch  = e.target.value;
        if (id==='dir-dept')   this._filterDept   = e.target.value;
        if (id==='dir-level')  this._filterLevel  = e.target.value;
        if (id==='dir-status') this._filterStatus = e.target.value;
        if (id==='dir-sort')   this._sortBy       = e.target.value;
        this._refreshCards(container);
      });
    });
    // Clear filters
    container.querySelector('#dir-clear-filters')?.addEventListener('click', () => {
      this._searchTerm = ''; this._filterBatch = ''; this._filterDept = '';
      this._filterLevel = ''; this._filterStatus = ''; this._sortBy = 'name';
      container.querySelector('#dir-search').value = '';
      ['dir-batch','dir-dept','dir-level','dir-status','dir-sort'].forEach(id => {
        const el = container.querySelector(`#${id}`);
        if (el) el.value = '';
      });
      this._refreshCards(container);
    });
    // View profile
    container.addEventListener('click', e => {
      const btn = e.target.closest('.view-learner-btn, .learner-dir-card');
      if (!btn) return;
      const id = btn.dataset.id || btn.dataset.learnerId;
      if (id) this._openLearnerProfile(id, container);
    });
    // Export CSV
    container.querySelector('#dir-export-csv')?.addEventListener('click', () => {
      this._exportCSV();
    });
    // Export PDF (print)
    container.querySelector('#dir-export-pdf')?.addEventListener('click', () => {
      window.print();
    });
    // Toggle view
    container.querySelector('#dir-toggle-view')?.addEventListener('click', (e) => {
      const grid = container.querySelector('#dir-cards-grid');
      if (grid.style.gridTemplateColumns.includes('380')) {
        grid.style.gridTemplateColumns = '1fr';
        e.target.textContent = '⊟ Card View';
      } else {
        grid.style.gridTemplateColumns = 'repeat(auto-fill,minmax(380px,1fr))';
        e.target.textContent = '⊞ Table View';
      }
    });
  },

  _refreshCards(container) {
    const allLearners = window.AIDebateDB.getUsers().filter(u => u.role === 'learner');
    const grid = container.querySelector('#dir-cards-grid');
    if (grid) grid.innerHTML = this._renderCards(allLearners);
  },

  _exportCSV() {
    const learners = this._applyFilters(window.AIDebateDB.getUsers());
    const rows = [['Name','Email','StudentID','Batch','Department','Level','Status','Overall Score','Debates','Avg Score','Last Active']];
    learners.forEach(l => {
      const a = window.AIDebateDB.getLearnerAnalytics(l.id);
      rows.push([l.name, l.email, l.studentId||'', l.batch||'', l.department||'', l.level||'', l.status, l.metrics?.overall||0, a.totalDebates, a.avgScore, l.lastActive||'']);
    });
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `learner-directory-${Date.now()}.csv`; a.click();
  },

  _openLearnerProfile(learnerId, container) {
    if (!window.AIDebateAuth.hasPermission('VIEW_LEARNER_PROFILE')) {
      window.showToast('Access Denied: You do not have permission to view learner profiles.', 'warning');
      return;
    }
    const learner   = window.AIDebateDB.getUserById(learnerId);
    const analytics = window.AIDebateDB.getLearnerAnalytics(learnerId);
    const history   = window.AIDebateDB.getPracticeHistory(learnerId);
    const coachEvs  = window.AIDebateDB.getPublishedEvalsForLearner(learnerId);
    const acts      = window.AIDebateDB.getActivityForUser(learnerId);
    if (!learner) return;

    const initials = learner.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase();
    const scoreTrend = (analytics.scoreTrend||[]).map(s=>s.score);
    const metrics = [
      {k:'Fluency',v:analytics.avgFluency},{k:'Confidence',v:analytics.avgConfidence},
      {k:'Grammar',v:analytics.avgGrammar},{k:'Vocabulary',v:analytics.avgVocabulary},
      {k:'Logic',v:analytics.avgLogic},{k:'Delivery',v:analytics.avgDelivery},
      {k:'Persuasion',v:analytics.avgPersuasiveness},
    ];

    const modal = document.createElement('div');
    modal.id = 'learner-profile-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:9000;overflow-y:auto;padding:24px 16px;';
    modal.innerHTML = `
    <div style="max-width:900px;margin:0 auto;background:var(--surface-glass);border:1px solid var(--border-glass-glow);border-radius:20px;overflow:hidden;">
      <!-- Profile Header -->
      <div style="background:linear-gradient(135deg,rgba(6,182,212,.15),rgba(139,92,246,.1));padding:28px;display:flex;align-items:center;gap:20px;flex-wrap:wrap;">
        <div style="width:72px;height:72px;border-radius:50%;background:var(--grad-primary);display:flex;align-items:center;justify-content:center;font-size:1.5rem;font-weight:900;color:#fff;flex-shrink:0;">${initials}</div>
        <div style="flex:1;">
          <h2 style="margin:0;font-size:1.5rem;font-weight:900;">${learner.name}</h2>
          <div style="color:var(--text-muted);font-size:0.9rem;">${learner.email}</div>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:8px;">
            <span class="status-badge">${learner.status}</span>
            <span style="background:rgba(255,255,255,.08);padding:3px 10px;border-radius:10px;font-size:0.78rem;">${learner.level||'—'}</span>
            <span style="background:rgba(255,255,255,.08);padding:3px 10px;border-radius:10px;font-size:0.78rem;">${learner.institution||'—'}</span>
          </div>
        </div>
        <div style="text-align:center;">
          ${circleScore(learner.metrics?.overall||0, 100, 'var(--cyan)', 72)}
          <div style="font-size:0.72rem;color:var(--text-muted);margin-top:4px;">Overall Score</div>
        </div>
        <button onclick="document.getElementById('learner-profile-modal').remove()"
          style="position:absolute;top:16px;right:16px;background:none;border:none;color:var(--text-muted);font-size:1.3rem;cursor:pointer;">✕</button>
      </div>

      <div style="padding:24px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">

        <!-- Personal Info -->
        <div class="glass-card" style="padding:16px;">
          <div style="font-weight:700;color:var(--cyan);margin-bottom:12px;">👤 Personal Information</div>
          ${[['Student ID',learner.studentId||'—'],['Batch',learner.batch||'—'],['Department',learner.department||'—'],['Institution',learner.institution||'—'],['Joined',learner.createdAt||'—'],['Last Active',learner.lastActive||'—'],['Rank','#'+(learner.rank||'—')],['Streak',learner.streakDays+' days']].map(([k,v])=>
            `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:0.83rem;">
              <span style="color:var(--text-muted);">${k}</span>
              <span style="font-weight:600;color:var(--text-main);">${v}</span>
            </div>`
          ).join('')}
        </div>

        <!-- Debate Statistics -->
        <div class="glass-card" style="padding:16px;">
          <div style="font-weight:700;color:var(--cyan);margin-bottom:12px;">📊 Debate Statistics</div>
          ${[
            ['Total Debates', analytics.totalDebates],
            ['Completed', analytics.completedDebates],
            ['Pending', analytics.pendingDebates],
            ['Practice Sessions', analytics.practiceSessions],
            ['Best Score', (analytics.bestScore||0)+'%'],
            ['Worst Score', (analytics.worstScore||0)+'%'],
            ['Avg Score', (analytics.avgScore||0)+'%'],
            ['Coach Evaluations', analytics.publishedFeedbackCount||0],
            ['Avg WPM', analytics.avgWPM||'—'],
            ['Total Time', (analytics.totalTimeMin||0)+' min'],
            ['Longest Speech', analytics.longestSpeech||'N/A'],
          ].map(([k,v])=>
            `<div style="display:flex;justify-content:space-between;padding:5px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:0.83rem;">
              <span style="color:var(--text-muted);">${k}</span>
              <span style="font-weight:600;color:var(--text-main);">${v}</span>
            </div>`
          ).join('')}
        </div>

        <!-- Metric Bars -->
        <div class="glass-card" style="padding:16px;grid-column:1/-1;">
          <div style="font-weight:700;color:var(--cyan);margin-bottom:14px;">🎯 Average Skill Scores</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:10px;">
            ${metrics.map(m => `
              <div>
                <div style="display:flex;justify-content:space-between;font-size:0.8rem;margin-bottom:4px;">
                  <span style="color:var(--text-muted);">${m.k}</span>
                  <span style="font-weight:700;color:var(--cyan);">${m.v||0}%</span>
                </div>
                <div style="background:rgba(255,255,255,.06);border-radius:4px;height:6px;">
                  <div style="background:var(--grad-primary);height:6px;border-radius:4px;width:${m.v||0}%;transition:width .6s ease;"></div>
                </div>
              </div>`).join('')}
          </div>
        </div>

        <!-- Score Trend -->
        <div class="glass-card" style="padding:16px;">
          <div style="font-weight:700;color:var(--cyan);margin-bottom:12px;">📈 Score Trend</div>
          ${scoreTrend.length ? sparkline(scoreTrend, 300, 80) : '<div style="color:var(--text-muted);font-size:0.85rem;">No practice history yet.</div>'}
        </div>

        <!-- AI Analytics -->
        <div class="glass-card" style="padding:16px;">
          <div style="font-weight:700;color:var(--cyan);margin-bottom:12px;">🤖 AI Analytics</div>
          ${[
            ['Best Topic', analytics.bestDebateTopic||'N/A'],
            ['Worst Topic', analytics.worstDebateTopic||'N/A'],
            ['Top Filler Words', (analytics.topFillerWords||[]).join(', ')||'None detected'],
            ['Speaking Speed', (analytics.avgWPM||0)+' WPM'],
          ].map(([k,v])=>
            `<div style="padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:0.82rem;">
              <div style="color:var(--text-muted);margin-bottom:2px;">${k}</div>
              <div style="color:var(--text-main);font-weight:600;">${v}</div>
            </div>`
          ).join('')}
        </div>

        <!-- Badges -->
        <div class="glass-card" style="padding:16px;grid-column:1/-1;">
          <div style="font-weight:700;color:var(--cyan);margin-bottom:12px;">🏅 Badges & Achievements</div>
          <div style="display:flex;flex-wrap:wrap;gap:10px;">
            ${(learner.badges||[]).length ? (learner.badges||[]).map(b => {
              const meta = BADGES[b] || { icon:'🏅', label:b, color:'var(--cyan)' };
              return `<div style="background:rgba(255,255,255,.06);border:1px solid ${meta.color}33;border-radius:10px;padding:8px 14px;display:flex;align-items:center;gap:8px;">
                <span style="font-size:1.2rem;">${meta.icon}</span>
                <span style="font-size:0.82rem;font-weight:700;color:${meta.color};">${meta.label}</span>
              </div>`;
            }).join('') : '<div style="color:var(--text-muted);font-size:0.85rem;">No badges earned yet.</div>'}
          </div>
        </div>

        <!-- Practice History -->
        <div class="glass-card" style="padding:16px;grid-column:1/-1;">
          <div style="font-weight:700;color:var(--cyan);margin-bottom:12px;">🎙️ Debate & Practice History (${history.length})</div>
          ${history.length ? `<div style="max-height:220px;overflow-y:auto;">${history.map(h=>`
            <div style="padding:10px;border-bottom:1px solid rgba(255,255,255,.05);display:flex;gap:14px;align-items:flex-start;">
              <div style="font-size:1.4rem;">${circleScore(h.score||0,100,'var(--cyan)',38)}</div>
              <div style="flex:1;min-width:0;">
                <div style="font-weight:700;font-size:0.87rem;">${h.topic||'—'}</div>
                <div style="font-size:0.75rem;color:var(--text-muted);">${h.debateType||''} · ${h.date||''} · ${h.duration||''} · ${h.wpm||0} WPM</div>
                <div style="font-size:0.77rem;color:var(--text-muted);margin-top:3px;">${h.aiFeedback||''}</div>
              </div>
            </div>`).join('')}</div>`
          : '<div style="color:var(--text-muted);font-size:0.85rem;">No practice sessions yet.</div>'}
        </div>

        <!-- Coach Feedback History -->
        <div class="glass-card" style="padding:16px;grid-column:1/-1;">
          <div style="font-weight:700;color:var(--cyan);margin-bottom:12px;">📝 Coach Feedback History (${coachEvs.length})</div>
          ${coachEvs.length ? coachEvs.map(ev=>`
            <div style="padding:12px;border-bottom:1px solid rgba(255,255,255,.05);">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                <div style="font-weight:700;font-size:0.87rem;">${ev.topic||'—'}</div>
                <div style="font-size:1.1rem;font-weight:900;color:var(--cyan);">${ev.overallRating||0}/10</div>
              </div>
              <div style="font-size:0.75rem;color:var(--text-muted);">${ev.coachName||'—'} · Published ${ev.publishedAt||ev.evaluatedAt||'—'}</div>
              ${ev.strengths?`<div style="margin-top:6px;font-size:0.8rem;"><span style="color:var(--emerald);">✅ </span>${ev.strengths}</div>`:''}
              ${ev.areasToImprove?`<div style="font-size:0.8rem;"><span style="color:var(--amber);">⚠️ </span>${ev.areasToImprove}</div>`:''}
            </div>`).join('')
          : '<div style="color:var(--text-muted);font-size:0.85rem;">No coach feedback yet.</div>'}
        </div>

        <!-- Activity Timeline -->
        <div class="glass-card" style="padding:16px;grid-column:1/-1;">
          <div style="font-weight:700;color:var(--cyan);margin-bottom:12px;">⏱️ Activity Timeline</div>
          <div style="max-height:200px;overflow-y:auto;">
            ${acts.length ? acts.map(a=>`
              <div style="display:flex;gap:10px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);align-items:flex-start;">
                <div style="font-size:1rem;padding-top:1px;">${ACTIVITY_ICONS[a.type]||'📌'}</div>
                <div>
                  <div style="font-size:0.82rem;color:var(--text-main);">${a.description||a.type}</div>
                  <div style="font-size:0.73rem;color:var(--text-muted);">${a.date||''}</div>
                </div>
              </div>`).join('')
            : '<div style="color:var(--text-muted);font-size:0.85rem;">No activity recorded.</div>'}
          </div>
        </div>

      </div><!-- /grid -->
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  }
};

/* ============================================================
 *  EVALUATED VAULT MODULE
 * ============================================================ */
window.EvaluatedVaultModule = {
  _filterStatus: '',

  render() {
    const coach  = window.AIDebateAuth?.currentUser;
    const allEvs = window.AIDebateDB.getCoachEvaluations();
    const allAsgs = window.AIDebateDB.getAssignments().filter(a => ['Submitted','Pending Review','Evaluated','Completed'].includes(a.status));

    // Merge assignments into vault (include ones without coach eval)
    const submittedAsgs = allAsgs.filter(a => ['Submitted','Pending Review'].includes(a.status));
    const evalMap = {};
    allEvs.forEach(e => { evalMap[e.assignmentId] = e; });

    return `
    <div class="module-container" style="padding:0;">
      <!-- Header -->
      <div style="background:var(--surface-glass);border-bottom:1px solid var(--border-glass);padding:20px 28px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div>
          <h1 style="font-size:1.4rem;font-weight:800;margin:0;">📁 Evaluated Vault</h1>
          <p style="margin:4px 0 0;color:var(--text-muted);font-size:0.85rem;">${allEvs.length} coach evaluations · ${submittedAsgs.length} pending review</p>
        </div>
        <div style="display:flex;gap:8px;">
          <select id="vault-filter" class="form-input" style="min-width:160px;">
            <option value="">All Submissions</option>
            <option value="pending">⏳ Pending Review</option>
            <option value="Draft">📋 Draft</option>
            <option value="Saved">💾 Saved</option>
            <option value="Published">✅ Published</option>
          </select>
        </div>
      </div>

      <!-- Stats -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;padding:16px 28px;">
        ${this._statBox('Submitted', submittedAsgs.length, '📥', 'var(--amber)')}
        ${this._statBox('Evaluated', allEvs.filter(e=>e.status!=='Draft').length, '📝', 'var(--violet)')}
        ${this._statBox('Published', allEvs.filter(e=>e.status==='Published').length, '✅', 'var(--emerald)')}
        ${this._statBox('Drafts', allEvs.filter(e=>e.status==='Draft').length, '📋', 'var(--text-muted)')}
      </div>

      <!-- Vault Cards -->
      <div id="vault-list" style="padding:0 28px 28px;display:flex;flex-direction:column;gap:14px;">
        ${this._renderVault(submittedAsgs, allEvs)}
      </div>
    </div>`;
  },

  _statBox(label, value, icon, color) {
    return `<div class="glass-card" style="padding:12px 16px;display:flex;align-items:center;gap:12px;">
      <div style="font-size:1.5rem;">${icon}</div>
      <div>
        <div style="font-size:1.3rem;font-weight:900;color:${color};">${value}</div>
        <div style="font-size:0.75rem;color:var(--text-muted);">${label}</div>
      </div>
    </div>`;
  },

  _renderVault(submittedAsgs, allEvs) {
    const rows = [];

    // Pending (submitted, not yet coach-evaluated)
    submittedAsgs.forEach(asg => {
      const ev = allEvs.find(e => e.assignmentId === asg.id);
      rows.push(this._vaultCard(asg, ev||null, 'pending'));
    });

    // Coach evaluations (all statuses)
    allEvs.forEach(ev => {
      const asg = window.AIDebateDB.getAssignments().find(a => a.id === ev.assignmentId);
      if (!asg || ['Submitted','Pending Review'].includes(asg.status)) return; // already shown
      rows.push(this._vaultCard(asg||{}, ev, ev.status));
    });

    if (!rows.length) return '<div style="text-align:center;padding:60px;color:var(--text-muted);">No submissions yet.</div>';
    return rows.join('');
  },

  _vaultCard(asg, ev, statusType) {
    const learnerId   = (asg.learnerIds||[])[0] || (ev && ev.learnerId) || '';
    const learner     = window.AIDebateDB.getUserById(learnerId);
    const initials    = learner ? learner.name.split(' ').map(w=>w[0]).join('').substring(0,2).toUpperCase() : '??';
    const statusColors= { pending:'var(--amber)', Draft:'var(--text-muted)', Saved:'var(--violet)', Published:'var(--emerald)' };
    const statusLabels= { pending:'⏳ Pending Review', Draft:'📋 Draft', Saved:'💾 Saved', Published:'✅ Published' };
    const sColor      = statusColors[statusType] || 'var(--cyan)';
    const sLabel      = statusLabels[statusType] || statusType;

    return `
    <div class="glass-card" style="padding:0;overflow:hidden;">
      <div style="padding:16px 20px;display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
        <!-- Learner avatar -->
        <div style="width:44px;height:44px;border-radius:50%;background:var(--grad-primary);display:flex;align-items:center;justify-content:center;font-size:1rem;font-weight:800;color:#fff;flex-shrink:0;">${initials}</div>
        <!-- Info -->
        <div style="flex:1;min-width:0;">
          <div style="font-weight:800;font-size:0.95rem;">${learner?.name||'Unknown Learner'}</div>
          <div style="font-size:0.8rem;color:var(--text-muted);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${(asg.topic||ev?.topic||'—').substring(0,70)}…</div>
          <div style="font-size:0.75rem;color:var(--text-muted);margin-top:3px;">
            ${asg.debateType||ev?.debateType||'—'} · Submitted: ${asg.submittedAt||ev?.submittedAt||'—'} · Duration: ${asg.duration||ev?.duration||'—'}
          </div>
        </div>
        <!-- Status + Score -->
        <div style="text-align:right;flex-shrink:0;">
          <div style="background:${sColor}22;color:${sColor};padding:4px 12px;border-radius:10px;font-size:0.78rem;font-weight:700;margin-bottom:6px;">${sLabel}</div>
          ${ev?.overallRating ? `<div style="font-size:1.1rem;font-weight:900;color:var(--cyan);">${ev.overallRating}/10</div>` : '<div style="font-size:0.75rem;color:var(--text-muted);">Not Rated</div>'}
        </div>
        <!-- Action Button -->
        <button class="gradient-btn open-eval-btn"
          data-asg-id="${asg.id||''}" data-eval-id="${ev?.id||''}" data-learner-id="${learnerId}"
          style="padding:8px 16px;font-size:0.82rem;flex-shrink:0;">
          ${ev ? (ev.status==='Published' ? '👁 View Feedback' : '✏️ Edit Feedback') : '📝 Open Evaluation'}
        </button>
      </div>
      ${ev?.strengths ? `<div style="padding:8px 20px;background:rgba(16,185,129,.06);font-size:0.78rem;color:var(--emerald);">✅ ${ev.strengths.substring(0,120)}…</div>` : ''}
    </div>`;
  },

  bindEvents(container) {
    container.querySelector('#vault-filter')?.addEventListener('change', e => {
      this._filterStatus = e.target.value;
    });

    container.addEventListener('click', e => {
      const btn = e.target.closest('.open-eval-btn');
      if (!btn) return;
      const asgId     = btn.dataset.asgId;
      const evalId    = btn.dataset.evalId;
      const learnerId = btn.dataset.learnerId;
      this._openEvaluationModal(asgId, evalId, learnerId);
    });
  },

  _openEvaluationModal(asgId, evalId, learnerId) {
    if (!window.AIDebateAuth.hasPermission('VIEW_EVALUATION_QUEUE') && !window.AIDebateAuth.hasPermission('VIEW_EVALUATED_VAULT')) {
      window.showToast('Access Denied: You do not have permission to view evaluations.', 'warning');
      return;
    }
    const asg    = asgId ? window.AIDebateDB.getAssignments().find(a => a.id === asgId) : null;
    const ev     = evalId ? window.AIDebateDB.getCoachEvalById(evalId) : null;
    const learner = window.AIDebateDB.getUserById(learnerId);
    const coach   = window.AIDebateAuth?.currentUser;
    const pracHistory = window.AIDebateDB.getPracticeHistory(learnerId);
    // Find the most recent practice session related to this topic (or any)
    const relatedPrac = pracHistory.find(p => asg && p.topic && asg.topic && p.topic.toLowerCase().includes((asg.topic||'').split(' ')[0]?.toLowerCase())) || pracHistory[0] || null;
    const aiScores = relatedPrac?.metrics || {};
    const transcript = ev?.transcript || asg?.submissionText || relatedPrac?.transcript || 'No transcript available.';

    const existingModal = document.getElementById('eval-modal');
    if (existingModal) existingModal.remove();

    const modal = document.createElement('div');
    modal.id = 'eval-modal';
    modal.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:9500;overflow-y:auto;padding:20px 12px;';

    const ratingStars = (id, current=0) => Array.from({length:10},(_,i)=>
      `<button type="button" class="rating-btn" data-rating="${i+1}" data-group="${id}"
        style="width:32px;height:32px;border:1px solid rgba(255,255,255,.15);border-radius:6px;
               background:${i<current?'var(--grad-primary)':'rgba(255,255,255,.05)'};
               color:${i<current?'#fff':'var(--text-muted)'};cursor:pointer;font-weight:700;font-size:0.82rem;">${i+1}</button>`
    ).join('');

    const metricRow = (label, key, val) =>
      `<div style="display:flex;align-items:center;gap:12px;padding:6px 0;border-bottom:1px solid rgba(255,255,255,.04);">
        <label style="font-size:0.82rem;color:var(--text-muted);width:140px;flex-shrink:0;">${label}</label>
        <input type="number" min="0" max="100" name="rubric_${key}" value="${val||0}"
          style="width:70px;padding:4px 8px;background:rgba(0,0,0,.3);border:1px solid rgba(255,255,255,.1);border-radius:6px;color:var(--text-main);" />
        <div style="flex:1;background:rgba(255,255,255,.06);height:6px;border-radius:4px;">
          <div style="background:var(--grad-primary);height:6px;border-radius:4px;width:${val||0}%;"></div>
        </div>
        <span style="font-size:0.82rem;font-weight:700;color:var(--cyan);width:36px;">${val||0}%</span>
      </div>`;

    modal.innerHTML = `
    <div style="max-width:860px;margin:0 auto;background:var(--surface-glass);border:1px solid var(--border-glass-glow);border-radius:20px;overflow:hidden;">
      <!-- Modal Header -->
      <div style="background:linear-gradient(135deg,rgba(6,182,212,.15),rgba(139,92,246,.1));padding:22px 24px;display:flex;align-items:center;justify-content:space-between;">
        <div>
          <h2 style="margin:0;font-size:1.2rem;font-weight:900;">📝 Coach Evaluation Panel</h2>
          <div style="font-size:0.82rem;color:var(--text-muted);margin-top:4px;">${learner?.name||'Learner'} · ${(asg?.topic||ev?.topic||'—').substring(0,60)}</div>
        </div>
        <button onclick="document.getElementById('eval-modal').remove()"
          style="background:none;border:none;color:var(--text-muted);font-size:1.3rem;cursor:pointer;">✕</button>
      </div>

      <div style="padding:22px;display:grid;grid-template-columns:1fr 1fr;gap:16px;">

        <!-- Transcript -->
        <div class="glass-card" style="padding:14px;grid-column:1/-1;">
          <div style="font-weight:700;color:var(--cyan);margin-bottom:8px;">📄 Speech Transcript</div>
          <div style="font-size:0.83rem;color:var(--text-main);line-height:1.7;max-height:140px;overflow-y:auto;background:rgba(0,0,0,.2);padding:10px;border-radius:8px;">${transcript}</div>
        </div>

        <!-- AI Scores -->
        <div class="glass-card" style="padding:14px;">
          <div style="font-weight:700;color:var(--cyan);margin-bottom:10px;">🤖 AI Evaluation Scores</div>
          ${[['Fluency','fluency'],['Confidence','confidence'],['Grammar','grammar'],['Relevance','relevance'],['Overall','overall']].map(([l,k])=>
            `<div style="display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px solid rgba(255,255,255,.04);font-size:0.82rem;">
              <span style="color:var(--text-muted);">${l}</span>
              <span style="font-weight:700;color:var(--cyan);">${aiScores[k]||0}%</span>
            </div>`
          ).join('')}
          ${relatedPrac ? `<div style="margin-top:8px;font-size:0.75rem;color:var(--text-muted);">Source: ${relatedPrac.topic||'Practice session'} · ${relatedPrac.date||''}</div>` : '<div style="font-size:0.75rem;color:var(--text-muted);margin-top:8px;">No linked AI evaluation found.</div>'}
        </div>

        <!-- Overall Rating -->
        <div class="glass-card" style="padding:14px;">
          <div style="font-weight:700;color:var(--cyan);margin-bottom:10px;">⭐ Overall Rating (1–10)</div>
          <div style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:8px;" id="rating-group">
            ${ratingStars('overall', ev?.overallRating||0)}
          </div>
          <input type="hidden" id="overall-rating-val" value="${ev?.overallRating||0}" />
          <div style="font-size:0.78rem;color:var(--text-muted);">Selected: <strong id="rating-display">${ev?.overallRating||0}</strong>/10</div>
        </div>

        <!-- Coach Feedback Form -->
        <div style="grid-column:1/-1;">
          <form id="coach-eval-form">
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">

              <!-- Strengths -->
              <div class="glass-card" style="padding:14px;">
                <label style="font-size:0.82rem;font-weight:700;color:var(--cyan);display:block;margin-bottom:6px;">✅ Strengths</label>
                <textarea name="strengths" rows="3" class="form-input" style="width:100%;box-sizing:border-box;font-size:0.83rem;">${ev?.strengths||''}</textarea>
              </div>

              <!-- Areas to Improve -->
              <div class="glass-card" style="padding:14px;">
                <label style="font-size:0.82rem;font-weight:700;color:var(--amber);display:block;margin-bottom:6px;">⚠️ Areas to Improve</label>
                <textarea name="areasToImprove" rows="3" class="form-input" style="width:100%;box-sizing:border-box;font-size:0.83rem;">${ev?.areasToImprove||''}</textarea>
              </div>

              <!-- Communication Skills -->
              <div class="glass-card" style="padding:14px;">
                <label style="font-size:0.82rem;font-weight:700;color:var(--cyan);display:block;margin-bottom:6px;">🗣️ Communication Skills</label>
                <textarea name="communicationSkills" rows="2" class="form-input" style="width:100%;box-sizing:border-box;font-size:0.83rem;">${ev?.communicationSkills||''}</textarea>
              </div>

              <!-- Suggestions -->
              <div class="glass-card" style="padding:14px;">
                <label style="font-size:0.82rem;font-weight:700;color:var(--violet);display:block;margin-bottom:6px;">💡 Suggestions</label>
                <textarea name="suggestions" rows="2" class="form-input" style="width:100%;box-sizing:border-box;font-size:0.83rem;">${ev?.suggestions||''}</textarea>
              </div>

              <!-- Body Language / Delivery -->
              <div class="glass-card" style="padding:14px;">
                <label style="font-size:0.82rem;font-weight:700;color:var(--cyan);display:block;margin-bottom:6px;">🎭 Body Language / Delivery</label>
                <textarea name="bodyLanguage" rows="2" class="form-input" style="width:100%;box-sizing:border-box;font-size:0.83rem;">${ev?.bodyLanguage||''}</textarea>
              </div>

              <!-- Final Remarks -->
              <div class="glass-card" style="padding:14px;">
                <label style="font-size:0.82rem;font-weight:700;color:var(--emerald);display:block;margin-bottom:6px;">📌 Final Remarks</label>
                <textarea name="finalRemarks" rows="2" class="form-input" style="width:100%;box-sizing:border-box;font-size:0.83rem;">${ev?.finalRemarks||''}</textarea>
              </div>

              <!-- Rubric Scores -->
              <div class="glass-card" style="padding:14px;grid-column:1/-1;">
                <div style="font-weight:700;color:var(--cyan);margin-bottom:10px;">📊 Coach Rubric Scores</div>
                ${metricRow('Confidence',     'confidence',      ev?.rubric?.confidence||aiScores?.confidence||0)}
                ${metricRow('Fluency',        'fluency',         ev?.rubric?.fluency||aiScores?.fluency||0)}
                ${metricRow('Grammar',        'grammar',         ev?.rubric?.grammar||aiScores?.grammar||0)}
                ${metricRow('Vocabulary',     'vocabulary',      ev?.rubric?.vocabulary||80)}
                ${metricRow('Pronunciation',  'pronunciation',   ev?.rubric?.pronunciation||78)}
                ${metricRow('Delivery',       'delivery',        ev?.rubric?.delivery||aiScores?.confidence||0)}
                ${metricRow('Logic',          'logic',           ev?.rubric?.logic||aiScores?.grammar||0)}
                ${metricRow('Persuasiveness', 'persuasiveness',  ev?.rubric?.persuasiveness||aiScores?.overall||0)}
              </div>

              <!-- Tags / Checkboxes -->
              <div class="glass-card" style="padding:14px;grid-column:1/-1;">
                <div style="font-weight:700;color:var(--cyan);margin-bottom:10px;">🏷️ Evaluation Tags</div>
                <div style="display:flex;flex-wrap:wrap;gap:12px;">
                  ${['outstanding','excellent','good','needs_improvement','recommended_advanced'].map(tag=>
                    `<label style="display:flex;align-items:center;gap:6px;cursor:pointer;font-size:0.83rem;">
                      <input type="checkbox" name="tag_${tag}" ${(ev?.tags||[]).includes(tag)?'checked':''} />
                      ${{outstanding:'🌟 Outstanding',excellent:'✅ Excellent',good:'👍 Good',needs_improvement:'⚠️ Needs Improvement',recommended_advanced:'🚀 Recommended for Advanced'}[tag]||tag}
                    </label>`).join('')}
                </div>
              </div>
            </div><!-- /grid -->

            <!-- Action Buttons -->
            <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:16px;padding-top:14px;border-top:1px solid rgba(255,255,255,.06);">
              <button type="button" id="btn-save-eval" class="btn-secondary" style="padding:10px 20px;">💾 Save Draft</button>
              <button type="button" id="btn-publish-eval" class="gradient-btn" style="padding:10px 20px;">🚀 Publish Feedback</button>
              <button type="button" onclick="document.getElementById('eval-modal').remove()" style="padding:10px 20px;background:none;border:1px solid rgba(255,255,255,.12);color:var(--text-muted);border-radius:8px;cursor:pointer;">Cancel</button>
              <div id="eval-save-msg" style="margin-left:auto;padding:10px;font-size:0.83rem;color:var(--emerald);display:none;"></div>
            </div>
          </form>
        </div>
      </div><!-- /main grid -->
    </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });

    /* --- Rating button interaction --- */
    modal.querySelectorAll('.rating-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = +btn.dataset.rating;
        document.getElementById('overall-rating-val').value = rating;
        document.getElementById('rating-display').textContent = rating;
        modal.querySelectorAll('.rating-btn').forEach((b,i) => {
          b.style.background = i < rating ? 'var(--grad-primary)' : 'rgba(255,255,255,.05)';
          b.style.color      = i < rating ? '#fff' : 'var(--text-muted)';
        });
      });
    });

    /* --- Rubric inputs live-update bars --- */
    modal.querySelectorAll('input[name^="rubric_"]').forEach(inp => {
      inp.addEventListener('input', () => {
        const v = Math.min(100, Math.max(0, +inp.value));
        const row = inp.closest('div[style*="display:flex"]');
        if (row) {
          const bar = row.querySelector('div div');
          const label = row.querySelector('span:last-child');
          if (bar) bar.style.width = v + '%';
          if (label) label.textContent = v + '%';
        }
      });
    });

    /* --- Collect form data helper --- */
    const collectEvalData = (status) => {
      const form = modal.querySelector('#coach-eval-form');
      const fd   = new FormData(form);
      const rating = +document.getElementById('overall-rating-val').value || 0;
      const rubric = {};
      ['confidence','fluency','grammar','vocabulary','pronunciation','delivery','logic','persuasiveness'].forEach(k => {
        rubric[k] = +(fd.get(`rubric_${k}`)||0);
      });
      const tags = ['outstanding','excellent','good','needs_improvement','recommended_advanced'].filter(t => fd.get(`tag_${t}`));
      return {
        assignmentId: asgId||'',
        learnerId:    learnerId||'',
        coachId:      coach?.id||'',
        coachName:    coach?.name||'Coach',
        topic:        asg?.topic || ev?.topic || '',
        debateType:   asg?.debateType || ev?.debateType || '',
        submittedAt:  asg?.submittedAt || ev?.submittedAt || '',
        position:     asg?.position || ev?.position || '',
        duration:     asg?.duration || ev?.duration || '',
        transcript:   transcript,
        overallRating: rating,
        rubric,
        strengths:          fd.get('strengths')||'',
        areasToImprove:     fd.get('areasToImprove')||'',
        communicationSkills:fd.get('communicationSkills')||'',
        bodyLanguage:       fd.get('bodyLanguage')||'',
        suggestions:        fd.get('suggestions')||'',
        finalRemarks:       fd.get('finalRemarks')||'',
        tags,
        status
      };
    };

    const showMsg = (msg, color='var(--emerald)') => {
      const el = document.getElementById('eval-save-msg');
      el.textContent = msg; el.style.color = color; el.style.display = 'block';
      setTimeout(() => el.style.display = 'none', 3000);
    };

    /* --- Save Draft --- */
    modal.querySelector('#btn-save-eval').addEventListener('click', () => {
      if (!window.AIDebateAuth.hasPermission('CREATE_COACH_FEEDBACK') && !window.AIDebateAuth.hasPermission('UPDATE_COACH_FEEDBACK')) {
        window.showToast('Access Denied: You do not have permission to save feedback drafts.', 'warning');
        return;
      }
      const data = collectEvalData('Saved');
      if (evalId && ev) {
        window.AIDebateDB.updateCoachEvaluation(evalId, data);
      } else {
        const saved = window.AIDebateDB.addCoachEvaluation(data);
        evalId = saved.id; // update reference for subsequent publish
      }
      showMsg('✅ Draft saved successfully!');
      if (typeof window.EvaluatedVaultModule._refresh === 'function') window.EvaluatedVaultModule._refresh();
    });

    /* --- Publish --- */
    modal.querySelector('#btn-publish-eval').addEventListener('click', () => {
      if (!window.AIDebateAuth.hasPermission('PUBLISH_COACH_FEEDBACK')) {
        window.showToast('Access Denied: You do not have permission to publish feedback.', 'warning');
        return;
      }
      const data = collectEvalData('Published');
      let savedEvalId = evalId;
      if (evalId && ev) {
        window.AIDebateDB.updateCoachEvaluation(evalId, data);
      } else {
        const saved = window.AIDebateDB.addCoachEvaluation(data);
        savedEvalId = saved.id;
      }
      window.AIDebateDB.publishCoachEvaluation(savedEvalId);
      showMsg('🚀 Feedback published! Learner notified in real-time.');
      // Real-time: dispatch update event
      window.dispatchEvent(new CustomEvent('aidebate:coachfeedback', { detail: { learnerId, evalId: savedEvalId } }));
      setTimeout(() => modal.remove(), 1500);
    });
  },

  _refresh() {
    const container = document.getElementById('main-content-area');
    if (container) {
      container.innerHTML = this.render();
      this.bindEvents(container);
    }
  }
};

/* ============================================================
 *  LEARNER: COACH FEEDBACK PANEL  (shown in learner portal)
 * ============================================================ */
window.CoachFeedbackLearnerModule = {
  render() {
    const user    = window.AIDebateAuth?.currentUser;
    if (!user) return '<div class="module-container"><p style="color:var(--text-muted);">Not authenticated.</p></div>';
    const feedbacks = window.AIDebateDB.getPublishedEvalsForLearner(user.id);
    const unread    = window.AIDebateDB.getUnreadNotifications(user.id).filter(n => n.type === 'coach_feedback');

    if (!feedbacks.length) return `
      <div class="module-container" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:340px;gap:16px;">
        <div style="font-size:3rem;">📝</div>
        <h3 style="font-weight:800;color:var(--text-main);">No Coach Feedback Yet</h3>
        <p style="color:var(--text-muted);font-size:0.9rem;text-align:center;max-width:400px;">Your coach will review your submitted debates and publish feedback here. Check back after submitting an assignment.</p>
      </div>`;

    window.AIDebateDB.markAllNotificationsRead(user.id);

    return `
    <div class="module-container" style="padding:0;">
      <div style="background:var(--surface-glass);border-bottom:1px solid var(--border-glass);padding:20px 28px;">
        <h1 style="font-size:1.35rem;font-weight:800;margin:0;">📝 Coach Feedback</h1>
        <p style="margin:4px 0 0;color:var(--text-muted);font-size:0.85rem;">${feedbacks.length} published evaluations · Read-only</p>
        ${unread.length ? `<div style="margin-top:8px;padding:8px 14px;background:rgba(6,182,212,.1);border-radius:8px;color:var(--cyan);font-size:0.82rem;">🔔 ${unread.length} new feedback notification${unread.length>1?'s':''}</div>` : ''}
      </div>
      <div style="padding:20px 28px;display:flex;flex-direction:column;gap:18px;">
        ${feedbacks.map(ev => this._feedbackCard(ev)).join('')}
      </div>
    </div>`;
  },

  _feedbackCard(ev) {
    const ratingColor = ev.overallRating >= 8 ? 'var(--emerald)' : ev.overallRating >= 6 ? 'var(--amber)' : 'var(--rose)';
    const rubricHTML  = ev.rubric ? Object.entries(ev.rubric).map(([k,v]) => `
      <div style="display:flex;align-items:center;gap:10px;padding:4px 0;">
        <div style="width:120px;font-size:0.78rem;color:var(--text-muted);text-transform:capitalize;">${k.replace(/([A-Z])/g,' $1')}</div>
        <div style="flex:1;background:rgba(255,255,255,.06);height:5px;border-radius:4px;">
          <div style="background:var(--grad-primary);height:5px;border-radius:4px;width:${v}%;"></div>
        </div>
        <div style="font-size:0.78rem;font-weight:700;color:var(--cyan);width:32px;">${v}%</div>
      </div>`).join('') : '';

    return `
    <div class="glass-card" style="padding:0;overflow:hidden;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,rgba(6,182,212,.12),rgba(139,92,246,.08));padding:18px 22px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px;">
        <div>
          <div style="font-weight:800;font-size:1rem;">${ev.topic||'Debate Evaluation'}</div>
          <div style="font-size:0.78rem;color:var(--text-muted);margin-top:3px;">Coach: ${ev.coachName||'—'} · Published: ${ev.publishedAt||ev.evaluatedAt||'—'} · ${ev.debateType||''}</div>
        </div>
        <div style="display:flex;align-items:center;gap:12px;">
          ${(ev.tags||[]).map(t => `<span style="background:rgba(6,182,212,.12);color:var(--cyan);padding:3px 10px;border-radius:10px;font-size:0.75rem;font-weight:700;">${t}</span>`).join('')}
          <div style="text-align:center;">
            <div style="font-size:2rem;font-weight:900;color:${ratingColor};">${ev.overallRating||0}</div>
            <div style="font-size:0.7rem;color:var(--text-muted);">/ 10</div>
          </div>
        </div>
      </div>
      <!-- Body -->
      <div style="padding:18px 22px;display:grid;grid-template-columns:1fr 1fr;gap:14px;">
        ${ev.strengths ? `<div class="glass-card" style="padding:12px;"><div style="font-weight:700;font-size:0.82rem;color:var(--emerald);margin-bottom:6px;">✅ Strengths</div><div style="font-size:0.83rem;line-height:1.7;">${ev.strengths}</div></div>` : ''}
        ${ev.areasToImprove ? `<div class="glass-card" style="padding:12px;"><div style="font-weight:700;font-size:0.82rem;color:var(--amber);margin-bottom:6px;">⚠️ Areas to Improve</div><div style="font-size:0.83rem;line-height:1.7;">${ev.areasToImprove}</div></div>` : ''}
        ${ev.suggestions ? `<div class="glass-card" style="padding:12px;"><div style="font-weight:700;font-size:0.82rem;color:var(--violet);margin-bottom:6px;">💡 Suggestions</div><div style="font-size:0.83rem;line-height:1.7;">${ev.suggestions}</div></div>` : ''}
        ${ev.finalRemarks ? `<div class="glass-card" style="padding:12px;"><div style="font-weight:700;font-size:0.82rem;color:var(--cyan);margin-bottom:6px;">📌 Final Remarks</div><div style="font-size:0.83rem;line-height:1.7;">${ev.finalRemarks}</div></div>` : ''}
        ${rubricHTML ? `<div class="glass-card" style="padding:12px;grid-column:1/-1;"><div style="font-weight:700;font-size:0.82rem;color:var(--cyan);margin-bottom:10px;">📊 Detailed Scores</div>${rubricHTML}</div>` : ''}
      </div>
      <div style="padding:10px 22px;background:rgba(255,255,255,.02);font-size:0.75rem;color:var(--text-muted);">🔒 Read-only — Coach evaluation is final. Contact your coach for queries.</div>
    </div>`;
  }
};

/* ============================================================
 *  NOTIFICATION BELL COMPONENT (for learner nav)
 * ============================================================ */
window.NotificationBell = {
  render(userId) {
    const count = window.AIDebateDB.getUnreadNotifications(userId).length;
    return `<div id="notif-bell" style="position:relative;cursor:pointer;" title="Notifications">
      <span style="font-size:1.3rem;">🔔</span>
      ${count > 0 ? `<span style="position:absolute;top:-4px;right:-4px;background:var(--rose);color:#fff;border-radius:50%;width:18px;height:18px;font-size:0.65rem;font-weight:900;display:flex;align-items:center;justify-content:center;">${count}</span>` : ''}
    </div>`;
  },
  bindRefresh(userId) {
    window.addEventListener('aidebate:notification', (e) => {
      if (e.detail.userId === userId) {
        const bell = document.getElementById('notif-bell');
        if (bell) bell.outerHTML = this.render(userId);
      }
    });
  }
};
