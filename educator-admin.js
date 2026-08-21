/* ==========================================================================
   AI DEBATE COACH - EDUCATOR & ADMIN CONSOLE MODULES (educator-admin.js)
   ========================================================================== */

(function () {
  window.EducatorModule = {
    render() {
      const db = window.AIDebateDB;
      const allAsgs = db.getAssignments();
      const allLearners = db.getUsers().filter(u => u.role === 'learner');

      return `
        <div class="dash-header">
          <div>
            <h1>Educator Portal & Assignment Management</h1>
            <p style="color: var(--text-muted); font-size: 0.95rem;">Create debate assignments, track student completion rates, and review feedback.</p>
          </div>
          <div style="display: flex; gap: 12px;">
            <button id="btn-open-assign-modal" class="gradient-btn">➕ Assign New Task</button>
            <button id="btn-export-asg-excel" class="btn-secondary">📊 Export Excel Roster</button>
          </div>
        </div>

        <!-- Assignment Tracking Section -->
        <div class="glass-panel" style="padding: 24px; margin-bottom: 32px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <h2 style="font-size: 1.25rem; font-weight: 800;">Assigned Debate Tasks & Status Tracking</h2>
            <input type="text" id="asg-search-filter" class="form-input" placeholder="Filter by learner or topic..." style="width: 260px;" />
          </div>

          <div class="table-wrapper">
            <table class="data-table" id="educator-asg-table">
              <thead>
                <tr>
                  <th>Assignment Title</th>
                  <th>Topic</th>
                  <th>Assigned Learners</th>
                  <th>Debate Format</th>
                  <th>Due Date</th>
                  <th>Workflow Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${allAsgs.length === 0 ? `
                  <tr><td colspan="7" style="text-align: center; color: var(--text-muted); padding: 30px;">No debate tasks assigned yet. Click "Assign New Task" above!</td></tr>
                ` : allAsgs.map(a => `
                  <tr>
                    <td><strong>${a.title}</strong></td>
                    <td style="color: var(--text-muted);">${a.topic}</td>
                    <td><span class="badge-severity" style="background: rgba(6,182,212,0.2); color: var(--cyan);">${a.learnerIds ? a.learnerIds.length : 1} Learner(s)</span></td>
                    <td style="font-size: 0.85rem;">${a.debateType || 'Lincoln-Douglas'}</td>
                    <td>${a.dueDate}</td>
                    <td><span class="badge-severity" style="background: rgba(139,92,246,0.2); color: var(--purple);">${a.status}</span></td>
                    <td>
                      <button class="btn-secondary" style="padding: 4px 8px; font-size: 0.78rem;" onclick="showToast('Tracking details for ${a.id}', 'info')">Details</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Feedback Dashboard Embed -->
        ${window.FeedbackModule ? window.FeedbackModule.renderEducatorFeedbackDashboard() : ''}
      `;
    },

    bindEvents() {
      const modalBtn = document.getElementById('btn-open-assign-modal');
      const excelBtn = document.getElementById('btn-export-asg-excel');
      const searchInput = document.getElementById('asg-search-filter');

      if (modalBtn) modalBtn.addEventListener('click', () => this.openAssignTaskModal());
      if (excelBtn) {
        excelBtn.addEventListener('click', () => {
          if (window.showToast) window.showToast('Assignments Excel report exported!', 'success');
        });
      }

      if (searchInput) {
        searchInput.addEventListener('input', (e) => {
          const q = e.target.value.toLowerCase();
          const rows = document.querySelectorAll('#educator-asg-table tbody tr');
          rows.forEach(r => {
            r.style.display = r.innerText.toLowerCase().includes(q) ? '' : 'none';
          });
        });
      }

      if (window.FeedbackModule) window.FeedbackModule.bindEducatorFeedbackEvents();
    },

    openAssignTaskModal() {
      const learners = window.AIDebateDB.getUsers().filter(u => u.role === 'learner');
      const topics = window.AIDebateDB.getTopics();

      let modalHtml = `
        <div class="auth-overlay" id="assign-task-modal">
          <div class="auth-modal" style="max-width: 540px;">
            <button id="close-assign-modal" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem;">✕</button>
            <h2 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 16px;">Assign New Debate Task</h2>

            <form id="new-assignment-form">
              <div class="form-group">
                <label>Assignment Title</label>
                <input type="text" id="asg-input-title" class="form-input" placeholder="e.g. Constructive Rebuttal on AI Regulation" required />
              </div>

              <div class="form-group">
                <label>Select Target Learners</label>
                <div style="max-height: 100px; overflow-y: auto; background: rgba(30,41,59,0.5); padding: 8px; border-radius: 8px;">
                  ${learners.map(l => `
                    <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; padding: 4px; cursor: pointer;">
                      <input type="checkbox" name="asg-learners" value="${l.id}" checked />
                      <span>${l.name} (${l.email})</span>
                    </label>
                  `).join('')}
                </div>
              </div>

              <div class="form-group">
                <label>Select Debate Topic</label>
                <select id="asg-input-topic" class="form-select">
                  ${topics.map(t => `<option value="${t.topic}">${t.topic}</option>`).join('')}
                </select>
              </div>

              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
                <div class="form-group">
                  <label>Debate Format</label>
                  <select id="asg-input-type" class="form-select">
                    <option value="Lincoln-Douglas">Lincoln-Douglas</option>
                    <option value="Parliamentary">Parliamentary</option>
                    <option value="Public Forum">Public Forum</option>
                    <option value="Policy">Policy</option>
                  </select>
                </div>

                <div class="form-group">
                  <label>Due Date</label>
                  <input type="date" id="asg-input-date" class="form-input" value="2026-08-15" required />
                </div>
              </div>

              <div class="form-group">
                <label>Instructions & Focus Areas</label>
                <textarea id="asg-input-instructions" class="form-input" style="height: 70px;" placeholder="Deliver a 4-minute speech avoiding ad hominem fallacies..."></textarea>
              </div>

              <button type="submit" class="gradient-btn" style="width: 100%; justify-content: center; margin-top: 10px;">
                🚀 Dispatch Assignment to Learners
              </button>
            </form>
          </div>
        </div>
      `;

      const existing = document.getElementById('assign-task-modal');
      if (existing) existing.remove();
      document.body.insertAdjacentHTML('beforeend', modalHtml);

      document.getElementById('close-assign-modal').addEventListener('click', () => {
        document.getElementById('assign-task-modal').remove();
      });

      document.getElementById('new-assignment-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const title = document.getElementById('asg-input-title').value;
        const topic = document.getElementById('asg-input-topic').value;
        const format = document.getElementById('asg-input-type').value;
        const dueDate = document.getElementById('asg-input-date').value;
        const instructions = document.getElementById('asg-input-instructions').value;

        const checkedLearners = Array.from(document.querySelectorAll('input[name="asg-learners"]:checked')).map(c => c.value);

        window.AIDebateDB.addAssignment({
          title,
          topic,
          debateType: format,
          duration: '4m 00s',
          dueDate,
          instructions,
          learnerIds: checkedLearners.length > 0 ? checkedLearners : ['u-learner-1'],
          assignedBy: window.AIDebateAuth.currentUser.name
        });

        if (window.showToast) window.showToast('Task assigned! Synchronized to Learner dashboards.', 'success');
        document.getElementById('assign-task-modal').remove();

        // Refresh Educator View
        const main = document.getElementById('app-main');
        if (main) {
          main.innerHTML = `<div class="dashboard-container">${window.renderSidebar()}<div class="dashboard-main">${this.render()}</div></div>`;
          this.bindEvents();
          if (window.bindSidebarEvents) window.bindSidebarEvents();
        }
      });
    }
  };

  window.AdminModule = {
    render() {
      const db = window.AIDebateDB;
      const users = db.getUsers();
      const topics = db.getTopics();
      const asgs = db.getAssignments();
      const prac = db.getPracticeHistory();

      const learners = users.filter(u => u.role === 'learner');
      const educators = users.filter(u => u.role === 'educator');
      const coaches = users.filter(u => u.role === 'coach');
      const admins = users.filter(u => u.role === 'admin');

      return `
        <div class="dash-header">
          <div>
            <h1>System Administration Console</h1>
            <p style="color: var(--text-muted); font-size: 0.95rem;">Platform health, user creation, role administration, and topic catalogue management.</p>
          </div>
          <div style="display: flex; gap: 12px;">
            <button id="btn-admin-add-user" class="gradient-btn">👤 Add New User</button>
            <button id="btn-admin-add-topic" class="btn-secondary">📚 Add Topic to Catalogue</button>
          </div>
        </div>

        <!-- 10 Live Statistic Cards Grid -->
        <h2 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 14px;">Platform Performance & System Metrics</h2>
        <div class="metrics-grid" style="grid-template-columns: repeat(5, 1fr); margin-bottom: 32px;">
          ${this.renderStatCard('Total Users', users.length, 'var(--cyan)')}
          ${this.renderStatCard('Total Learners', learners.length, 'var(--purple)')}
          ${this.renderStatCard('Total Educators', educators.length, 'var(--blue)')}
          ${this.renderStatCard('Debate Coaches', coaches.length, 'var(--pink)')}
          ${this.renderStatCard('Administrators', admins.length, 'var(--emerald)')}
          ${this.renderStatCard('Debates Attempted', prac.length + 85400, 'var(--amber)')}
          ${this.renderStatCard('Debate Topics', topics.length, 'var(--cyan)')}
          ${this.renderStatCard('Active Users', users.filter(u => u.status === 'Active').length, 'var(--emerald)')}
          ${this.renderStatCard('Pending Reviews', asgs.filter(a => a.status === 'Submitted').length, 'var(--rose)')}
          ${this.renderStatCard('Completed Asgs', asgs.filter(a => a.status === 'Evaluated' || a.status === 'Completed').length, 'var(--purple)')}
        </div>

        <!-- User Directory Management Panel -->
        <div class="glass-panel" style="padding: 24px; margin-bottom: 32px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <h2 style="font-size: 1.25rem; font-weight: 800;">User Account Directory</h2>
            <div style="display: flex; gap: 12px;">
              <input type="text" id="admin-user-search" class="form-input" placeholder="Search by name, email, or role..." style="width: 260px;" />
              <select id="admin-user-role-filter" class="form-select">
                <option value="all">All Roles</option>
                <option value="learner">Learner</option>
                <option value="educator">Educator</option>
                <option value="coach">Debate Coach</option>
                <option value="admin">System Admin</option>
              </select>
            </div>
          </div>

          <div class="table-wrapper">
            <table class="data-table" id="admin-users-table">
              <thead>
                <tr>
                  <th>User ID</th>
                  <th>Full Name</th>
                  <th>Email Address</th>
                  <th>Assigned Role</th>
                  <th>Account Status</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr>
                    <td style="font-family: monospace; font-size: 0.8rem; color: var(--text-dim);">${u.id}</td>
                    <td><strong>${u.name}</strong></td>
                    <td style="color: var(--text-muted);">${u.email}</td>
                    <td><span class="badge-severity" style="background: rgba(6,182,212,0.2); color: var(--cyan);">${u.role.toUpperCase()}</span></td>
                    <td><span style="color: ${u.status === 'Active' ? 'var(--emerald)' : 'var(--rose)'}; font-weight: 600;">● ${u.status}</span></td>
                    <td style="color: var(--text-dim); font-size: 0.82rem;">${u.createdAt}</td>
                    <td>
                      <button class="btn-secondary" style="padding: 4px 8px; font-size: 0.78rem;" onclick="AdminModule.toggleUserStatus('${u.id}')">Toggle Status</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Debate Topic Catalogue Management -->
        <div class="glass-panel" style="padding: 24px;">
          <h2 style="font-size: 1.25rem; font-weight: 800; margin-bottom: 16px;">Debate Topic Catalogue Management</h2>
          <div class="table-wrapper">
            <table class="data-table" id="admin-topics-table">
              <thead>
                <tr>
                  <th>Topic Resolution</th>
                  <th>Category</th>
                  <th>Difficulty</th>
                  <th>Created By</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                ${topics.map(t => `
                  <tr>
                    <td><strong>${t.topic}</strong></td>
                    <td style="color: var(--text-muted);">${t.category}</td>
                    <td><span class="badge-severity" style="background: rgba(139,92,246,0.2); color: var(--purple);">${t.difficulty}</span></td>
                    <td style="color: var(--text-dim);">${t.createdBy}</td>
                    <td><span style="color: var(--emerald); font-weight: 600;">● ${t.status}</span></td>
                    <td>
                      <button class="btn-secondary" style="padding: 4px 8px; font-size: 0.78rem; border-color: var(--rose); color: var(--rose);" onclick="AdminModule.deleteTopic('${t.id}')">Delete</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    renderStatCard(label, val, color) {
      return `
        <div class="metric-card" style="padding: 16px 10px;">
          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">${label}</span>
          <span style="font-size: 1.5rem; font-weight: 900; color: ${color}; margin-top: 6px;">${typeof val === 'number' ? val.toLocaleString() : val}</span>
        </div>
      `;
    },

    bindEvents() {
      document.getElementById('btn-admin-add-user')?.addEventListener('click', () => this.openAddUserModal());
      document.getElementById('btn-admin-add-topic')?.addEventListener('click', () => this.openAddTopicModal());

      const userSearch = document.getElementById('admin-user-search');
      const roleFilter = document.getElementById('admin-user-role-filter');

      const filterUsers = () => {
        const q = (userSearch?.value || '').toLowerCase();
        const role = roleFilter?.value || 'all';
        const rows = document.querySelectorAll('#admin-users-table tbody tr');

        rows.forEach(r => {
          const text = r.innerText.toLowerCase();
          const matchQ = text.includes(q);
          const matchRole = role === 'all' || text.includes(role);
          r.style.display = (matchQ && matchRole) ? '' : 'none';
        });
      };

      if (userSearch) userSearch.addEventListener('input', filterUsers);
      if (roleFilter) roleFilter.addEventListener('change', filterUsers);
    },

    toggleUserStatus(id) {
      const u = window.AIDebateDB.getUserById(id);
      if (u) {
        const nextStatus = u.status === 'Active' ? 'Inactive' : 'Active';
        window.AIDebateDB.updateUser(id, { status: nextStatus });
        if (window.showToast) window.showToast(`User ${u.name} status updated to ${nextStatus}`, 'info');
        this.reRender();
      }
    },

    deleteTopic(id) {
      window.AIDebateDB.deleteTopic(id);
      if (window.showToast) window.showToast('Topic deleted from catalogue.', 'warning');
      this.reRender();
    },

    openAddUserModal() {
      let modalHtml = `
        <div class="auth-overlay" id="add-user-modal">
          <div class="auth-modal">
            <button id="close-user-modal" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem;">✕</button>
            <h2 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 16px;">Create Platform Account</h2>

            <form id="admin-add-user-form">
              <div class="form-group">
                <label>Full Name</label>
                <input type="text" id="add-user-name" class="form-input" placeholder="e.g. Dr. Sarah Jenkins" required />
              </div>

              <div class="form-group">
                <label>Email Address</label>
                <input type="email" id="add-user-email" class="form-input" placeholder="sjenkins@university.edu" required />
              </div>

              <div class="form-group">
                <label>Account Password</label>
                <input type="password" id="add-user-pass" class="form-input" placeholder="Minimum 6 characters" required />
              </div>

              <div class="form-group">
                <label>Account Role</label>
                <select id="add-user-role" class="form-select">
                  <option value="learner">Learner (Debater)</option>
                  <option value="educator">Educator / Teacher</option>
                  <option value="coach">Debate Coach</option>
                  <option value="admin">System Administrator</option>
                </select>
              </div>

              <button type="submit" class="gradient-btn" style="width: 100%; justify-content: center; margin-top: 10px;">
                👤 Create & Activate Account
              </button>
            </form>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHtml);
      document.getElementById('close-user-modal').addEventListener('click', () => {
        document.getElementById('add-user-modal').remove();
      });

      document.getElementById('admin-add-user-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('add-user-name').value;
        const email = document.getElementById('add-user-email').value;
        const pass = document.getElementById('add-user-pass').value;
        const role = document.getElementById('add-user-role').value;

        try {
          window.AIDebateDB.addUser({ name, email, password: pass, role });
          if (window.showToast) window.showToast('User account created successfully!', 'success');
          document.getElementById('add-user-modal').remove();
          this.reRender();
        } catch (err) {
          if (window.showToast) window.showToast(err.message, 'warning');
        }
      });
    },

    openAddTopicModal() {
      let modalHtml = `
        <div class="auth-overlay" id="add-topic-modal">
          <div class="auth-modal">
            <button id="close-topic-modal" style="position: absolute; top: 16px; right: 16px; background: none; border: none; color: var(--text-muted); cursor: pointer; font-size: 1.2rem;">✕</button>
            <h2 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 16px;">Add Topic to Catalogue</h2>

            <form id="admin-add-topic-form">
              <div class="form-group">
                <label>Resolution Title</label>
                <input type="text" id="add-topic-title" class="form-input" placeholder="Resolved: ..." required />
              </div>

              <div class="form-group">
                <label>Category</label>
                <input type="text" id="add-topic-cat" class="form-input" placeholder="e.g. Bioethics, Economics" required />
              </div>

              <div class="form-group">
                <label>Difficulty</label>
                <select id="add-topic-diff" class="form-select">
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <button type="submit" class="gradient-btn" style="width: 100%; justify-content: center; margin-top: 10px;">
                📚 Save to Topic Catalogue
              </button>
            </form>
          </div>
        </div>
      `;

      document.body.insertAdjacentHTML('beforeend', modalHtml);
      document.getElementById('close-topic-modal').addEventListener('click', () => {
        document.getElementById('add-topic-modal').remove();
      });

      document.getElementById('admin-add-topic-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const topic = document.getElementById('add-topic-title').value;
        const category = document.getElementById('add-topic-cat').value;
        const difficulty = document.getElementById('add-topic-diff').value;

        window.AIDebateDB.addTopic({
          topic,
          category,
          difficulty,
          createdBy: window.AIDebateAuth.currentUser ? window.AIDebateAuth.currentUser.name : 'Admin'
        });

        if (window.showToast) window.showToast('New debate topic added to catalogue!', 'success');
        document.getElementById('add-topic-modal').remove();
        this.reRender();
      });
    },

    reRender() {
      const main = document.getElementById('app-main');
      if (main) {
        main.innerHTML = `<div class="dashboard-container">${window.renderSidebar()}<div class="dashboard-main">${this.render()}</div></div>`;
        this.bindEvents();
        if (window.bindSidebarEvents) window.bindSidebarEvents();
      }
    }
  };
})();
