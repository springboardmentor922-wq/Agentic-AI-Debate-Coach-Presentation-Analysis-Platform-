/* ==========================================================================
   AI DEBATE COACH - FEEDBACK SYSTEM MODULE (feedback-module.js)
   ========================================================================== */

(function () {
  window.FeedbackModule = {
    renderLearnerFeedback() {
      const user = window.AIDebateAuth.currentUser;
      if (!user) return '<div class="glass-panel" style="padding: 24px;">Please sign in.</div>';

      const myFeedbacks = window.AIDebateDB.getFeedbacksForLearner(user.id);

      return `
        <div class="dash-header">
          <div>
            <h1>Feedback & Review Submissions</h1>
            <p style="color: var(--text-muted); font-size: 0.95rem;">Submit feedback on your AI debate coaching experience. Your inputs are visible to your assigned Educators.</p>
          </div>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1.2fr; gap: 28px; margin-bottom: 32px;">
          <!-- Submission Form Card -->
          <div class="glass-panel" style="padding: 24px;">
            <h2 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 16px;">Submit New Feedback</h2>

            <form id="learner-feedback-form">
              <div class="form-group">
                <label>Platform Experience Rating</label>
                <div style="display: flex; gap: 12px; margin-top: 6px;" id="rating-star-group">
                  <button type="button" class="btn-secondary rating-star-btn active" data-rating="5">⭐⭐⭐⭐⭐ (5/5)</button>
                  <button type="button" class="btn-secondary rating-star-btn" data-rating="4">⭐⭐⭐⭐ (4/5)</button>
                  <button type="button" class="btn-secondary rating-star-btn" data-rating="3">⭐⭐⭐ (3/5)</button>
                </div>
              </div>

              <div class="form-group">
                <label>Feedback Message & Coaching Experience</label>
                <textarea id="feedback-message-text" class="form-input" style="width: 100%; height: 120px; resize: vertical;" placeholder="Share your experience with AI speech analysis, fallacy detection, or coach reviews..." required></textarea>
              </div>

              <button type="submit" class="gradient-btn" style="width: 100%; justify-content: center; margin-top: 10px;">
                💬 Send Feedback to Educator Panel
              </button>
            </form>
          </div>

          <!-- Submitted Feedback History -->
          <div class="glass-panel" style="padding: 24px;">
            <h2 style="font-size: 1.2rem; font-weight: 800; margin-bottom: 16px;">Your Feedback History</h2>
            
            <div id="learner-feedback-list" style="display: flex; flex-direction: column; gap: 14px; max-height: 400px; overflow-y: auto;">
              ${myFeedbacks.length === 0 ? `
                <div style="text-align: center; color: var(--text-muted); padding: 40px 20px;">
                  📌 You have not submitted any feedback yet. Share your experience above!
                </div>
              ` : myFeedbacks.map(f => `
                <div class="glass-card" style="padding: 16px;">
                  <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                    <span style="font-weight: 700; color: var(--cyan);">${'⭐'.repeat(f.rating)} (${f.rating}/5)</span>
                    <span style="font-size: 0.78rem; color: var(--text-dim);">${f.date}</span>
                  </div>
                  <p style="font-size: 0.88rem; color: var(--text-main); line-height: 1.5;">"${f.message}"</p>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
    },

    bindLearnerFeedbackEvents() {
      let selectedRating = 5;
      const starBtns = document.querySelectorAll('.rating-star-btn');
      starBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
          starBtns.forEach(b => b.classList.remove('active'));
          e.currentTarget.classList.add('active');
          selectedRating = parseInt(e.currentTarget.getAttribute('data-rating'), 10);
        });
      });

      const form = document.getElementById('learner-feedback-form');
      if (form) {
        form.addEventListener('submit', (e) => {
          e.preventDefault();
          const user = window.AIDebateAuth.currentUser;
          const msg = document.getElementById('feedback-message-text').value.trim();
          if (!msg) return;

          window.AIDebateDB.addFeedback({
            learnerId: user.id,
            learnerName: user.name,
            learnerEmail: user.email,
            rating: selectedRating,
            message: msg
          });

          if (window.showToast) window.showToast('Feedback submitted successfully and sent to Educator Panel!', 'success');
          
          // Re-render view
          const main = document.getElementById('app-main');
          if (main) {
            main.innerHTML = `<div class="dashboard-container">${window.renderSidebar()}<div class="dashboard-main">${this.renderLearnerFeedback()}</div></div>`;
            this.bindLearnerFeedbackEvents();
            if (window.bindSidebarEvents) window.bindSidebarEvents();
          }
        });
      }
    },

    renderEducatorFeedbackDashboard() {
      const allFeedbacks = window.AIDebateDB.getFeedbacks();

      return `
        <div class="dash-header">
          <div>
            <h1>Educator Feedback Dashboard</h1>
            <p style="color: var(--text-muted); font-size: 0.95rem;">Review student reviews, platform ratings, and coaching satisfaction feedback.</p>
          </div>
        </div>

        <div class="glass-panel" style="padding: 24px; margin-bottom: 32px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; flex-wrap: wrap; gap: 12px;">
            <div style="display: flex; gap: 12px;">
              <input type="text" id="educator-fb-search" class="form-input" placeholder="Search by learner name or email..." style="width: 280px;" />
              <select id="educator-fb-filter-rating" class="form-select">
                <option value="all">All Ratings</option>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars & Below</option>
              </select>
            </div>
            <span style="font-size: 0.88rem; color: var(--text-muted);">Total Submissions: <strong style="color: var(--cyan);">${allFeedbacks.length}</strong></span>
          </div>

          <div class="table-wrapper">
            <table class="data-table" id="educator-feedback-table">
              <thead>
                <tr>
                  <th>Learner Name</th>
                  <th>Email Address</th>
                  <th>Submitted Date</th>
                  <th>Rating</th>
                  <th>Feedback Message</th>
                </tr>
              </thead>
              <tbody>
                ${allFeedbacks.length === 0 ? `
                  <tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 30px;">No student feedbacks found.</td></tr>
                ` : allFeedbacks.map(f => `
                  <tr>
                    <td><strong>${f.learnerName}</strong></td>
                    <td style="color: var(--text-muted);">${f.learnerEmail}</td>
                    <td style="color: var(--text-dim);">${f.date}</td>
                    <td><span style="color: var(--amber); font-weight: 700;">${'⭐'.repeat(f.rating)} (${f.rating}/5)</span></td>
                    <td style="max-width: 360px;">${f.message}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    },

    bindEducatorFeedbackEvents() {
      const searchInput = document.getElementById('educator-fb-search');
      const ratingFilter = document.getElementById('educator-fb-filter-rating');

      const filterTable = () => {
        const query = (searchInput?.value || '').toLowerCase();
        const rating = ratingFilter?.value || 'all';
        const rows = document.querySelectorAll('#educator-feedback-table tbody tr');

        rows.forEach(r => {
          const text = r.innerText.toLowerCase();
          const matchSearch = text.includes(query);
          let matchRating = true;
          if (rating !== 'all') {
            matchRating = text.includes(`(${rating}/5)`);
          }
          r.style.display = (matchSearch && matchRating) ? '' : 'none';
        });
      };

      if (searchInput) searchInput.addEventListener('input', filterTable);
      if (ratingFilter) ratingFilter.addEventListener('change', filterTable);
    }
  };
})();
