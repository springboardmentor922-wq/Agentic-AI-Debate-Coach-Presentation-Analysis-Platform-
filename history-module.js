/* ==========================================================================
   AI DEBATE COACH - HISTORY MODULE & EXACT SPEECH EXPORTER (history-module.js)
   ========================================================================== */

(function () {
  window.HistoryModule = {
    activeTab: 'practice',

    render() {
      const user = window.AIDebateAuth.currentUser;
      if (!user) return '<div class="glass-panel" style="padding:24px;">Please sign in.</div>';

      const practiceList = window.AIDebateDB.getPracticeHistory(user.id);
      const asgList = window.AIDebateDB.getAssignmentsForLearner(user.id);

      return `
        <div class="dash-header">
          <div>
            <h1>Debate & Session History</h1>
            <p style="color: var(--text-muted); font-size: 0.95rem;">Review your exact spoken speeches, AI coaching feedback, and official export reports.</p>
          </div>
          <div style="display: flex; gap: 10px;">
            <button id="btn-export-pdf-hist" class="gradient-btn">📥 Export PDF Report</button>
            <button id="btn-export-excel-hist" class="btn-secondary">📊 Export Excel / CSV</button>
          </div>
        </div>

        <!-- Filter Tabs -->
        <div class="auth-tabs" style="margin-bottom: 24px;">
          <button class="auth-tab ${this.activeTab === 'practice' ? 'active' : ''}" id="tab-hist-practice">🎙️ Practice History (${practiceList.length})</button>
          <button class="auth-tab ${this.activeTab === 'assignment' ? 'active' : ''}" id="tab-hist-asg">📝 Assignment History (${asgList.length})</button>
        </div>

        <div class="glass-panel" style="padding: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
            <input type="text" id="hist-search-input" class="form-input" placeholder="Search spoken text or debate topic..." style="width: 320px;" />
            <span style="font-size: 0.85rem; color: var(--text-muted);">Showing records for: <strong style="color: var(--cyan);">${user.name}</strong></span>
          </div>

          <div class="table-wrapper">
            <table class="data-table" id="history-data-table">
              <thead>
                <tr>
                  <th style="width: 130px;">Session Date</th>
                  <th style="width: 280px;">Topic & Your Spoken Speech</th>
                  <th style="width: 90px;">Duration</th>
                  <th style="width: 100px;">Overall Score</th>
                  <th style="width: 140px;">Fallacies Found</th>
                  <th>AI Coaching Feedback for Your Speech</th>
                  <th style="width: 80px;">Report</th>
                </tr>
              </thead>
              <tbody>
                ${this.activeTab === 'practice' ? this.renderPracticeRows(practiceList) : this.renderAssignmentRows(asgList)}
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    renderPracticeRows(list) {
      if (!list || list.length === 0) {
        return `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">No practice session history recorded yet. Complete a speech in the Practice Studio!</td></tr>`;
      }

      return list.map(item => `
        <tr>
          <td style="color: var(--text-dim); font-size: 0.85rem;">${item.date}</td>
          <td>
            <div style="font-weight: 700; font-size: 0.88rem; color: var(--text-main); margin-bottom: 4px;">${item.topic}</div>
            <span class="badge-severity" style="background: rgba(6,182,212,0.15); color: var(--cyan); font-size: 0.72rem;">${item.debateType || 'Lincoln-Douglas'}</span>
            <div style="margin-top: 8px; padding: 6px 10px; background: rgba(0,0,0,0.3); border-radius: 6px; font-size: 0.83rem; color: var(--text-cyan); border-left: 2px solid var(--cyan);">
              💬 <strong>What You Spoke:</strong><br>
              <em>"${item.transcript.length > 90 ? item.transcript.substring(0, 90) + '...' : item.transcript}"</em>
            </div>
          </td>
          <td style="font-family: monospace; font-size: 0.88rem;">${item.duration}</td>
          <td><span style="font-size: 1.15rem; font-weight: 900; color: var(--cyan);">${item.score} / 100</span></td>
          <td>
            ${(item.fallaciesFound && item.fallaciesFound.length > 0)
              ? item.fallaciesFound.map(f => `<span class="badge-severity severity-${f.severity}" style="display: inline-block; margin-bottom: 3px;">${f.name}</span>`).join(' ')
              : '<span class="badge-severity" style="background: rgba(16,185,129,0.2); color: var(--emerald);">Clean Logic</span>'}
          </td>
          <td style="font-size: 0.85rem; color: var(--text-main); line-height: 1.6;">
            ${item.aiFeedbackClean ? item.aiFeedbackClean : item.aiFeedback}
          </td>
          <td>
            <button class="btn-secondary" style="padding: 4px 8px; font-size: 0.78rem;" onclick="HistoryModule.downloadIndividualReport('${item.id}')">PDF</button>
          </td>
        </tr>
      `).join('');
    },

    renderAssignmentRows(list) {
      if (!list || list.length === 0) {
        return `<tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 40px;">No educator assignments assigned yet.</td></tr>`;
      }

      return list.map(a => `
        <tr>
          <td style="color: var(--text-dim); font-size: 0.85rem;">${a.createdAt}</td>
          <td>
            <strong style="color: var(--text-main);">${a.title}</strong>
            <div style="font-size: 0.8rem; color: var(--text-muted);">${a.topic}</div>
          </td>
          <td style="font-family: monospace;">${a.duration}</td>
          <td><span style="font-size: 1.1rem; font-weight: 800; color: var(--purple);">${a.score ? a.score + ' / 100' : 'Pending'}</span></td>
          <td><span class="badge-severity" style="background: rgba(139,92,246,0.2); color: var(--purple);">${a.status}</span></td>
          <td style="font-size: 0.85rem; color: var(--text-muted);">${a.coachNotes || 'Under Educator Review'}</td>
          <td>
            <button class="btn-secondary" style="padding: 4px 8px; font-size: 0.78rem;" onclick="showToast('Exporting assignment summary...', 'info')">Export</button>
          </td>
        </tr>
      `).join('');
    },

    bindEvents() {
      document.getElementById('tab-hist-practice')?.addEventListener('click', () => {
        this.activeTab = 'practice';
        this.reRender();
      });
      document.getElementById('tab-hist-asg')?.addEventListener('click', () => {
        this.activeTab = 'assignment';
        this.reRender();
      });

      document.getElementById('btn-export-pdf-hist')?.addEventListener('click', () => {
        this.exportPDF();
      });

      document.getElementById('btn-export-excel-hist')?.addEventListener('click', () => {
        this.exportCSV();
      });

      const searchInput = document.getElementById('hist-search-input');
      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const q = e.target.value.toLowerCase();
          const rows = document.querySelectorAll('#history-data-table tbody tr');
          rows.forEach(r => {
            r.style.display = r.innerText.toLowerCase().includes(q) ? '' : 'none';
          });
        });
      }
    },

    reRender() {
      const main = document.getElementById('app-main');
      if (main) {
        main.innerHTML = `<div class="dashboard-container">${window.renderSidebar()}<div class="dashboard-main">${this.render()}</div></div>`;
        this.bindEvents();
        if (window.bindSidebarEvents) window.bindSidebarEvents();
      }
    },

    exportCSV() {
      const user = window.AIDebateAuth.currentUser;
      const practice = window.AIDebateDB.getPracticeHistory(user.id);
      
      let csvContent = "data:text/csv;charset=utf-8,Session Date,Topic,Format,Spoken Speech,Overall Score,Confidence,Fluency,Grammar,AI Feedback\n";
      practice.forEach(p => {
        const m = p.metrics || {};
        const cleanSpoken = (p.transcript || '').replace(/"/g, '""');
        const cleanFeedback = (p.aiFeedbackClean || p.aiFeedback || '').replace(/"/g, '""').replace(/<[^>]*>?/gm, '');
        csvContent += `"${p.date}","${p.topic}","${p.debateType || 'LD'}","${cleanSpoken}",${p.score || 85},${m.confidence || 90},${m.fluency || 85},${m.grammar || 92},"${cleanFeedback}"\n`;
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Debate_Speech_History_${user.name.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      if (window.showToast) window.showToast('CSV History downloaded successfully!', 'success');
    },

    exportPDF() {
      if (window.showToast) window.showToast('Preparing printable PDF report...', 'info');
      window.print();
    },

    downloadIndividualReport(id) {
      if (window.showToast) window.showToast(`Generating individual PDF report for session ${id}...`, 'success');
      window.print();
    }
  };
})();
